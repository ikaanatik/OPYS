import Mongoose from "mongoose";

import { status } from "../scripts/helpers/querys.js";
import Question from "./Question.js";
import Task from "./Task.js";
const Schema = Mongoose.Schema;
const ObjectId = Schema.ObjectId;
const SubTaskSchema = new Schema(
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
    assignTo: { type: ObjectId, ref: "User", required: true },
    assigner: { type: ObjectId, ref: "User", required: true },
    group: { type: ObjectId, ref: "Group", required: true },
    task: { type: ObjectId, ref: "Task", required: true },
    status: {
      type: String,
      default: status.Starting,
      enum: [status.Starting, status.InProgress, status.Completed],
    },
    uploads: [Object],
  },
  { timestamps: true, versionKey: false }
);

SubTaskSchema.pre("remove", async function (next, err) {
  await Question.deleteMany({ task: this._id });
  await Task.findByIdAndUpdate(
    this.task,
    { $pull: { subTasks: this._id } },
    { new: true, runValidators: true }
  );
  next();
});
SubTaskSchema.pre("save", async function (next, err) {
  await Task.findByIdAndUpdate(
    this.task,
    { $push: { subTasks: this._id } },
    { new: true, runValidators: true }
  );
  next();
});
export default Mongoose.model("SubTask", SubTaskSchema);
