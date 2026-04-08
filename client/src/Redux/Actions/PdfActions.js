import axios from "axios";
import {
  PDF_CREATE_REVIEW_FAIL,
  PDF_CREATE_REVIEW_REQUEST,
  PDF_CREATE_REVIEW_SUCCESS,
  PDF_DETAILS_FAIL,
  PDF_DETAILS_REQUEST,
  PDF_DETAILS_SUCCESS,
  PDF_LIST_FAIL,
  PDF_LIST_REQUEST,
  PDF_LIST_SUCCESS,
} from "../Constants/PdfConstants";
import { logout } from "./userActions";

export const listPdf = () => async (dispatch) => {
  try {
    dispatch({ type: PDF_LIST_REQUEST });
    const { data } = await axios.get(`/api/pdf/all`);
    const pdfsData = data.data;
    dispatch({ type: PDF_LIST_SUCCESS, payload: pdfsData });
  } catch (error) {
    dispatch({
      type: PDF_LIST_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const listPdfDetails = (id) => async (dispatch) => {
  try {
    dispatch({ type: PDF_DETAILS_REQUEST });
    const { data } = await axios.get(`/api/pdf/${id}`);
    const pdfData = data.data;
    dispatch({ type: PDF_DETAILS_SUCCESS, payload: pdfData });
  } catch (error) {
    dispatch({
      type: PDF_DETAILS_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const createPdfReview =
  (productId, review) => async (dispatch, getState) => {
    try {
      dispatch({ type: PDF_CREATE_REVIEW_REQUEST });

      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      await axios.post(`/api/pdf/${productId}/review`, review, config);
      dispatch({ type: PDF_CREATE_REVIEW_SUCCESS });
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      if (message === "Not authorized, token failed") {
        dispatch(logout());
      }
      dispatch({
        type: PDF_CREATE_REVIEW_FAIL,
        payload: message,
      });
    }
  };
