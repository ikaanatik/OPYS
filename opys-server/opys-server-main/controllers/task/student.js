import AsyncErrorHandler from "express-async-handler";
import User from "../../models/User.js";
import Group from "../../models/group.js";
import moment from "moment";
import Task from "../../models/Task.js";
import httpStatus from "http-status";
import CustomError from "../../scripts/helpers/customError.js";
import webPush from "web-push";
import { uploadFileReq } from "../../scripts/helpers/multer.js";
import { roles, status } from "../../scripts/helpers/querys.js";
import SubTask from "../../models/SubTask.js";
const singleTask = AsyncErrorHandler(async (req, res, next) => {
  const { groupCode, taskId } = req.params;
  const { _id } = await Group.findOne({ groupCode });
  const task = await Task.findOne({
    group: _id,
    $or: [
      {
        assignTo: req.user.id,
      },
      {
        assigner: req.user.id,
      },
    ],

    _id: taskId,
  })
    .populate("assignTo assigner")
    .populate("group");
  if (!task) {
    return next(
      new CustomError("Bu görev size ait değil.", httpStatus.BAD_REQUEST)
    );
  } else if (task.status === status.Completed) {
    return next(
      new CustomError("Bu görev tamamlanmış.", httpStatus.BAD_REQUEST)
    );
  }
  return res.status(httpStatus.OK).json({
    success: true,
    data: task,
  });
});
const uploadFiles = AsyncErrorHandler(async (req, res, next) => {
  const { name, surname, uuid } = await User.findById(req.user.id);
  const { groupCode, taskId } = req.params;
  const task = await Task.findById(taskId).populate("assigner");
  if (task.status === status.Starting) {
    await Task.findByIdAndUpdate(
      taskId,
      { status: status.InProgress },
      { new: true, runValidators: true }
    );
  }
  if (Date.now() > task.deadline) {
    return next(
      new CustomError(
        "Bu görevin son yükleme tarihi geçti.",
        httpStatus.BAD_REQUEST
      )
    );
  }
  const files = await req.files.map(async (item) => {
    await uploadFileReq(item, `/Tasks/${groupCode}/${name}-${surname}-${uuid}`)
      .then(async (response) => {
        await Task.findByIdAndUpdate(
          taskId,
          {
            $push: {
              uploads: {
                ...response,
                role: roles.Student,
                uploadDate: moment().format("L"),
                mimetype: item.mimetype,
                fullName: `${name} ${surname}`,
                originalname: item.originalname,
              },
            },
          },
          { new: true, runValidators: true }
        );
        // Teacher send notification
        if (task.assigner.subscribe)
          webPush.sendNotification(
            task.assigner.subscribe,
            JSON.stringify({
              title: "Yeni bir dosya yüklendi",
              text: `${groupCode} grubundaki görev'e ${
                name + " " + surname
              } tarafından dosya yüklendi, yüklenen dosyaya gitmek için tıklayınız.`,
              href: response.Location,
            })
          );
      })
      .catch((err) => {
        // return next(
        //   new CustomError(
        //     "Bir hata oluştu lütfen tekrar deneyiniz",
        //     httpStatus.BAD_REQUEST
        //   )
        // );
      });
  });
  return res.status(httpStatus.OK).json({
    success: true,
    message: req.files.length >= 1 ? "Dosya yüklendi." : "Dosyalar yüklendi.",
  });
});
const allTasks = AsyncErrorHandler(async (req, res, next) => {
  const { groupCode } = req.query;
  console.log(req.query);
  let tasks;
  if (groupCode) {
    const { _id } = await Group.findOne({ groupCode });
    tasks = await Task.find({
      assignTo: req.user.id,
      group: _id,
    })
      .populate("assignTo assigner subTasks")
      .populate("group");
  } else {
    tasks = await Task.find({
      assignTo: req.user.id,
    })
      .populate("assignTo assigner subTasks")
      .populate("group");
  }
  return res.status(httpStatus.OK).json({
    success: true,
    data: tasks,
    count: tasks.length,
  });
});
const endTask = AsyncErrorHandler(async (req, res, next) => {
  const { taskId, groupCode } = req.params;
  const group = await Group.findOne({ groupCode });
  const task = await Task.findById(taskId);
  if (task.status === status.Completed) {
    return next(
      new CustomError("Bu görev zaten tamamlanmış.", httpStatus.BAD_REQUEST)
    );
  }
  await Task.findByIdAndUpdate(
    taskId,
    { status: status.Completed },
    { new: true, runValidators: true }
  ).populate("assigner");

  await SubTask.updateMany(
    { task: taskId },
    { status: status.Completed },
    { new: true, runValidators: true }
  );
  // Student assign send notification
  if (task.assigner.subscribe)
    webPush.sendNotification(
      task.assigner.subscribe,
      JSON.stringify({
        title: "Bir görev tamamlandı",
        text: `${group.name} grubunda bir öğrenci görevini tamamladı, (${groupCode})`,
        href: `http://localhost:3000/tasks`,
      })
    );
  return res.status(httpStatus.OK).json({
    success: true,
    message: "Görev tamamlandı.",
  });
});
const getAllTaskLeader = AsyncErrorHandler(async (req, res, next) => {
  const { groupCode } = req.params;
  const { _id } = await Group.findOne({ groupCode });
  const tasks = await Task.find({
    group: _id,
    assigner: req.user.id,
  })
    .populate("assignTo assigner")
    .populate("group");
  return res.status(httpStatus.OK).json({
    success: true,
    data: tasks,
    count: tasks.length,
  });
});
export { singleTask, uploadFiles, allTasks, endTask, getAllTaskLeader };
