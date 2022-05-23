import express from "express";
import teacher from "./teacher.js";
import student from "./student.js";
import {
  teacherOwnerAccess,
  studentOwnerAccess,
  groupExist,
} from "../../middlewares/security/exits.js";

const app = express();
app.use("/Teacher", teacher);
app.use("/Student", studentOwnerAccess, student);

export default app;
