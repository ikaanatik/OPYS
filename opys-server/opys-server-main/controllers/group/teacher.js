import Group from "../../models/group.js";
import AsyncErrorHandler from "express-async-handler";
import httpStatus from "http-status";
import User from "../../models/User.js";
import CustomError from "../../scripts/helpers/customError.js";
import { roles } from "../../scripts/helpers/querys.js";
import randomString from "randomstring";

const create = AsyncErrorHandler(async (req, res, next) => {
  const data = req.body;
  const { id } = req.user;
  const group = await Group.create({
    ...data,
    owner: id,
    groupCode: randomString.generate({
      length: 6,
      charset: "alphabetic",
    }),
    students: [id],
  });
  return res.status(httpStatus.OK).json({
    success: true,
    data: group,
    message: "Grup başarıyla oluşturuldu.",
  });
});
const update = AsyncErrorHandler(async (req, res, next) => {
  const data = req.body;
  const group = await Group.findOneAndUpdate(
    { groupCode: req.params.groupCode },
    data,
    {
      new: true,
      runValidators: true,
    }
  );
  return res.status(httpStatus.OK).json({
    success: true,
    data: group,
    message: "Grup başarıyla güncellendi.",
  });
});
const deleteGroup = AsyncErrorHandler(async (req, res, next) => {
  const group = await Group.findOne({ groupCode: req.params.groupCode });
  await group.remove();
  return res.status(httpStatus.OK).json({
    success: true,
    data: group,
    message: "Grup başarıyla silindi.",
  });
});
const singleGroup = AsyncErrorHandler(async (req, res, next) => {
  const group = await Group.findOne({
    groupCode: req.params.groupCode,
  }).populate("owner students");

  return res.status(httpStatus.OK).json({
    success: true,
    data: group,
  });
});
const allGroups = AsyncErrorHandler(async (req, res, next) => {
  const count = await Group.countDocuments({ owner: req.user.id });
  const groups = await Group.find({ owner: req.user.id }).sort({
    createdAt: -1,
  });

  return res.status(httpStatus.OK).json({
    success: true,
    data: groups,
    count,
  });
});
const pullStudent = AsyncErrorHandler(async (req, res, next) => {
  // Postlar vs silincek
  const { studentId } = req.body;
  const { groupCode } = req.params;
  const studentCheck = await Group.findOne({
    groupCode,
    students: { $in: [studentId] },
  });
  if (!studentCheck) {
    return next(
      new CustomError(
        "Grupta olmayan bir öğrenciyi çıkaramazsınız.",
        httpStatus.NOT_FOUND
      )
    );
  }
  await Group.findOneAndUpdate(
    { groupCode },
    { $pull: { students: studentId, leaders: studentId } },
    { new: true, runValidators: true }
  );
  return res.status(httpStatus.OK).json({
    success: true,
    message: "Öğrenci gruptan çıkarıldı.",
  });
});
const doLeader = AsyncErrorHandler(async (req, res, next) => {
  const { groupCode, studentId } = req.params;
  const student = await User.findById(studentId);
  const leaderCheck = await Group.findOne({
    groupCode,
    leaders: { $in: [studentId] },
  });

  if (leaderCheck) {
    return next(
      new CustomError(
        "Yönetici olan bir öğrenciyi tekrar öğrenci yapamazsınız.",
        httpStatus.NOT_FOUND
      )
    );
  } else if (student?.role !== roles.Student) {
    return next(
      new CustomError(
        "Sadece öğrencileri yönetici yapabilirsiniz.",
        httpStatus.BAD_REQUEST
      )
    );
  }
  const group = await Group.findOneAndUpdate(
    { groupCode },
    { $push: { leaders: studentId } },
    { new: true, runValidators: true }
  ).populate("owner students");
  return res.status(httpStatus.OK).json({
    success: true,
    data: group,
    message: "Öğrenci grupta yönetici olarak atandı.",
  });
});
const removeLeader = AsyncErrorHandler(async (req, res, next) => {
  const { groupCode, studentId } = req.params;

  const leaderCheck = await Group.findOne({
    groupCode,
    leaders: { $in: [studentId] },
  });
  if (!leaderCheck) {
    return next(
      new CustomError(
        "Yönetici olmayan bir öğrenciyi çıkartamazsınız.",
        httpStatus.NOT_FOUND
      )
    );
  }
  const data = await Group.findOneAndUpdate(
    { groupCode },
    { $pull: { leaders: studentId } },
    { new: true, runValidators: true }
  ).populate("owner students");
  return res.status(httpStatus.OK).json({
    data: data,
    success: true,
    message: "Öğrenci gruptan yönetici olarak çıkarıldı.",
  });
});

export {
  create,
  deleteGroup,
  singleGroup,
  pullStudent,
  allGroups,
  doLeader,
  removeLeader,
  update,
};
