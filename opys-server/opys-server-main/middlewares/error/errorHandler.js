import httpStatus from "http-status";
import CustomError from "../../scripts/helpers/customError.js";

const errorHandler = async (err, req, res, next) => {
  let customError = new CustomError(err.message, err.status, err.success);
  if (err.code === 11000) {
    if (Object?.keys(err?.keyValue)?.[0] === "email") {
      customError = new CustomError(
        "Email kullanımda.",
        httpStatus.CONFLICT
      );
    } else if (Object?.keys(err?.keyValue)?.[0] === "userName") {
      customError = new CustomError(
        "Bu kullanıcı adı daha önceden alınmış.",
        httpStatus.CONFLICT
      );
    }
  }
  return res
    .status(customError.status || httpStatus.INTERNAL_SERVER_ERROR)
    .json({
      success: customError.success,
      message: customError.message || "Internal Server Error",
    });
};
export default errorHandler;
