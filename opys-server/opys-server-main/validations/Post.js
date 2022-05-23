import Joi from "joi";
const CreatePost = Joi.object({
  content: Joi.string().required().trim().min(3).max(400).messages({
    "any.required": "İçerik alanı boş olamaz.",
    "string.empty": "İçerik alanı boş olamaz.",
    "string.min": "İçerik en az 3 karakter olmalıdır.",
    "string.max": "İçerik en fazla 400 karakter olmalıdır.",
  }),
});
export { CreatePost };
