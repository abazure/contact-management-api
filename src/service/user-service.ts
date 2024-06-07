import { prismaClient } from "../application/database";
import { ResponseError } from "../error/response-error";
import { Validation } from "../helper/validation";
import {
  CreateUserRequest,
  LoginUserRequest,
  UpdateUserRequest,
  UserResponse,
  toUserResponse,
} from "../model/user-model";
import { UserValidation } from "../validation/user-validation";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { User } from "@prisma/client";

export class UserService {
  static async register(request: CreateUserRequest): Promise<UserResponse> {
    const registerRequest = Validation.validate(
      UserValidation.REGISTER,
      request
    );

    const userInDatabase = await prismaClient.user.count({
      where: {
        username: registerRequest.username,
      },
    });

    if (userInDatabase != 0) {
      throw new ResponseError(409, "Username Already Exist");
    }

    registerRequest.password = await bcrypt.hash(registerRequest.password, 10);
    const user = await prismaClient.user.create({
      data: registerRequest,
    });
    return toUserResponse(user);
  }

  static async login(request: LoginUserRequest): Promise<UserResponse> {
    const loginRequest = Validation.validate(UserValidation.LOGIN, request);
    const userInDatabase = await prismaClient.user.findUnique({
      where: {
        username: loginRequest.username,
      },
    });
    if (!userInDatabase) {
      throw new ResponseError(401, "Username or password is wrong");
    }

    const isPasswordValid = await bcrypt.compare(
      loginRequest.password,
      userInDatabase.password
    );
    if (!isPasswordValid) {
      throw new ResponseError(401, "Username or password is wrong");
    }

    const token = jwt.sign(
      {
        username: userInDatabase.username,
      },
      "secret",
      { expiresIn: "1h" }
    );

    const response = toUserResponse(userInDatabase);
    response.token = token;
    return response;
  }

  static async get(request: string): Promise<UserResponse> {
    const user = await prismaClient.user.findUnique({
      where: {
        username: request,
      },
      select: {
        name: true,
        username: true,
      },
    });
    return toUserResponse(user as User);
  }
  static async update(
    user: string,
    request: UpdateUserRequest
  ): Promise<UserResponse> {
    const userRequest = Validation.validate(UserValidation.UPDATE, request);
    const userInDatabase = await prismaClient.user.findUnique({
      where: {
        username: user,
      },
    });
    if (!userInDatabase) {
      throw new ResponseError(404, "User not Found");
    }
    const updatedData: any = {};
    if (userRequest.name) {
      updatedData.name = userRequest.name;
    }

    if (userRequest.password) {
      updatedData.password = await bcrypt.hash(userRequest.password, 10);
    }
    console.log(updatedData);
    const result = await prismaClient.user.update({
      where: {
        username: user,
      },
      data: updatedData,
    });
    console.log(result);
    return toUserResponse(result);
  }
}
