import Joi from "joi";

const CreateGroup = Joi.object({
  name: Joi.string().min(3).required().trim().messages({
    "string.email": "Geçerli bir email adresi giriniz.",
    "string.min": "İsim en az 3 karakter olmalıdır.",
  }),
});
const UpdateGroup = Joi.object({
  name: Joi.string().min(3).trim().messages({
    "string.email": "Geçerli bir email adresi giriniz.",
    "string.min": "İsim en az 3 karakter olmalıdır.",
  }),
});

export { CreateGroup, UpdateGroup };
