import Mongoose from "mongoose";
const Schema = Mongoose.Schema;
const ObjectId = Schema.ObjectId;
const PostSchema = new Schema(
  {
    content: {
      type: String,
      trim: true,
      required: true,
      max: 400,
    },
    author: { type: ObjectId, ref: "User" },
    group: { type: ObjectId, ref: "Group" },
  },
  { timestamps: true, versionKey: false }
);

export default Mongoose.model("Post", PostSchema);
