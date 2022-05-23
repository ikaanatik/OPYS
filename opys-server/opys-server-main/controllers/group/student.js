import Group from "../../models/group.js";
import AsyncErrorHandler from "express-async-handler";
import httpStatus from "http-status";
import User from "../../models/User.js";
import CustomError from "../../scripts/helpers/customError.js";
const joinGroup = AsyncErrorHandler(async (req, res, next) => {
  const { groupCode } = req.params;
  const studentCheck = await Group.findOne({
    groupCode,
    students: { $in: [req.user.id] },
    $inc: { studentsCount: 1 },
  });
  if (studentCheck) {
    return next(
      new CustomError(
        "Bu gruba kayıtlı olduğunuz için tekrardan kayıt olamazsınız.",
        httpStatus.BAD_REQUEST
      )
    );
  }

  const group = await Group.findOneAndUpdate(
    { groupCode },
    { $push: { students: req.user.id } },
    { new: true, runValidators: true }
  );
  return res.status(httpStatus.OK).json({
    success: true,
    data: group,
    message: "Gruba katıldınız.",
  });
});
const singleGroup = AsyncErrorHandler(async (req, res, next) => {
  const group = await Group.findOne({
    groupCode: req.params.groupCode,
    students: { $in: [req.user.id] },
  }).populate("owner students");
  if (!group) {
    return next(
      new CustomError(
        "Bu grup için giriş yetkiniz yok.",
        httpStatus.UNAUTHORIZED
      )
    );
  }
  return res.status(httpStatus.OK).json({
    success: true,
    data: group,
  });
});
const allGroups = AsyncErrorHandler(async (req, res, next) => {
  const { id } = req.user;

  const count = await Group.countDocuments({ students: { $in: [id] } });
  const groups = await Group.find({ students: { $in: [id] } }).sort({
    createdAt: -1,
  });

  return res.status(httpStatus.OK).json({
    success: true,
    data: groups,
    count,
  });
});
export { joinGroup, singleGroup, allGroups };
