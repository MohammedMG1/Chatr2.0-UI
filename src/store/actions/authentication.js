import axios from "axios";

import * as actionTypes from "./actionTypes";

import { setErrors } from "./errors";
import jwt_decode from "jwt-decode";

const instance = axios.create({
  baseURL: "https://api-chatr.herokuapp.com/"
});


const setCurrentUser = user => ({
  type: actionTypes.SET_CURRENT_USER,
  payload: user
});

export const login = (userData, history) => {
  return async dispatch => {
    try {
      let response = await instance.post("login/", userData);
      let user = response.data;
      const decodedUser = jwt_decode(user.token);
      setAuthToken(user.token);
      dispatch(setCurrentUser(decodedUser));
      history.push("/private");
    } catch (err) {
      console.log('An error occurred.', err);
    }
  };
};


export const signup = userData => {
  return async dispatch => {
    try {
      await instance.post("signup/", userData)
    } catch (error) {
      console.error(error.response.data);
    }
  };
};

export const logout = () => {
  setAuthToken();
  return setCurrentUser();
};

const setAuthToken = token => {
  if (token) {
    axios.defaults.headers.common.Authorization = `JWT ${token}`;
    localStorage.setItem("myToken", token);
  } else {
    delete axios.defaults.headers.common.Authorization;
  }
}
export const checkForExpiredToken = () => {
  return dispatch => {

    const token = localStorage.getItem("myToken");

    if (token) {
      const currentTime = Date.now() / 1000;
      // Decode token and get user info
      const user = jwt_decode(token);
      // Check token expiration
      if (user.exp >= currentTime) {
        // Set auth token header
        setAuthToken(token);
        const decodedUser = jwt_decode(token)
        dispatch(setCurrentUser(decodedUser))
      } else {
        dispatch(logout());
      }

    }
  }
};

