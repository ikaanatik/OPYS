import Mongoose from "mongoose";

const Schema = Mongoose.Schema;
const QuestionSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
    },
    content: {
      type: String,
      trim: true,
    },
    owner: { type: Schema.ObjectId, ref: "User", required: true },
    task: { type: Schema.ObjectId, ref: "Task" },
    subTask: { type: Schema.ObjectId, ref: "SubTask" },
    group: { type: Schema.ObjectId, ref: "Group", required: true },
  },
  { timestamps: true, versionKey: false }
);

export default Mongoose.model("Question", QuestionSchema);
