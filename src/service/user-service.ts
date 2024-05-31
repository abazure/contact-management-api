import { prismaClient } from "../application/database";
import { ResponseError } from "../error/response-error";
import { Validation } from "../helper/validation";
import {
  CreateUserRequest,
  UserResponse,
  toUserResponse,
} from "../model/user-model";
import { UserValidation } from "../validation/user-validation";
import bcrypt from "bcrypt";

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
}
