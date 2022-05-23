import AsyncErrorHandler from "express-async-handler";
import httpStatus from "http-status";
import User from "../models/User.js";

import moment from "moment";
import bcrypt from "bcryptjs";
import { sendTokenClient } from "../middlewares/auth/auth.js";
import CustomError from "../scripts/helpers/customError.js";
import { emailLengthCheck } from "../scripts/helpers/pattern.js";
import { uploadFileReq } from "../scripts/helpers/multer.js";
import sendEmail from "../scripts/helpers/mailSender.js";
import { v4 } from "uuid";
import randomString from "randomstring";

const Register = AsyncErrorHandler(async (req, res, next) => {
  let data = req.body;
  if (emailLengthCheck(data.email))
    return next(
      new CustomError(
        "Üzgünüz, e-mailiniz en az 6, en çok 30 karakterden oluşabilir.",
        httpStatus.BAD_REQUEST
      )
    );
  if (req.file) {
    const { Location, Key } = await uploadFileReq(
      req.file,
      `/Profile Pictures`
    );
    data = { ...data, avatar: { Location, Key } };
  }
  const user = await User.create({ ...data, uuid: v4() });
  sendTokenClient(user, req, res);
});
const Login = AsyncErrorHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (emailLengthCheck(email))
    return next(
      new CustomError(
        "Üzgünüz, e-mailiniz en az 6, en çok 30 karakterden oluşabilir.",
        httpStatus.BAD_REQUEST
      )
    );
  const user = await User.findOne({ email }).select("+password");
  if (!user || !bcrypt.compareSync(password, user.password))
    return next(
      new CustomError("E-mail veya şifre yanlış.", httpStatus.NOT_FOUND)
    );
  sendTokenClient(user, req, res);
});

const forgotPassword = AsyncErrorHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  // if (!user) {
  //   return next(
  //     new CustomError(
  //       "Bu e-postaya ait bir kullanıcı bulunamadı.",
  //       httpStatus.NOT_FOUND
  //     )
  //   );
  // }
  user.password = randomString.generate({
    length: 6,
    charset: "alphabetic",
  });

  const emailTemplate = `
        <h3>Reset Your Password</h3>
        <p>Yeni şifreniz => ${user.password}</p>
    `;

  try {
    await sendEmail({
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: "Parola Sıfırlama",
      html: emailTemplate,
    });
    await user.save();
    return res.status(httpStatus.OK).json({
      success: true,
      message: "E-mail gönderildi",
      data: user,
    });
  } catch (err) {
    console.log(err);
    return next(new CustomError(err, httpStatus.INTERNAL_SERVER_ERROR));
  }
});

const resetPassword = AsyncErrorHandler(async (req, res, next) => {
  const { resetPasswordToken } = req.query;
  const { password, passwordAgain } = req.body;

  if (!resetPasswordToken) {
    return next(
      new customError(
        "Lütfen geçerli bir token sağlayın.",
        httpStatus.BAD_REQUEST
      )
    );
  }
  let user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      new CustomError(
        "Geçersiz token veya Token'in Süresi Doldu.",
        httpStatus.NOT_FOUND
      )
    );
  }
  if (password !== passwordAgain)
    return next(
      new CustomError(
        "Lütfen iki şifreninde aynı olduğundan emin olun.",
        httpStatus.NOT_FOUND
      )
    );
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  user = await user.save();
  return res.status(httpStatus.OK).json({
    success: true,
    message: "Şifre değiştirildi.",
  });
  // sendTokenToClient(user, res, httpStatus.OK);
});

export { Register, Login, resetPassword, forgotPassword };
