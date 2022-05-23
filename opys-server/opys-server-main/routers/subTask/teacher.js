import express from "express";
import {
  create,
  removeSubTask,
  singleSubTask,
  allSubTasks,
  update,
  uploadFiles,
  endSubTask,
} from "../../controllers/subTask/teacher.js";
import fileUpload from "../../middlewares/fileUpload.js";
import {
  groupExist,
  ownerAccessTask,
  studentExist,
  subTaskExist,
  taskExist,
  taskEndCheck,
} from "../../middlewares/security/exits.js";
const router = express.Router();
const globalMiddleware = [
  groupExist,
  taskExist,
  subTaskExist,
  studentExist,
  taskEndCheck,
];

router.post(
  "/Create/:groupCode/:taskId/:studentId",
  [groupExist, taskExist, studentExist, taskEndCheck],
  create
);
router.delete(
  "/Remove/:groupCode/:taskId/:subTaskId/:studentId",
  [...globalMiddleware, ownerAccessTask],
  removeSubTask
);
router.post(
  "/Upload/:groupCode/:taskId/:subTaskId/:studentId",
  [...globalMiddleware, fileUpload.array("uploads", 10)],
  uploadFiles
);
router.get(
  "/Single/:groupCode/:taskId/:subTaskId/:studentId",
  globalMiddleware,
  singleSubTask
);
router.get("/SubTasks", allSubTasks);
router.post(
  "/Update/:groupCode/:taskId/:subTaskId/:studentId",
  [...globalMiddleware, ownerAccessTask],
  update
);
router.get(
  "/End/:groupCode/:taskId/:subTaskId/:studentId",
  globalMiddleware,
  endSubTask
);
export default router;
