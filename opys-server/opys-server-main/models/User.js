import Mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { roles } from "../scripts/helpers/querys.js";
const Schema = Mongoose.Schema;

const UserSchema = new Schema(
  {
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
    },
    subscribe: Object,
    password: { type: String, trim: true, select: false },
    name: { type: String, trim: true, min: 3, max: 30 },
    surname: {
      type: String,
      trim: true,
      min: 3,
      max: 15,
    },
    notifications: [{ type: Schema.ObjectId, ref: "Notification" }],

    avatar: {
      type: Object,
      default: {
        Location: "https://opys.fra1.digitaloceanspaces.com/default_user.jpg",
      },
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    role: {
      type: String,
      enum: [roles.Student, roles.Teacher, roles.Admin],
    },
    uuid: String,
  },
  { timestamps: true, versionKey: false }
);
UserSchema.methods.generateJWTToken = function () {
  const payload = {
    id: this._id,
    email: this.email,
    name: this.name,
    surname: this.surname,
    role: this.role,
  };
  return jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

UserSchema.methods.getResetPasswordToken = function () {
  const randomHexString = crypto.randomBytes(15).toString("hex");

  const resetPasswordToken = crypto
    .createHash("SHA256")
    .update(randomHexString)
    .digest("hex");

  this.resetPasswordToken = resetPasswordToken;
  this.resetPasswordExpire = new Date().setDate(new Date().getDate() + 2);

  return resetPasswordToken;
};

UserSchema.pre("save", function (next, err) {
  if (!this.isModified("password")) {
    next();
  }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) next(err);
    bcrypt.hash(this.password, salt, (err, hash) => {
      if (err) next(err);
      this.password = hash;
      next();
    });
  });
});
export default Mongoose.model("User", UserSchema);
