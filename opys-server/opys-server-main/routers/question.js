import express from "express";
import {
  createQuestionTask,
  createQuestionSubTask,
  deleteQuestion,
  questionsTasks,
  questionsSubTasks,
  createAnswer,
} from "../controllers/question.js";
import {
  groupExist,
  questionExist,
  subTaskExist,
  taskExist,
  taskEndCheck,
  subTaskEndCheck,
} from "../middlewares/security/exits.js";
const router = express.Router();
const globalMiddleware = [groupExist, taskExist];
router.post(
  "/Create/Task/:groupCode/:taskId",
  [...globalMiddleware, taskEndCheck],
  createQuestionTask
);
router.post(
  "/Create/SubTask/:groupCode/:subTaskId",
  [groupExist, subTaskExist, subTaskEndCheck],
  createQuestionSubTask
);
router.delete(
  "/Delete/:groupCode/:taskId/:questionId",
  [...globalMiddleware, questionExist],
  deleteQuestion
);
router.get(
  "/Questions/Task/:groupCode/:taskId",
  globalMiddleware,
  questionsTasks
);
router.get(
  "/Questions/subTask/:groupCode/:subTaskId",
  [groupExist, subTaskExist],
  questionsSubTasks
);
router.post(
  "/Create/Answer/:groupCode/:taskId/:questionId",
  [...globalMiddleware, questionExist],
  createAnswer
);
export default router;
