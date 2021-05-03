import createDataContext from "./createDataContext";
import axios from "../api/axios";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { navigate } from "../navigationRef";

const authReducer = (state, action) => {
  switch (action.type) {
    case "add_err":
      return { ...state, errorMessage: action.payload };
    case "signin":
      return {
        errorMessage: "",
        token: action.payload.token,
        username: action.payload.username,
      };
    case "clear_err_msg":
      return { ...state, errorMessage: "" };
    case "signout":
      return { token: null, errorMessage: "", username: "" };
    default:
      return state;
  }
};

const clearErrorMessage = (dispatch) => () => {
  dispatch({ type: "clear_err_msg" });
};

const tryLocalSignin = (dispatch) => async () => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    const res = await axios.get("/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    dispatch({ type: "signin", payload: { token, username: res.data } });
    navigate("Personal");
  } else {
    navigate("loginFlow");
  }
};

const signout = (dispatch) => async () => {
  await AsyncStorage.removeItem("token");
  dispatch({ type: "signout" });
  navigate("loginFlow");
};

const signin = (dispatch) => {
  return async ({ username, password }) => {
    // make api request to signup
    try {
      const res = await axios.post("/signin", { username, password });
      console.log(res.data);
      await AsyncStorage.setItem("token", res.data.token);
      dispatch({
        type: "signin",
        payload: { token: res.data.token, username },
      });
      navigate("Personal");
    } catch (err) {
      dispatch({
        type: "add_err",
        payload: "Something went wrong with log in",
      });
    }
  };
};

const signup = (dispatch) => async ({ fullname, username, password }) => {
  // signin
  try {
    const res = await axios.post("/signup", { fullname, username, password });
    console.log(res.data);
    // Store jwt to device
    //await AsyncStorage.setItem("token", res.data.token);
    //dispatch({ type: "signin", payload: res.data.token });

    navigate("Signin");
  } catch (err) {
    dispatch({ type: "add_err", payload: "Something went wrong with sign up" });
  }
};

export const { Provider, Context } = createDataContext(
  authReducer,
  { signin, signout, signup, clearErrorMessage, tryLocalSignin, signout },
  { token: null, errorMessage: "", username: "" }
);
