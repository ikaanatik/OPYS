import AsyncErrorHandler from "express-async-handler";
import Post from "../models/Post.js";
import Group from "../models/group.js";
import httpStatus from "http-status";
import CustomError from "../scripts/helpers/customError.js";
const createPost = AsyncErrorHandler(async (req, res, next) => {
  const data = req.body;
  const { _id } = await Group.findOne({ groupCode: req.params.groupCode });
  const post = await Post.create({
    ...data,
    author: req.user.id,
    group: _id,
  })
  
  const newPost = await Post.findById(post._id)
    .sort({ createdAt: -1 })
    .populate("author")
    .populate("group");
  return res.status(httpStatus.OK).json({
    success: true,
    message: "Post başarıyla oluşturuldu.",
    data: newPost,
  });
});
const deletePost = AsyncErrorHandler(async (req, res, next) => {
  const { groupCode, postId } = req.params;
  const group = await Group.findOne({ groupCode });

  const post = await Post.findOne({
    author: req.user.id,
    _id: postId,
    group: group._id,
  });
  if (!post) {
    return next(new CustomError("Post bulunamadı.", httpStatus.NOT_FOUND));
  }
  await post.remove();
  return res.status(httpStatus.OK).json({
    success: true,
    message: "Post başarıyla silindi.",
  });
});
const allPosts = AsyncErrorHandler(async (req, res, next) => {
  const { _id } = await Group.findOne({ groupCode: req.params.groupCode });
  const posts = await Post.find({ group: _id })
    .sort({ createdAt: -1 })
    .populate("author")
    .populate("group")
    .limit(req?.query?.limit || 5);
  const postsCount = await Post.countDocuments({ group: _id });

  return res.status(httpStatus.OK).json({
    success: true,
    data: posts,
    count: postsCount,
  });
});

export { createPost, deletePost, allPosts };
