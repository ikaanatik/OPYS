import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import httpStatus from "http-status";
import CustomError from "../../scripts/helpers/customError.js";
const accessToRoute = (req, res, next) => {
  if (!IsTokenIncluded(req)) {
    return next(
      new CustomError(
        "Bu sayfayı görüntüleyeme yetkiniz yok.",
        httpStatus.FORBIDDEN
      )
    );
  }
  const token = getAccessTokenFromHeader(req);
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decodeToken) => {
    if (err) {
      return next(
        new CustomError(
          "Bu sayfayı görüntüleyeme yetkiniz yok.",
          httpStatus.UNAUTHORIZED
        )
      );
    }
    req.user = {
      id: decodeToken.id,
      email: decodeToken.email,
      name: decodeToken.name,
      surname: decodeToken.surname,
      role: decodeToken.role,
    };
    next();
  });
};
const sendTokenClient = (user, req, res) => {
  const access_token = user.generateJWTToken();
  const expires = new Date(new Date().setDate(new Date().getDate() + 7));

  req.headers.authorization = `Bearer ${access_token}`;
  return res
    .status(httpStatus.OK)
    .cookie("access_token", access_token, {
      httpOnly: true,
      expires,
      secure: process.env.NODE_ENV === "development" ? false : true,
    })
    .json({
      success: true,
      data: user,
      access_token,
    });
};
const IsTokenIncluded = (req) => {
  return (
    req.headers.authorization && req.headers.authorization.startsWith("Bearer")
  );
};

const getAccessTokenFromHeader = (req) => {
  const authorization = req.headers.authorization;
  const access_token = authorization.split(" ")[1];
  return access_token;
};

const comparePassword = (password, hashPassword) => {
  return bcrypt.compareSync(password, hashPassword);
};
const decodeToken = (req) => {
  const access_token = getAccessTokenFromHeader(req);
  const decodeToken = jwt.decode(access_token);
  return decodeToken;
};
export {
  decodeToken,
  comparePassword,
  accessToRoute,
  sendTokenClient,
  IsTokenIncluded,
  getAccessTokenFromHeader,
};
