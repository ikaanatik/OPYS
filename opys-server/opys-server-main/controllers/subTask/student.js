import AsyncErrorHandler from "express-async-handler";
import Group from "../../models/group.js";
import SubTask from "../../models/SubTask.js";
import httpStatus from "http-status";
import CustomError from "../../scripts/helpers/customError.js";
import { uploadFileReq } from "../../scripts/helpers/multer.js";
import User from "../../models/User.js";
import { roles, status } from "../../scripts/helpers/querys.js";
import webPush from "web-push";
import moment from "moment";
const singleSubTask = AsyncErrorHandler(async (req, res, next) => {
  const { groupCode, taskId, subTaskId } = req.params;
  const { _id } = await Group.findOne({ groupCode });
  const subTask = await SubTask.findOne({
    group: _id,
    assignTo: req.user.id,
    task: taskId,
    _id: subTaskId,
  })
    .populate("assignTo assigner")
    .populate("group");

  return res.status(httpStatus.OK).json({
    success: true,
    data: subTask,
  });
});
const uploadFiles = AsyncErrorHandler(async (req, res, next) => {
  const { name, surname, uuid } = await User.findById(req.user.id);
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
        "Bu alt görevin son yükleme tarihi geçti.",
        httpStatus.BAD_REQUEST
      )
    );
  }
  await req.files.map(async (item) => {
    await uploadFileReq(
      item,
      `/Sub Tasks/${req.params.groupCode}/${name}-${surname}-${uuid}`
    )
      .then(async (response) => {
        await SubTask.findByIdAndUpdate(
          subTaskId,
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
        if (subscribeTeacher)
          webPush.sendNotification(
            subscribeTeacher,
            JSON.stringify({
              title: "Yeni bir dosya yüklendi",
              text: `${groupCode} grubundaki alt görev'e ${
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
    message: "Dosyalar yüklendi.",
  });
});
const allSubTasks = AsyncErrorHandler(async (req, res, next) => {
  const { groupCode } = req.params;
  let subTasks;
  const { id } = req.user;

  if (groupCode) {
    const { _id } = await Group.findOne({ groupCode });
    subTasks = await SubTask.find({
      assignTo: id,
      group: _id,
    })
      .populate("assignTo assigner task")
      .populate("group");
  } else {
    subTasks = await SubTask.find({
      assignTo: id,
    })
      .populate("assignTo assigner")
      .populate("group");
  }
  return res.status(httpStatus.OK).json({
    success: true,
    data: subTasks,
    count: subTasks.length,
  });
});
const endSubTask = AsyncErrorHandler(async (req, res, next) => {
  const { subTaskId, groupCode } = req.params;
  const group = await Group.findOne({ groupCode });
  const subTask = await SubTask.findByIdAndUpdate(
    subTaskId,
    { status: status.Completed },
    { new: true, runValidators: true }
  ).populate("assigner");
  if (subTask.assigner.subscribe)
    webPush.sendNotification(
      subTask.assigner.subscribe,
      JSON.stringify({
        title: "Bir alt görev tamamlandı",
        text: `${group.name} grubunda bir öğrenci görevini tamamladı (${groupCode}).`,
        href: `http://localhost:3000/subtasks`,
      })
    );
  return res.status(httpStatus.OK).json({
    success: true,
    message: "Alt Görev tamamlandı.",
  });
});
export { singleSubTask, uploadFiles, allSubTasks, endSubTask };
