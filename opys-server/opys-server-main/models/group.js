import Mongoose from "mongoose";
import Task from "./Task.js";
import Post from "./Post.js";
import Question from "./Question.js";
import SubTask from "./SubTask.js";
const Schema = Mongoose.Schema;
const GroupSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    groupCode: String,
    owner: { type: Schema.ObjectId, ref: "User" },
    students: [{ type: Schema.ObjectId, ref: "User" }],
    leaders: [{ type: Schema.ObjectId, ref: "User" }],
  },
  { timestamps: true, versionKey: false }
);

GroupSchema.pre("remove", async function (next, err) {
  await Task.deleteMany({ group: this._id });
  await SubTask.deleteMany({ group: this._id });
  await Question.deleteMany({ group: this._id });
  await Post.deleteMany({ group: this._id });
  next();
});
export default Mongoose.model("Group", GroupSchema);
