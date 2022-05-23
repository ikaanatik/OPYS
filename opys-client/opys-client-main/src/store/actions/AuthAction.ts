import { SetupType } from "@store/types";
import Cookies from "js-cookie";
import api from "@utils/lib/api";
import { Error, Success } from "@utils/lib/messages";
import { AuthDispatch } from "types/auth";
import { ISignInProps } from "pages/auth/signin";
import { NextRouter } from "next/router";
import { roles } from "@utils/querys";

const Login =
  (form: ISignInProps, router: NextRouter) =>
  async (dispatch: AuthDispatch) => {
    dispatch({ type: SetupType.LOGIN_START });
    try {
      const { data } = await api.post("/Auth/Login", form);
      Cookies.set("token", data.access_token);
      if (data.data.role === roles.Admin) {
        window.location.replace("/createuser");
      } else window.location.replace("/");
    } catch (e: any) {
      const { status, data } = e.response;
      Error(data.message);
    }
  };
const forgotPassword = (email: any) => async (dispatch: AuthDispatch) => {
  try {
    const { data } = await api.post("/Auth/forgotPassword", { email });
    Success(data.message);
  } catch (e: any) {
    const { status, data } = e.response;
    Error(data.message);
  }
};

const Register =
  (form: ISignInProps, router: NextRouter) =>
  async (dispatch: AuthDispatch) => {
    dispatch({ type: SetupType.LOGIN_START });
    try {
      const { data } = await api.post("/Auth/register", form);
      Success("Kullanıcı başarıyla oluşturuldu.");
      router.reload();
    } catch (e: any) {
      const { status, data } = e.response;
      Error(data.message);
      dispatch({ type: SetupType.LOGIN_RESET });
    }
  };
export default { Login, forgotPassword, Register };
