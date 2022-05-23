import Mongoose from "mongoose";

import { status } from "../scripts/helpers/querys.js";
import Question from "./Question.js";
import SubTask from "./SubTask.js";
const Schema = Mongoose.Schema;
const ObjectId = Schema.ObjectId;
const TaskSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      required: true,
    },
    deadline: { type: Date, required: true },
    subTasks: [{ type: ObjectId, ref: "SubTask", required: true }],
    assignTo: { type: ObjectId, ref: "User", required: true },
    assigner: { type: ObjectId, ref: "User", required: true },
    group: { type: ObjectId, ref: "Group", required: true },
    status: {
      type: String,
      default: status.Starting,
      enum: [status.Starting, status.InProgress, status.Completed],
    },
    uploads: [Object],
  },
  { timestamps: true, versionKey: false }
);

TaskSchema.pre("remove", async function (next, err) {
  await Question.deleteMany({ task: this._id });
  await SubTask.deleteMany({ task: this._id });
  next();
});
export default Mongoose.model("Task", TaskSchema);
