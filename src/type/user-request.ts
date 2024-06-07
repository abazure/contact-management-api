import { Request } from "express";

export interface UserRequest extends Request {
  user?: string;
}

export interface UserPayload {
  name: string;
  username: string;
}
