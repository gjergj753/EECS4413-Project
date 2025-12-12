import axios from "axios";
import { API_ADMIN_BASE_URL } from "./api";
import API_BASE_URL from "./api"; // check for non admin functions in other files after merging


function authHeader(authToken) {
  return {
    headers: {
      Authorization: `Basic ${authToken}`,
    },
  };
}

export function getAllBooks() {
  return axios
    .get(`${API_BASE_URL}/catalog/books`) 
    .then((res) => res.data);
}

export function getAllCustomers() {
  return axios
    .get(`${API_BASE_URL}/users`) 
    .then((res) => res.data);
}

export function createBook(authToken, body) {
  return axios
    .post(`${API_ADMIN_BASE_URL}/create/book`, body, authHeader(authToken))
    .then((res) => res.data);
}

export function updateBookStock(authToken, bookId, quantity) {
  return axios
    .patch(
      `${API_ADMIN_BASE_URL}/books/${bookId}/stock`,
      {},
      {
        ...authHeader(authToken),
        params: { quantity },
      }
    )
    .then((res) => res.data);
}

export function deleteBook(authToken, bookId) {
  return axios
    .delete(`${API_ADMIN_BASE_URL}/${bookId}`, authHeader(authToken))
    .then((res) => res.data);
}

export function getSalesHistory(authToken, page = 0, size = 20) {
  return axios
    .get(`${API_ADMIN_BASE_URL}/orders`, {
      ...authHeader(authToken),
      params: { page, size }
    })
    .then((res) => res.data);
}

export function getOrderById(authToken, orderId) {
  return axios
    .get(`${API_BASE_URL}/orders/${orderId}`, authHeader(authToken))
    .then((res) => res.data);
}

export function updateCustomerDetails(authToken, userId, body) {
  return axios
    .put(`${API_ADMIN_BASE_URL}/users/${userId}`, body, authHeader(authToken))
    .then((res) => res.data);
}

export function getCustomerHistory(authToken, userId) {
  return axios
  .get(`${API_ADMIN_BASE_URL}/customers/${userId}`, authHeader(authToken))
  .then((res) => res.data);
}

export function updateOrderStatus(authToken, orderId, status) {
  return axios
    .put(
      `${API_BASE_URL}/orders/${orderId}/status`,
      {},
      {
        ...authHeader(authToken),
        params: { status }
      }
    )
    .then((res) => res.data);
}

export function cancelOrder(authToken, orderId) {
  return axios
    .delete(`${API_BASE_URL}/orders/${orderId}`, authHeader(authToken))
    .then((res) => res.data);
}

export function updateCustomerPassword(authToken, userId, newPassword) {
  return axios
  .patch(
    `${API_ADMIN_BASE_URL}/users/${userId}/password`,
    newPassword,  
    {
      headers: {
        Authorization: `Basic ${authToken}`,
        "Content-Type": "text/plain",
      },
    }
  )
  .then(res => res.data);
}
export function getCustomerFromOrder(authToken, orderId) {
  return axios
    .get(`${API_ADMIN_BASE_URL}/orders/${orderId}/user`, authHeader(authToken))
    .then(res => res.data.user);
}

export function deleteUser(userId) {
  return axios
    .delete(`${API_BASE_URL}/users/${userId}`)
    .then(res => res.data);
}
