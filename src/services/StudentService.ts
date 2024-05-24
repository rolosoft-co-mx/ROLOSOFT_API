import { UUID } from "crypto";
import StudentDTO from "../dtos/studentDTO";
import Student from "../models/Student";
import { Op, Transaction, where } from "sequelize";
import TeamService from "./TeamService";
import Team from "../models/Team";
import User from "../models/User";
import UserDTO from "../dtos/userDTO";
import Gender from "../models/Gender";
import ClientError from "../errors/ClientError";
import { StatusCodes } from "http-status-codes";
import TournamentService from "./TournamentService";
import School from "../models/School";

class StudentService {
  public static async registerStudentOnTeam(
    studentId: UUID,
    tournamentId: UUID,
    schoolId: UUID
  ) {
    const team: Team | null = await Team.findOne({
      where: {
        tournamentId: tournamentId,
        schoolId: schoolId,
      },
    });

    if (team === null) {
      throw new ClientError(
        StatusCodes.BAD_REQUEST,
        `There is no school with id: ${schoolId} registered on tournament with id: ${tournamentId}`
      );
    }
    const teamId = team.id;

    Student.update(
      { teamId: teamId },
      {
        where: {
          id: studentId,
        },
      }
    );
  }
  public static mapStudent(student: Student): StudentDTO {
    const dto: StudentDTO = {
      fieldPosition: student.fieldPosition,
      shirtNumber: student.shirtNumber,
      IMSS: student.IMSS,
    };
    return dto;
  }

  public static async createStudent(
    userId: UUID,
    student: StudentDTO,
    t?: Transaction
  ) {
    const createdStudent = await Student.create(
      {
        id: userId,
        fieldPosition: student.fieldPosition,
        shirtNumber: student.shirtNumber,
        IMSS: student.IMSS,
      },
      { transaction: t }
    );
    return createdStudent;
  }

  public static async findStudentsByTournament(
    tournamentId: UUID | string
  ): Promise<UserDTO[]> {
    const tournament = await TournamentService.getTournamentById(tournamentId);
    if (tournament === null){
      throw new ClientError(StatusCodes.NOT_FOUND, `Tournament with id ${tournamentId} not found`)
    }

    const result: Student[] = await Student.findAll({
      where: {
        [Op.and]: {
          teamId: { [Op.ne]: null },
          "$Team.tournamentId$": tournamentId,
        },
      },
      include: [{model: Team, include: [School]}, { model: User, include: [Gender] }],
    });
    const users: UserDTO[] = await result.map((i) => {
      const dto: UserDTO = {
        CURP: i.User.CURP,
        firstName: i.User.firstName,
        lastName: i.User.lastName,
        email: i.User.lastName,
        birthDate: i.User.birthDate,
        gender: i.User.Gender.name,
        role: i.User.role,
        phone: i.User.role,
        address: i.User.Address,
        student: this.mapStudent(i),
      };
      dto.student!.team = {
        school : {
          id: i.Team.schoolId,
          name: i.Team.School.name,
          number : i.Team.School.number
        }
      }
      return dto;
    });
    return users;
  }

  public static async findStudentsNotOnTournament(
    tournamentId: UUID | string
  ): Promise<any[]> {
    const result: Student[] = await Student.findAll({
      where: {
        [Op.or]: {
          "$Team.tournamentId$": { [Op.ne]: tournamentId },
          teamId: null,
        },
      },
      include: [{ model: Team }, { model: User }],
      attributes: { include: ["User.firstName", "id"] },
    });
    const data: any[] = result.map((i) => {
      return {
        firstName: i.User.firstName,
        lastName: i.User.lastName,
        curp: i.User.CURP,
        email: i.User.email,
        id: i.id,
      };
    });
    return data;
  }
}

export default StudentService;
