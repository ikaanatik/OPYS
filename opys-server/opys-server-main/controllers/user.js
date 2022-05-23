import AsyncErrorHandler from "express-async-handler";
import httpStatus from "http-status";
import User from "../models/User.js";

import moment from "moment";
import bcrypt from "bcryptjs";
import { comparePassword, sendTokenClient } from "../middlewares/auth/auth.js";
import CustomError from "../scripts/helpers/customError.js";
import { emailLengthCheck } from "../scripts/helpers/pattern.js";
import { deleteObject, uploadFileReq } from "../scripts/helpers/multer.js";
import sendEmail from "../scripts/helpers/mailSender.js";

const isLoggedIn = AsyncErrorHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  return res.status(httpStatus.OK).json({
    success: true,
    data: user,
  });
});
const deleteAccount = AsyncErrorHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  // Paylaştığı bütün postları taskları vs bütün gönderileri silincek
  await user.remove();
  req.headers.authorization = null;
  req.user = null;
  return res
    .status(httpStatus.OK)
    .cookie("access_token", null, {
      httpOnly: true,
      expires: new Date(Date.now()),
      secure: process.env.NODE_ENV === "development" ? false : true,
    })
    .json({
      success: true,
      message: "Hesabınız silindi.",
    });
});
const Logout = AsyncErrorHandler(async (req, res, next) => {
  req.headers.authorization = null;
  req.user = null;
  return res
    .status(httpStatus.OK)
    .cookie("access_token", null, {
      httpOnly: true,
      expires: new Date(Date.now()),
      secure: process.env.NODE_ENV === "development" ? false : true,
    })
    .json({
      success: true,
      message: "Çıkış başarılı.",
    });
});
const updateUser = AsyncErrorHandler(async (req, res, next) => {
  const data = req.body;
  const user = await User.findByIdAndUpdate(req.user.id, data, {
    new: true,
    runValidators: true,
  });
  return res.status(httpStatus.OK).json({
    success: true,
    data: user,
    message: "Bilgileriz güncellendi.",
  });
});
const uploadProfilePic = AsyncErrorHandler(async (req, res, next) => {
  const { id } = req.user;
  const { avatar } = await User.findById(id);
  const file = req.file;
  if (avatar?.Key) {
    await deleteObject(avatar.Key)
      .then(async () => {
        const { Location, Key } = await uploadFileReq(
          file,
          `/Profile Pictures`
        );

        const user = await User.findByIdAndUpdate(
          id,
          {
            avatar: { Location, Key },
          },
          {
            new: true,
            runValidators: true,
          }
        );

        return res.status(httpStatus.OK).json({
          success: true,
          message: "Resim başarıyla güncellendi.",
          data: user,
        });
      })
      .catch((err) => {
        return next(
          new CustomError(
            "Resim silinirken bir hata oluştu. Tekrar deneyiniz.",
            httpStatus.INTERNAL_SERVER_ERROR
          )
        );
      });
  } else {
    const { Location, Key } = await uploadFileReq(file, `/Profile Pictures`);

    const user = await User.findByIdAndUpdate(
      id,
      {
        avatar: { Location, Key },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(httpStatus.OK).json({
      success: true,
      message: "Resim başarıyla güncellendi.",
      data: user,
    });
  }
});
const deleteProfilePic = AsyncErrorHandler(async (req, res, next) => {
  const { id } = req.user;
  const { avatar } = await User.findById(id);
  await deleteObject(avatar.Key)
    .then(async () => {
      const user = await User.findByIdAndUpdate(
        id,
        {
          avatar: {},
        },
        {
          new: true,
          runValidators: true,
        }
      );
      return res.status(httpStatus.OK).json({
        success: true,
        message: "Resim başarıyla silindi.",
        data: user,
      });
    })
    .catch((err) => {
      return next(
        new CustomError(
          "Resim silinirken bir hata oluştu. Tekrar deneyiniz.",
          httpStatus.INTERNAL_SERVER_ERROR
        )
      );
    });
});
const updatePassword = AsyncErrorHandler(async (req, res, next) => {
  const { oldPassword, oldPasswordAgain, newPassword } = req.body;
  const user = await User.findById(req.user.id).select("+password");
  if (oldPassword !== oldPasswordAgain) {
    return next(
      new CustomError(
        "Eski şifre ile eski şifre tekrarı uyuşmuyor.",
        httpStatus.BAD_REQUEST
      )
    );
  } else if (!comparePassword(oldPassword, user.password)) {
    return next(
      new CustomError("Eski şifreniz hatalı.", httpStatus.BAD_REQUEST)
    );
  }
  user.password = newPassword;
  await user.save();
  return res.status(httpStatus.OK).json({
    success: true,
    message: "Şifreniz başarıyla güncellendi.",
  });
});
export {
  isLoggedIn,
  deleteAccount,
  Logout,
  updateUser,
  uploadProfilePic,
  deleteProfilePic,
  updatePassword,
};
