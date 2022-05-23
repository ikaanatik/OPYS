import express from "express";
import {
  singleSubTask,
  uploadFiles,
  allSubTasks,
  endSubTask,
} from "../../controllers/subTask/student.js";
import fileUpload from "../../middlewares/fileUpload.js";

import {
  groupExist,
  studentExist,
  subTaskExist,
  taskExist,
  subTaskEndCheck,
} from "../../middlewares/security/exits.js";
import validate from "../../middlewares/validate.js";
import { CreateGroup } from "../../validations/Group.js";
const router = express.Router();
const globalMiddleware = [
  groupExist,
  taskExist,
  subTaskExist,
  subTaskEndCheck,
  studentExist,
];

router.get(
  "/Single/:groupCode/:taskId/:subTaskId",
  globalMiddleware,
  singleSubTask
);
router.post(
  "/Upload/:groupCode/:taskId/:subTaskId",
  [...globalMiddleware, fileUpload.array("uploads", 10)],
  uploadFiles
);
router.get("/SubTasks", allSubTasks);
router.get("/End/:groupCode/:taskId/:subTaskId", globalMiddleware, endSubTask);

export default router;
