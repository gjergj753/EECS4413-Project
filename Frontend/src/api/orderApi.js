import axios from "axios";
import API_BASE_URL from "./api";

function authHeader(authToken) {
  return {
    headers: {
      Authorization: `Basic ${authToken}`,
    },
  };
}

export function getUserOrderById(orderId, authToken) {
  return axios
    .get(`${API_BASE_URL}/orders/${orderId}`, authHeader(authToken))
    .then(res => res.data);
}

export function getUserOrders(userId, authToken) {
  return axios
    .get(`${API_BASE_URL}/orders/user/${userId}`, authHeader(authToken))
    .then(res => res.data);
}