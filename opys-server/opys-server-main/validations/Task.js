import Joi from "joi";

const CreateTask = Joi.object({
  name: Joi.string().required().min(3).max(50).messages({
    "string.empty": "Görev adı boş olamaz.",
    "string.base": "Görev adı alanına bir metin girmelisiniz.",
    "string.min": "Görev adı en az 3 karakterden oluşmalıdır.",
    "string.max": "Görev adı en fazla 50 karakterden oluşmalıdır.",
  }),
  description: Joi.string().required().min(3).messages({
    "string.empty": "Görev açıklaması boş olamaz.",
    "string.base": "Görev açıklaması boş olamaz.",
    "string.min": "Görev açıklaması en az 3 karakterden oluşmalıdır.",
    "any.required": "Görev açıklaması boş olamaz.",
  }),
  deadline: Joi.date().required().messages({
    "string.empty": "Görev bitiş tarihi boş olamaz.",
    "date.base": "Görev bitiş tarihi geçerli bir tarih olmalıdır.",
    "any.required": "Görev bitiş tarihi boş olamaz.",
  }),
  assignTo: Joi.string().required().messages({
    "string.base": "Öğrenci ID'si gereklidir.",
    "string.empty": "Öğrenci ID'si gereklidir.",
    "string.pattern.base": "Öğrenci ID'si geçerli bir değer olmalıdır.",
    "any.required": "Öğrenci ID'si gereklidir.",
  }),
});

const UpdateTask = Joi.object({
  name: Joi.string().trim().min(3).max(50).messages({
    "string.empty": "Görev adı boş olamaz.",
    "string.base": "Görev adı alanına bir metin girmelisiniz.",
    "string.min": "Görev adı en az 3 karakterden oluşmalıdır.",
    "string.max": "Görev adı en fazla 50 karakterden oluşmalıdır.",
  }),
  description: Joi.string().trim().min(3).messages({
    "string.empty": "Görev açıklaması boş olamaz.",
    "string.base": "Görev açıklaması boş olamaz.",
    "string.min": "Görev açıklaması en az 3 karakterden oluşmalıdır.",
    "any.required": "Görev açıklaması boş olamaz.",
  }),
  deadline: Joi.date().messages({
    "string.empty": "Görev bitiş tarihi boş olamaz.",
    "date.base": "Görev bitiş tarihi geçerli bir tarih olmalıdır.",
    "any.required": "Görev bitiş tarihi boş olamaz.",
  }),
});

export { CreateTask, UpdateTask };
