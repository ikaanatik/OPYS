import AsyncErrorHandler from "express-async-handler";
import Group from "../models/group.js";
import httpStatus from "http-status";
import CustomError from "../scripts/helpers/customError.js";
import Question from "../models/Question.js";
import Task from "../models/Task.js";
import SubTask from "../models/SubTask.js";
const createQuestionTask = AsyncErrorHandler(async (req, res, next) => {
  const data = req.body;
  const { groupCode, taskId } = req.params;
  const { _id } = await Group.findOne({ groupCode });
  const task = await Task.findById(taskId);
  if (task.group.toString() !== _id.toString()) {
    return next(
      new CustomError(
        "Bu işlemi yapmak için yetkiniz yok.",
        httpStatus.UNAUTHORIZED
      )
    );
  } else if (task.assignTo.toString() !== req.user.id.toString()) {
    return next(
      new CustomError("Bu görev size atanmadı.", httpStatus.UNAUTHORIZED)
    );
  }
  const question = await Question.create({
    ...data,
    owner: req.user.id,
    task: taskId,
    group: _id,
  });

  return res.status(httpStatus.OK).json({
    success: true,
    message: "Soru başarıyla oluşturuldu.",
    data: question,
  });
});
const createQuestionSubTask = AsyncErrorHandler(async (req, res, next) => {
  const data = req.body;
  const { groupCode, subTaskId } = req.params;
  const { _id } = await Group.findOne({ groupCode });
  const subTask = await SubTask.findById(subTaskId);
  if (subTask.group.toString() !== _id.toString()) {
    return next(
      new CustomError(
        "Bu işlemi yapmak için yetkiniz yok.",
        httpStatus.UNAUTHORIZED
      )
    );
  } else if (subTask.assignTo.toString() !== req.user.id.toString()) {
    return next(
      new CustomError("Bu alt görev size atanmadı.", httpStatus.UNAUTHORIZED)
    );
  }
  const question = await Question.create({
    ...data,
    owner: req.user.id,
    subTask: subTaskId,
    group: _id,
  });

  return res.status(httpStatus.OK).json({
    success: true,
    message: "Soru başarıyla oluşturuldu.",
    data: question,
  });
});
const deleteQuestion = AsyncErrorHandler(async (req, res, next) => {
  const { groupCode, taskId, questionId } = req.params;
  const { _id } = await Group.findOne({ groupCode });
  const task = await Task.findById(taskId);
  if (task.group.toString() !== _id.toString()) {
    return next(
      new CustomError(
        "Bu işlemi yapmak için yetkiniz yok.",
        httpStatus.UNAUTHORIZED
      )
    );
  } else if (task.assignTo.toString() !== req.user.id.toString()) {
    return next(
      new CustomError("Bu görev size atanmadı.", httpStatus.UNAUTHORIZED)
    );
  }

  const question = await Question.findOne({
    owner: req.user.id,
    task: taskId,
    group: _id,
    _id: questionId,
  });
  if (!question) {
    return next(new CustomError("Soru bulunamadı.", httpStatus.NOT_FOUND));
  }
  await question.remove();
  return res.status(httpStatus.OK).json({
    success: true,
  });
});
const questionsTasks = AsyncErrorHandler(async (req, res, next) => {
  const { groupCode, taskId } = req.params;
  const { _id } = await Group.findOne({ groupCode });
  const task = await Task.findById(taskId);
  if (task.group.toString() !== _id.toString()) {
    return next(
      new CustomError(
        "Bu işlemi yapmak için yetkiniz yok.",
        httpStatus.UNAUTHORIZED
      )
    );
  }
  const questions = await Question.find({
    task: taskId,
    group: _id,
  }).populate("owner");
  return res.status(httpStatus.OK).json({
    success: true,
    data: questions,
  });
});
const questionsSubTasks = AsyncErrorHandler(async (req, res, next) => {
  const { groupCode, subTaskId } = req.params;
  const { _id } = await Group.findOne({ groupCode });
  const subTask = await SubTask.findById(subTaskId);
  if (subTask.group.toString() !== _id.toString()) {
    return next(
      new CustomError(
        "Bu işlemi yapmak için yetkiniz yok.",
        httpStatus.UNAUTHORIZED
      )
    );
  }
  const questions = await Question.find({
    subTask: subTaskId,
    group: _id,
  }).populate("owner");
  return res.status(httpStatus.OK).json({
    success: true,
    data: questions,
  });
});
const createAnswer = AsyncErrorHandler(async (req, res, next) => {
  const { content } = req.body;
  const { questionId } = req.params;
  const answer = await Question.findByIdAndUpdate(
    questionId,
    {
      content,
    },
    { new: true, runValidators: true }
  );

  return res.status(httpStatus.OK).json({
    success: true,
    message: "Cevap oluşturuldu.",
    data: answer,
  });
});

export {
  createQuestionTask,
  createQuestionSubTask,
  deleteQuestion,
  questionsTasks,
  questionsSubTasks,
  createAnswer,
};
