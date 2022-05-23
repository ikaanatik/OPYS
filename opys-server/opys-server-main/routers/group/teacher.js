import express from "express";
import {
  create,
  deleteGroup,
  singleGroup,
  pullStudent,
  allGroups,
  doLeader,
  removeLeader,
  update,
} from "../../controllers/group/teacher.js";
import {
  groupExist,
  studentExist,
  ownerAccessGroup,
} from "../../middlewares/security/exits.js";
import validate from "../../middlewares/validate.js";
import { CreateGroup, UpdateGroup } from "../../validations/Group.js";
const router = express.Router();
router.post("/Create", validate(CreateGroup), create);
router.put(
  "/Update/:groupCode",
  [groupExist, ownerAccessGroup, validate(UpdateGroup)],
  update
);
router.get(
  "/Leader/Do/:groupCode/:studentId",
  [groupExist, ownerAccessGroup, studentExist],
  doLeader
);
router.get(
  "/Leader/Remove/:groupCode/:studentId",
  [groupExist, studentExist, ownerAccessGroup],
  removeLeader
);
router.delete(
  "/Remove/:groupCode",
  [groupExist, ownerAccessGroup],
  deleteGroup
);
router.get("/Single/:groupCode", groupExist, singleGroup);
router.get("/Groups/", allGroups);
// Students
router.post(
  "/Remove/Students/:groupCode",
  [groupExist, ownerAccessGroup, studentExist],
  pullStudent
);
export default router;
