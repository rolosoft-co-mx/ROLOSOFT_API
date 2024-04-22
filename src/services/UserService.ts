import UserDTO from "../dtos/userDTO";
import Gender from "../models/Gender";
import User from "../models/User";
import { isValidEmail } from "../utils/inputValidation";
import bcrypt from "bcryptjs";
import Roles from "../models/Roles";
import StudentService from "./StudentService";
import { sequelize } from "../config/db";
import Student from "../models/Student";
import StudentDTO from "../dtos/studentDTO";

class UserService {
  public static async deleteUser(id: string): Promise<boolean> {
    const deletedRows: number = await User.destroy({ where: { id: id } });
    if (deletedRows > 0) {
      return true;
    } else {
      return false;
    }
  }

  public static async getAllUsers(): Promise<any[]> {
    const users = await User.findAll({
      include: Gender,
      attributes: {
        exclude: [
          "password",
          "gender",
          "photo",
          "address",
          "createdAt",
          "updatedAt",
          "deletedAt",
        ],
      },
    });
    const usersDTO: UserDTO[] = users.map((user: User) => {
      return {
        id: user.id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        birthDate: user.birthDate,
        password: "****",
        gender: user.Gender.name,
        role: user.role,
      };
    });
    return usersDTO;
  }

  public static async createUser(user: UserDTO): Promise<UserDTO> {
    if (!(await isValidEmail(user.email))) {
      throw new Error("Invalid email address");
    }

    const isUnique: boolean = (await User.findOne({
      where: { email: user.email },
    }))
      ? false
      : true;
    if (!isUnique) {
      throw new Error("Email already exists");
    }

    const salt: string = await bcrypt.genSalt(10);
    const hashedPassword: string = await bcrypt.hash(user.password, salt);
    user.password = hashedPassword;

    let gender: Gender | null;

    gender = await Gender.findOne({
      where: { name: user.gender },
    });

    if (gender === null) {
      throw new Error("Gender not found");
    }

    // CHECK if role is in enum
    if (!(user.role in Roles)) {
      throw new Error("Role not found");
    }

    const result: UserDTO = await sequelize.transaction(async (t) => {
      let createdUser = await User.create({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: user.password,
        birthDate: user.birthDate,
        phone: user.phone,
        role: user.role,
        genderId: gender.id,
      },
      { transaction: t });

      let userDTO: UserDTO = {
        id: createdUser.id.toString(),
        firstName: createdUser.firstName,
        lastName: createdUser.lastName,
        email: createdUser.email,
        phone: createdUser.phone,
        birthDate: createdUser.birthDate,
        password: "****",
        gender: (await createdUser.getGender()).name,
        role: createdUser.role,
      };

      //CREATE A STUDENT
      if (user.role === Roles.student) {
        if (!user.student) {
          throw new Error("Student data is required");
        }
        const createdStudent: Student = await StudentService.createStudent(createdUser.id, user.student, t);
        const studentDTO: StudentDTO = {
          school: createdStudent.school,
          fieldPosition: createdStudent.fieldPosition,
          shirtNumber: createdStudent.shirtNumber,
          team: createdStudent.team,
          CURP: createdStudent.CURP,
          IMSS: createdStudent.IMSS,
        };
        userDTO.student = studentDTO;
      }
      
      return userDTO;
    })

    return result;
  }

  public static async logIn(
    email: string,
    password: string
  ): Promise<{ success: boolean; id: string }> {
    const user: User | null = await User.findOne({ where: { email: email } });
    if (!user) {
      throw new Error("User not found");
    }

    const isPasswordValid: boolean = await bcrypt.compare(
      password,
      user.password
    );
    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }
    return { success: true, id: user.id.toString() };
  }
}

export default UserService;
