import express from "express";
import {
  joinGroup,
  singleGroup,
  allGroups,
} from "../../controllers/group/student.js";

import { groupExist } from "../../middlewares/security/exits.js";
import validate from "../../middlewares/validate.js";
import { CreateGroup } from "../../validations/Group.js";
const router = express.Router();
router.post("/:groupCode", groupExist, joinGroup);
router.get("/Single/:groupCode", groupExist, singleGroup);
router.get("/Groups", allGroups);

export default router;
