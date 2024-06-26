import { StatusCodes } from "http-status-codes";
import teamDTO from "../dtos/teamDTO";
import School from "../models/School";
import Team from "../models/Team";
import Tournament from "../models/Tournament";
import { UUID } from "crypto";
import ClientError from "../errors/ClientError";
import teamStatisticsDTO from "../dtos/teamStatisticsDTO";
import GeneralTableService from "./GeneralTableService";


class TeamService {
  public static mapTeam(team: Team): teamDTO {
    const dto: teamDTO = {
      id: team.id,
      sponsor: team.sponsor,
      school: team.School && {
        id: team.School.id,
        name: team.School.name,
      },
      tournament: team.Tournament && {
        id: team.Tournament.id,
        name: team.Tournament.name,
      },
    };
    return dto;
  }

  public static async getTeamByTournamentAndSchool(tournamentId: UUID, schoolId: UUID): Promise<Team>{
    const team : Team | null = await Team.findOne({where:{tournamentId : tournamentId, schoolId: schoolId}, include: School});
    if (team === null){
      throw new ClientError(StatusCodes.NOT_FOUND, `Couldn't find a school with id ${schoolId} registered on tournament with id ${tournamentId}`)
    }
    return team;
  }

  public static async getOneTeam(id: UUID): Promise<teamDTO> {
    const result: Team | null = await Team.findByPk(id, {
      include: [Tournament, School],
    });
    if (result == null) {
      throw new ClientError(StatusCodes.NOT_FOUND, "Team not found", {});
    }
    const resultDTO = TeamService.mapTeam(result);
    return resultDTO;
  }
  private static async validateTeam(teamDTO: teamDTO) {}

  public static async createTeam(teamDTO: teamDTO): Promise<teamDTO> {
    TeamService.validateTeam(teamDTO);
    const team: Team = await Team.create({
      sponsor: teamDTO.sponsor,
      schoolId: teamDTO.school.id!,
      tournamentId: teamDTO.tournament.id!,
    });
    const result: teamDTO = {
      id: team!.id,
      sponsor: team!.sponsor,
      school: await team!.getSchool({
        attributes: { exclude: ["createdAt", "deletedAt", "updatedAt"] },
      }),
      tournament: await team!.getTournament({
        attributes: { exclude: ["createdAt", "deletedAt", "updatedAt"] },
      }),
    };
    return result;
  }

  public static async getAllTeams(): Promise<teamDTO[]> {
    const teams: Team[] = await Team.findAll({ include: [School, Tournament] });
    const teamDTOs: teamDTO[] = teams.map((item) => {
      const team: teamDTO = {
        id: item.id,
        sponsor: item.sponsor,
        school: {
          id: item.School.id,
          name: item.School.name,
        },
        tournament: {
          id: item.Tournament.id,
          name: item.Tournament.name,
          startDate: item.Tournament.startDate,
        },
      };
      return team;
    });

    return teamDTOs;
  }

  public static async setTeamPoints(tournamentId: UUID, schoolId: UUID, points: number ): Promise<number>{
    const result  = await Team.update({
      points: points
    },{where: {
      tournamentId: tournamentId,
      schoolId: schoolId,
    }})
    if (result[0] === 0) {
      throw new ClientError(StatusCodes.NOT_FOUND, `Couldn't find a team for school with id ${schoolId} on tournament with id ${tournamentId}`)
    }
    return result[0];
  }

  public static async getTeamStatistics(tournamentId: UUID, schoolId: UUID): Promise<teamStatisticsDTO>{
    
    const team: Team = await TeamService.getTeamByTournamentAndSchool(tournamentId, schoolId);
    await GeneralTableService.updateGeneralTable(tournamentId);
    const generalTable = await GeneralTableService.getGeneralTableByTeamId(team.id);
    const teamStatistics: teamStatisticsDTO = {
      tournamentId: tournamentId,
      schoolId: schoolId,
      schoolName: team.School.name,
      defeats: generalTable.defeats,
      draws: generalTable.draws,
      victories: generalTable.victories,
      goalsFor: generalTable.goalsFor,
      goalsAgainst: generalTable.goalsAgainst,
      goalDifference: generalTable.goalDifference,
      gamesPlayed: generalTable.gamesPlayed,
      points: generalTable.points,
      position: generalTable.position,
      shieldFileName: team.School.shieldFileName,
    }
    return teamStatistics;
  }
}

export default TeamService;
