import { prismaClient } from "../application/database";
import { ResponseError } from "../error/response-error";
import { Validation } from "../helper/validation";
import {
  CreateUserRequest,
  LoginUserRequest,
  UserResponse,
  toUserResponse,
} from "../model/user-model";
import { UserValidation } from "../validation/user-validation";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";

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
        nama: userInDatabase.name,
        username: userInDatabase.username,
      },
      "secret",
      { expiresIn: "1h" }
    );

    const response = toUserResponse(userInDatabase);
    response.token = token;
    return response;
  }
}
