import express from "express";
import {
  Logout,
  isLoggedIn,
  deleteAccount,
  updateUser,
  uploadProfilePic,
  deleteProfilePic,
  updatePassword,
} from "../controllers/user.js";
import fileUpload from "../middlewares/fileUpload.js";
import { emailLength, userExist } from "../middlewares/security/exits.js";
import validate from "../middlewares/validate.js";
import { UpdateUser, UpdatePassword } from "../validations/User.js";
const router = express.Router();
const app = express();
app.use(userExist);
router.delete("/Delete/account", deleteAccount);
router.get("/Logout", Logout);
router.get("/isLoggedIn", isLoggedIn);
router.put("/Update/User", emailLength, updateUser);
router.put(
  "/Avatar/Upload/Avatar",
  fileUpload.single("avatar"),
  uploadProfilePic
);
router.delete("/Avatar/Delete/Avatar", deleteProfilePic);
router.put("/Update/Password", validate(UpdatePassword), updatePassword);

export default router;
