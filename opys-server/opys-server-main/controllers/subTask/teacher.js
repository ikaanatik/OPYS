import SubTask from "../../models/SubTask.js";
import Group from "../../models/group.js";
import AsyncErrorHandler from "express-async-handler";
import httpStatus from "http-status";
import User from "../../models/User.js";
import CustomError from "../../scripts/helpers/customError.js";
import { roles, status } from "../../scripts/helpers/querys.js";
import Task from "../../models/Task.js";
import moment from "moment";
import { uploadFileReq } from "../../scripts/helpers/multer.js";
import webPush from "web-push";
const create = AsyncErrorHandler(async (req, res, next) => {
  let data = req.body;
  const { groupCode, taskId, studentId } = req.params;
  data.deadline = new Date(data.deadline).getTime();
  const student = await User.findById(studentId);
  const group = await Group.findOne({
    groupCode,
  });
  const studenGroupExist = await Group.findOne({
    groupCode,
    students: { $in: [studentId] },
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

  const subTask = await SubTask.create({
    ...data,
    assigner: req.user.id,
    assignTo: studentId,
    task: taskId,
    group: group._id,
  });
  // Student assign send notification
  if (student.subscribe)
    webPush.sendNotification(
      student.subscribe,
      JSON.stringify({
        title: "Yeni bir alt göreviniz var",
        text: `${group.name} grubunda öğretmeniniz tarafından yeni bir alt görev eklendi, eklenen göreve gitmek için tıklayınız. (${groupCode})`,
        href: `http://localhost:3000/groups/${groupCode}/task/subtask/${subTask._id}?taskId=${taskId}&studentId=${studentId}`,
      })
    );
  const newSubTask = await SubTask.findById(subTask._id)
    .sort({ createdAt: -1 })
    .populate("assigner assignTo");
  return res.status(httpStatus.OK).json({
    success: true,
    data: newSubTask,
    message: "Alt Görev oluşturuldu.",
  });
});
const removeSubTask = AsyncErrorHandler(async (req, res, next) => {
  const subTask = await SubTask.findById(req.params.subTaskId);

  await subTask.remove();
  return res.status(httpStatus.OK).json({
    success: true,
    message: "Alt Görev başarıyla silindi.",
  });
});
const singleSubTask = AsyncErrorHandler(async (req, res, next) => {
  const subTask = await SubTask.findById(req.params.subTaskId).populate(
    "assignTo assigner"
  );
  return res.status(httpStatus.OK).json({
    success: true,
    data: subTask,
  });
});
const allSubTasks = AsyncErrorHandler(async (req, res, next) => {
  const { groupCode, taskId } = req.params;
  const { id } = req.user;
  let subTasks;
  if (groupCode) {
    const { _id } = await Group.findOne({ groupCode });
    subTasks = await SubTask.find({
      assigner: id,
      // group: _id,
      // task: taskId,
    })
      .populate("assignTo assigner task")
      .populate("group");
  } else {
    subTasks = await SubTask.find({
      assigner: id,
    })
      .populate("assignTo assigner task")
      .populate("group");
  }
  return res.status(httpStatus.OK).json({
    success: true,
    data: subTasks,
    count: subTasks.length,
  });
});
const update = AsyncErrorHandler(async (req, res, next) => {
  let data = req.body;
  data.deadline = new Date(data.deadline).getTime();

  const { groupCode, subTaskId } = req.params;
  const subTask = await SubTask.findById(subTaskId);

  const group = await Group.findOne({ groupCode });
  if (group._id.toString() !== subTask.group.toString()) {
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
  const updateSubTask = await SubTask.findByIdAndUpdate(subTaskId, data, {
    new: true,
    runValidators: true,
  });
  return res.status(httpStatus.OK).json({
    success: true,
    data: updateSubTask,
    message: "Alt Görev güncellendi.",
  });
});
const uploadFiles = AsyncErrorHandler(async (req, res, next) => {
  const { name, surname } = await User.findById(req.user.id);

  const { groupCode, subTaskId } = req.params;
  const subTask = await SubTask.findById(subTaskId).populate(
    "assignTo assigner"
  );
  if (subTask.status === status.Starting) {
    await SubTask.findByIdAndUpdate(
      subTaskId,
      { status: status.InProgress },
      { new: true, runValidators: true }
    );
  }
  if (Date.now() > subTask.deadline) {
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
      `/Sub Tasks/${groupCode}/${subTask.assignTo.name}-${subTask.assignTo.surname}-${subTask.assignTo.uuid}`
    )
      .then(async (response) => {
        await SubTask.findByIdAndUpdate(
          subTaskId,
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
        if (subscribeStudent)
          webPush.sendNotification(
            subscribeStudent,
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
const endSubTask = AsyncErrorHandler(async (req, res, next) => {
  const { subTaskId, groupCode } = req.params;
  const group = await Group.findOne({ groupCode });
  const subTask = await SubTask.findByIdAndUpdate(
    subTaskId,
    { status: status.Completed },
    { new: true, runValidators: true }
  ).populate("assigner assignTo");
  // Student assign send notification
  if (subTask.assignTo.subscribe)
    webPush.sendNotification(
      subTask.assignTo.subscribe,
      JSON.stringify({
        title: "Bir görev tamamlandı",
        text: `${group.name} grubunda bir öğretmeniniz görevinizi sonlandırdı. (${groupCode})`,
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
  removeSubTask,
  singleSubTask,
  allSubTasks,
  update,
  uploadFiles,
  endSubTask,
};
