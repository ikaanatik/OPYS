import express from "express";
import {
  Register,
  Login,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.js";
import fileUpload from "../middlewares/fileUpload.js";
import { emailLength } from "../middlewares/security/exits.js";
import { limitAccess } from "../middlewares/security/limitAccess.js";
import validate from "../middlewares/validate.js";
import {
  RegisterValidation,
  LoginValidation,
  ResetPassword,
  ForgotPassword,
} from "../validations/Auth.js";
const globalMiddleware = [emailLength];
const router = express.Router();
router.post(
  "/Login",
  limitAccess(
    60 * 1000,
    15,
    "Too much login attempt, please try again after 1 minutes"
  ),
  [...globalMiddleware, validate(LoginValidation)],
  Login
);
router.post(
  "/Register",
  fileUpload.single("profilePic"),
  limitAccess(
    60 * 1000,
    15,
    "Too much login attempt, please try again after 1 minutes"
  ),
  [...globalMiddleware, validate(RegisterValidation)],
  Register
);

router.post(
  "/forgotPassword",
  [...globalMiddleware, validate(ForgotPassword)],
  forgotPassword
);
router.post("/resetPassword", validate(ResetPassword), resetPassword);
export default router;
