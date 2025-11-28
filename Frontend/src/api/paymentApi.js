import axios from "axios";
import API_BASE_URL from "./api";

export function getUserPaymentMethods(userId, token) {
  return axios
    .get(`${API_BASE_URL}/payment-methods/user/${userId}`, {
      headers: { Authorization: `Basic ${token}` },
    })
    .then(res => res.data);
}

export function addPaymentMethod(userId, body, token) {
  return axios
    .post(`${API_BASE_URL}/payment-methods/user/${userId}`, body, {
      headers: { Authorization: `Basic ${token}` },
    })
    .then(res => res.data);
}

export function deletePaymentMethod(paymentId, userId, token) {
  return axios
    .delete(`${API_BASE_URL}/payment-methods/${paymentId}?userId=${userId}`, {
      headers: { Authorization: `Basic ${token}` },
    })
    .then(res => res.data);
}


export function getUserDefaultPaymentMethod(userId, token) {
  return axios
    .get(`${API_BASE_URL}/payment-methods/user/${userId}/default`, {
      headers: { Authorization: `Basic ${token}` },
    })
    .then((res) => res.data.paymentMethod);
} 

export function setUserDefaultPaymentMethod(paymentMethodId, userId, token) {
  return axios
    .patch(
      `${API_BASE_URL}/payment-methods/${paymentMethodId}/default?userId=${userId}`, null, { 
        headers: { Authorization: `Basic ${token}` }, 
    })
    .then(res => res.data);
}
