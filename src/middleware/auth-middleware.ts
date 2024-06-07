import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserRequest } from "../type/user-request";

export const authMiddleware = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, "secret") as { username: string };
      req.user = decoded.username;
      next();
    } catch (err) {
      res.status(401).json({
        errors: "Unauthorized",
      });
    }
  } else {
    res.status(401).json({
      errors: "Unauthorized",
    });
  }
};
