import Task from "../../models/Task.js";
import Group from "../../models/group.js";
import AsyncErrorHandler from "express-async-handler";
import httpStatus from "http-status";
import User from "../../models/User.js";
import CustomError from "../../scripts/helpers/customError.js";
import { roles, status } from "../../scripts/helpers/querys.js";
import webPush from "web-push";
import moment from "moment";
import { uploadFileReq } from "../../scripts/helpers/multer.js";
import SubTask from "../../models/SubTask.js";
const create = AsyncErrorHandler(async (req, res, next) => {
  let data = req.body;
  const { groupCode } = req.params;
  data.deadline = new Date(data.deadline).getTime();
  const student = await User.findById(data.assignTo);
  const group = await Group.findOne({
    groupCode,
  });
  const studenGroupExist = await Group.findOne({
    groupCode,
    students: { $in: [data.assignTo] },
  });
  if (!studenGroupExist) {
    return next(
      new CustomError(
        "Öğrenciye atanmış bir grup bulunamadı.",
        httpStatus.NOT_FOUND
      )
    );
  } else if (student.role !== roles.Student) {
    return next(
      new CustomError(
        "Sadece öğrencilere görev atıyabilirsiniz.",
        httpStatus.NOT_FOUND
      )
    );
  } else if (Date.now() >= data.deadline) {
    return next(
      new CustomError(
        "Görev bitiş tarihi bugünden önce olamaz.",
        httpStatus.NOT_FOUND
      )
    );
  }

  const task = await Task.create({
    ...data,
    assigner: req.user.id,
    group: group._id,
  });
  // Student assign send notification
  if (student.subscribe)
    webPush.sendNotification(
      student.subscribe,
      JSON.stringify({
        title: "Yeni bir göreviniz var",
        text: `${group.name} grubunda öğretmeniniz tarafından yeni bir görev eklendi, eklenen göreve gitmek için tıklayınız.`,
        href: `http://localhost:3000/groups/${groupCode}/task/${task._id}?studentId=${student._id}`,
      })
    );
  const newTask = await Task.findById(task._id)
    .sort({ createdAt: -1 })
    .populate("assigner assignTo");
  return res.status(httpStatus.OK).json({
    success: true,
    data: newTask,
    message: "Görev oluşturuldu.",
  });
});
const removeTask = AsyncErrorHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.taskId);
  await task.remove();
  return res.status(httpStatus.OK).json({
    success: true,
    message: "Görev başarıyla silindi.",
  });
});
const singleTask = AsyncErrorHandler(async (req, res, next) => {
  const { groupCode, studentId, taskId } = req.params;
  const { _id } = await Group.findOne({ groupCode });
  const tasks = await Task.findOne({
    group: _id,
    assignTo: studentId,
    _id: taskId,
  })
    .populate("assignTo assigner")
    .populate("group");
  return res.status(httpStatus.OK).json({
    success: true,
    data: tasks,
  });
});
const allTasks = AsyncErrorHandler(async (req, res, next) => {
  const { groupCode } = req.query;
  const { id } = req.user;
  let tasks;

  if (groupCode) {
    const { _id } = await Group.findOne({ groupCode });
    tasks = await Task.find({
      assigner: id,
      group: _id,
    })
      .populate("assignTo assigner")
      .populate("group")
      .populate("subTasks")
      .sort({ createdAt: -1 });
  } else {
    tasks = await Task.find({
      assigner: id,
    })
      .populate("assignTo assigner")
      .populate("group")
      .populate("subTasks")
      .sort({ createdAt: -1 });
  }
  return res.status(httpStatus.OK).json({
    success: true,
    data: tasks,
    count: tasks.length,
  });
});
const update = AsyncErrorHandler(async (req, res, next) => {
  let data = req.body;
  data.deadline = new Date(data.deadline).getTime();

  const { taskId, groupCode } = req.params;
  const task = await Task.findById(taskId);

  const group = await Group.findOne({ groupCode });
  if (group._id.toString() !== task.group.toString()) {
    return next(
      new CustomError(
        "Bu grup id'si bu göreve ait değildir.",
        httpStatus.BAD_REQUEST
      )
    );
  } else if (Date.now() >= data.deadline) {
    return next(
      new CustomError(
        "Görev bitiş tarihi bugünden önce olamaz.",
        httpStatus.BAD_REQUEST
      )
    );
  }
  const updateTask = await Task.findByIdAndUpdate(taskId, data, {
    new: true,
    runValidators: true,
  }).populate("assigner");

  // Student
  if (updateTask.assigner.subscribe)
    webPush.sendNotification(
      updateTask.assigner.subscribe,
      JSON.stringify({
        title: "Görev güncellendi.",
        text: "Gitmek için lütfen bu iletiye dokunun.",
        href: "https://www.youtube.com/watch?v=823LWuBFPJw",
      })
    );

  return res.status(httpStatus.OK).json({
    success: true,
    data: updateTask,
    message: "Görev güncellendi.",
  });
});
const uploadFiles = AsyncErrorHandler(async (req, res, next) => {
  const { name, surname } = await User.findById(req.user.id);
  const { groupCode, taskId } = req.params;
  const task = await Task.findById(taskId).populate("assignTo assigner");
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
  await req.files.map(async (item) => {
    await uploadFileReq(
      item,
      `/Tasks/${groupCode}/${task.assignTo.name}-${task.assignTo.surname}-${task.assignTo.uuid}`
    )
      .then(async (response) => {
        await Task.findByIdAndUpdate(
          taskId,
          {
            $push: {
              uploads: {
                ...response,
                role: roles.Teacher,
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
        if (task.assignTo.subscribe)
          webPush.sendNotification(
            task.assignTo.subscribe,
            JSON.stringify({
              title: "Yeni bir dosya yüklendi",
              text: `${groupCode} grubundaki görev'e ${
                task.assigner.name + " " + task.assigner.surname
              } tarafından dosya yüklendi, yüklenen dosyaya gitmek için tıklayınız.`,
              href: response.Location,
            })
          );
      })
      .catch((err) => {
        return next(
          new CustomError(
            "Bir hata oluştu lütfen tekrar deneyiniz",
            httpStatus.BAD_REQUEST
          )
        );
      });
  });

  return res.status(httpStatus.OK).json({
    success: true,
    message: req.files.length >= 1 ? "Dosya yüklendi." : "Dosyalar yüklendi.",
  });
});
const endTask = AsyncErrorHandler(async (req, res, next) => {
  const { taskId, groupCode } = req.params;
  const task = await Task.findById(taskId);
  const group = await Group.findOne({ groupCode });
  if (task.status === status.Completed) {
    return next(
      new CustomError("Bu görev zaten tamamlanmış.", httpStatus.BAD_REQUEST)
    );
  }
  await Task.findByIdAndUpdate(
    taskId,
    { status: status.Completed },
    { new: true, runValidators: true }
  ).populate("assigner assignTo");
  await SubTask.updateMany(
    { task: taskId },
    { status: status.Completed },
    { new: true, runValidators: true }
  );
  // Student assign send notification
  if (task.assignTo.subscribe)
    webPush.sendNotification(
      task.assignTo.subscribe,
      JSON.stringify({
        title: "Bir görev tamamlandı",
        text: `${group.name} grubunda bir öğretmeniniz görevinizi bitirdi. (${groupCode})`,
        href: `http://localhost:3000/tasks`,
      })
    );
  return res.status(httpStatus.OK).json({
    success: true,
    message: "Görev tamamlandı.",
  });
});
export {
  create,
  removeTask,
  singleTask,
  allTasks,
  update,
  uploadFiles,
  endTask,
};
