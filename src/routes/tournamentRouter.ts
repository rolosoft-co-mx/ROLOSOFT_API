import { Router } from "express";
import TournamentController from "../controllers/TournamentController";
import { validateClient } from "../middlewares/clientValidation";
import TeamController from "../controllers/TeamController";
import PhaseController from "../controllers/PhaseController";
import MatchController from "../controllers/MatchController";
import SchoolController from "../controllers/SchoolController";
import UserController from "../controllers/UserController";
import Match from "../models/Match";
import { UUIDV4 } from "sequelize";
import { StatusCodes } from "http-status-codes";
import JSONResponse from "../dtos/JSONResponse";

const tournamentRouter = Router();

// TOURNAMENTS
tournamentRouter.get(
  "/",
  validateClient,
  TournamentController.getAllTournaments
);

tournamentRouter.post(
  "/",
  validateClient,
  TournamentController.createTournament
);

// TOURNAMENT SCHOOLS
// Register a school in a tournament
tournamentRouter.post(
  "/:tournamentId/schools",
  validateClient,
  // TeamController.createTeam
  SchoolController.registerSchoolInTournament
);

// Get all schools in a tournament
tournamentRouter.get(
  "/:tournamentId/schools",
  validateClient,
  SchoolController.getSchoolsByTournament
);

//TOURNAMENT STUDENTS

tournamentRouter.get(
  "/:tournamentId/players",
  validateClient,
  UserController.getStudentsByTournament
);

//PHASES
// GET AVAILABLE PHASES
tournamentRouter.get(
  "/:tournamentId/phases",
  validateClient,
  PhaseController.getAllPhasesByTournament
);

//MATCHES
// CREATE
tournamentRouter.post(
  "/:tournamentId/phases/:phaseId/matches",
  validateClient,
  MatchController.createMatch
);

// GET ALL
tournamentRouter.get(
  "/:tournamentId/matches",
  validateClient,
  (req, res, next) => {
    const dummy = [
      {
        dateStart: new Date(),
        dateEnd: new Date(),
        isPlaying: true,
        teamA: {
          id: 1,
          name: "santa fe",
          points: 20,
          shieldImg: "null",
          goals: [
            {
              name: "pepito",
              lastName: "gomelin",
              minute: 90,
              player_number: 10,
            },
            {
              name: "juanito",
              lastName: "ñero",
              minute: 80,
              player_number: 11,
            },
          ],
        },
        teamB: {
          id: 2,
          points: 18,
          name: "junior",
          shieldImg: "null",
          goals: [
            {
              name: "pepito",
              lastName: "caremonda",
              minute: 90,
              player_number: 10,
            },
            {
              name: "juanito",
              lastName: "caremonda",
              minute: 80,
              player_number: 11,
            },
          ],
        },
      },
      {
        dateStart: new Date(),
        dateEnd: new Date(),
        isPlaying: true,
        teamA: {
          id: 3,
          name: "santa fe",
          points: 20,
          shieldImg: "null",
          goals: [
            {
              name: "pepito",
              lastName: "gomelin",
              minute: 90,
              player_number: 10,
            },
            {
              name: "juanito",
              lastName: "ñero",
              minute: 80,
              player_number: 11,
            },
          ],
        },
        teamB: {
          id: 4,
          points: 18,
          name: "junior",
          shieldImg: "null",
          goals: [
            {
              name: "pepito",
              lastName: "caremonda",
              minute: 90,
              player_number: 10,
            },
            {
              name: "juanito",
              lastName: "caremonda",
              minute: 80,
              player_number: 11,
            },
          ],
        },
      },
    ];
    const response: JSONResponse = {
      success: true,
      message: "Matches retrieved successfully",
      data: dummy,
    };
    res.status(StatusCodes.OK).json(response);
  }
);

export default tournamentRouter;
