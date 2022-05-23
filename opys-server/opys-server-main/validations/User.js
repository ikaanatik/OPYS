import Joi from "joi";

const UpdateUser = Joi.object({
  email: Joi.string().trim().email().messages({
    "string.email": "Geçerli bir email adresi giriniz.",
    
  }),
  password: Joi.string().trim().min(6).max(30).messages({
    "string.min": "Şifre en az 6 karakter olmalıdır.",
    "string.max": "Şifre en fazla 30 karakter olmalıdır.",
  }),
  name: Joi.string().trim().min(3).max(30).messages({
    "string.min": "İsim en az 3 karakter olmalıdır.",
    "string.max": "İsim en fazla 30 karakter olmalıdır.",
  }),
  surname: Joi.string().trim().min(3).max(30).messages({
    "string.min": "İsim en az 3 karakter olmalıdır.",
    "string.max": "İsim en fazla 30 karakter olmalıdır.",
  }),
  profilePic: Joi.string().messages({
    "string.empty": "İsim alanı boş olamaz.",
  }),
  subscribe: Joi.object({}),
});
const UpdatePassword = Joi.object({
  oldPassword: Joi.string().trim().min(6).max(30).required().messages({
    "string.min": "Eski Şifre en az 6 karakter olmalıdır.",
    "string.max": "Eski Şifre en fazla 30 karakter olmalıdır.",
    "string.empty": "Eski Şifre alanı boş olamaz.",
  }),
  oldPasswordAgain: Joi.string().trim().min(6).max(30).messages({
    "string.min": "Eski şifre tekrarı en az 6 karakter olmalıdır.",
    "string.max": "Eski şifre tekrarı en fazla 30 karakter olmalıdır.",
    "string.empty": "Eski şifre tekrarı alanı boş olamaz.",
  }),
  newPassword: Joi.string().trim().min(6).max(30).messages({
    "string.min": "Yeni Şifre en az 6 karakter olmalıdır.",
    "string.max": "Yeni Şifre en fazla 30 karakter olmalıdır.",
    "string.empty": "Yeni Şifre alanı boş olamaz.",
  }),
});

export { UpdateUser, UpdatePassword };
