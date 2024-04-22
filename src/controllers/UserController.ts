import { Request, Response, NextFunction } from "express";
import UserDTO from "../dtos/userDTO";
import UserService from "../services/UserService";
import { StatusCodes } from "http-status-codes";

class UserController {
  public static async logIn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const email: string = req.body.email;
      const password: string = req.body.password;
      const result: {success: boolean, id: string} = await UserService.logIn(email, password);

      if (result.success) {
        res.status(StatusCodes.OK).json({message:"User logged in successfully", id: result.id});
      }
    } catch (error: any) {
      console.error(error.message);
      switch (error.message) {
        case "User not found":
          res.status(StatusCodes.NOT_FOUND).json({message: "User not found"});
          break;
        case "Invalid password":
          res.status(StatusCodes.UNAUTHORIZED).json({message: "Invalid password"});
          break;
        case "Gender not found":
          res.status(StatusCodes.BAD_REQUEST).json({message: "Gender not found"});
        default:
          res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({message: "Internal Server Error"});
      }
    }
  }

  public static async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id: string = req.params.id;
    const success: boolean = await UserService.deleteUser(id);
    if (success) {
      res.status(StatusCodes.OK).json({message: "User deleted successfully"});
    } else {
      res.status(StatusCodes.NOT_FOUND).json({message: "User not found"});
    }
  }

  public static async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await UserService.getAllUsers();
      res.status(StatusCodes.OK).json(users);
    } catch (error:any) {
      console.error(error.message);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({message: "Internal Server Error"});
    }
  }

  public static async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user: UserDTO = req.body;
      const createdUser = await UserService.createUser(user);
      res.status(StatusCodes.CREATED).json(createdUser);
    } catch (error: any) {
      console.log(error.message);
      switch (error.message) {
        case "Invalid email address":
          res.status(StatusCodes.BAD_REQUEST).json({message: "Invalid email address"});
          break;
        case "Email already exists":
          res.status(StatusCodes.BAD_REQUEST).json({message: "Email already exists"});
          break;
        case "Role not found":
          res.status(StatusCodes.BAD_REQUEST).json({message: "Role not found"});
          break;
        case "Student data is required":
          res.status(StatusCodes.BAD_REQUEST).json({message: "Student data is required"});
          break;
        default:
          res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({message: "Internal Server Error"});
      }
    }
  }
}

export default UserController;
