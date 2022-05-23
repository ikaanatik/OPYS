import httpStatus from "http-status";
import AsyncErrorHandler from "express-async-handler";
import User from "../../models/User.js";
import Group from "../../models/group.js";
import Post from "../../models/Post.js";
import CustomError from "../../scripts/helpers/customError.js";
import { emailLengthCheck } from "../../scripts/helpers/pattern.js";
import { roles, status } from "../../scripts/helpers/querys.js";
import Task from "../../models/Task.js";
import Question from "../../models/Question.js";
import SubTask from "../../models/SubTask.js";
const userExist = AsyncErrorHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new CustomError("Kullanıcı bulunamadı.", httpStatus.NOT_FOUND));
  }
  next();
});
const taskEndCheck = AsyncErrorHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.taskId);

  if (task.status === status.Completed) {
    return next(
      new CustomError("Bu görev tamamlanmış.", httpStatus.BAD_REQUEST)
    );
  }
  next();
});
const subTaskEndCheck = AsyncErrorHandler(async (req, res, next) => {
  const subTask = await SubTask.findById(req.params.subTaskId);

  if (subTask.status === status.Completed) {
    return next(
      new CustomError("Bu alt görev tamamlanmış.", httpStatus.BAD_REQUEST)
    );
  }
  next();
});
const postExist = AsyncErrorHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.postId);
  if (!post) {
    return next(new CustomError("Post bulunamadı.", httpStatus.NOT_FOUND));
  }
  next();
});

// Group
const groupExist = AsyncErrorHandler(async (req, res, next) => {
  const group = await Group.findOne({
    groupCode: req?.params?.groupCode,
  });
  if (!group) {
    return next(new CustomError("Grup bulunamadı.", httpStatus.NOT_FOUND));
  }
  next();
});
const studentExist = AsyncErrorHandler(async (req, res, next) => {
  const student = await Group.findOne({
    students: { $in: [req.params.studentId || req.user.id] },
  });

  if (!student) {
    return next(new CustomError("Öğrenci bulunamadı.", httpStatus.NOT_FOUND));
  }
  next();
});
const teacherOwnerAccess = AsyncErrorHandler(async (req, res, next) => {
  const { role } = req.user;

  if (role !== roles.Teacher) {
    return next(
      new CustomError(
        "Bu işlemi yapmak için yetkiniz yok.",
        httpStatus.UNAUTHORIZED
      )
    );
  }

  next();
});
const studentOwnerAccess = AsyncErrorHandler(async (req, res, next) => {
  const { role } = req.user;
  if (role !== roles.Student) {
    return next(
      new CustomError(
        "Bu işlemi yapmak için yetkiniz yok.",
        httpStatus.UNAUTHORIZED
      )
    );
  }
  next();
});
const ownerAccessGroup = AsyncErrorHandler(async (req, res, next) => {
  const group = await Group.findOne({
    groupCode: req.params.groupCode,
    owner: req.user.id,
  });
  if (!group) {
    return next(
      new CustomError(
        "Bu işlemi yapmaya yetkiniz yok.",
        httpStatus.UNAUTHORIZED
      )
    );
  }
  next();
});
const ownerAccessTask = AsyncErrorHandler(async (req, res, next) => {
  const task = await Task.findOne({
    _id: req.params.taskId,
    $or: [{ assigner: req.user.id }, { assignTo: req.user.id }],
  });
  if (!task) {
    return next(
      new CustomError(
        "Bu işlemi yapmaya yetkiniz yok.",
        httpStatus.UNAUTHORIZED
      )
    );
  }
  next();
});
// Group

const postOwnerAccess = AsyncErrorHandler(async (req, res, next) => {
  const { _id } = await Group.findOne({ groupCode: req.params.groupCode });
  const post = await Post.findOne({ group: _id, author: req.user.id });
  if (!post) {
    return next(
      new CustomError(
        "Bu işlemi yapmaya yetkiniz yok.",
        httpStatus.UNAUTHORIZED
      )
    );
  }
  next();
});

const emailLength = AsyncErrorHandler(async (req, res, next) => {
  const { email } = req.body;
  if (email && emailLengthCheck(email))
    return next(
      new CustomError(
        "Üzgünüz, e-mailiniz en az 6, en çok 30 karakterden oluşabilir.",
        httpStatus.BAD_REQUEST
      )
    );
  next();
});

const taskExist = AsyncErrorHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.taskId);
  console.log(req.params);
  if (!task) {
    return next(new CustomError("Task bulunamadı.", httpStatus.NOT_FOUND));
  }
  next();
});
const subTaskExist = AsyncErrorHandler(async (req, res, next) => {
  const subTask = await SubTask.findById(req.params.subTaskId);
  if (!subTask) {
    return next(new CustomError("Alt görev bulunamadı.", httpStatus.NOT_FOUND));
  }
  next();
});
const questionExist = AsyncErrorHandler(async (req, res, next) => {
  const question = await Question.findById(req.params.questionId);

  if (!question) {
    return next(new CustomError("Soru bulunamadı.", httpStatus.NOT_FOUND));
  }
  next();
});

export {
  userExist,
  postExist,
  groupExist,
  studentExist,
  teacherOwnerAccess,
  studentOwnerAccess,
  ownerAccessGroup,
  ownerAccessTask,
  postOwnerAccess,
  taskEndCheck,
  emailLength,
  taskExist,
  subTaskExist,
  questionExist,
  subTaskEndCheck,
};
