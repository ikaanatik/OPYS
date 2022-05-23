import express from "express";
import {
  create,
  removeTask,
  singleTask,
  allTasks,
  update,
  uploadFiles,
  endTask,
} from "../../controllers/task/teacher.js";
import fileUpload from "../../middlewares/fileUpload.js";
import {
  groupExist,
  studentExist,
  taskEndCheck,
  ownerAccessTask,
  taskExist,
  teacherOwnerAccess,
} from "../../middlewares/security/exits.js";
import validate from "../../middlewares/validate.js";
import { CreateTask, UpdateTask } from "../../validations/Task.js";
const router = express.Router();
const globalMiddleware = [
  groupExist,
  taskExist,
  taskEndCheck,
  studentExist,
  teacherOwnerAccess,
];

router.post(
  "/Create/:groupCode/:studentId",
  [groupExist, studentExist, validate(CreateTask)],
  create
);
router.delete(
  "/Remove/:groupCode/:taskId/:studentId",
  [...globalMiddleware, ownerAccessTask],
  removeTask
);
router.post(
  "/Upload/:groupCode/:taskId/:studentId",
  [...globalMiddleware, fileUpload.array("uploads", 10)],
  uploadFiles
);
router.get(
  "/Single/:groupCode/:taskId/:studentId",
  globalMiddleware,
  singleTask
);
router.get("/Tasks", allTasks);
router.post(
  "/Update/:groupCode/:taskId",
  [
    groupExist,
    taskExist,
    taskEndCheck,
    teacherOwnerAccess,
    ownerAccessTask,
    validate(UpdateTask),
  ],
  update
);
router.get("/End/:groupCode/:taskId/:studentId", globalMiddleware, endTask);

export default router;
