import express from "express";
import { createPost, deletePost, allPosts } from "../controllers/post.js";
import { groupExist, postExist } from "../middlewares/security/exits.js";
import validate from "../middlewares/validate.js";
import { CreatePost } from "../validations/Post.js";
const router = express.Router();
const globalMiddleware = [groupExist];
router.post(
  "/Create/:groupCode",
  [...globalMiddleware, validate(CreatePost)],
  createPost
);
router.delete(
  "/Delete/:groupCode/:postId",
  [...globalMiddleware, postExist],
  deletePost
);
router.get("/Posts/:groupCode", ...globalMiddleware, allPosts);

export default router;
