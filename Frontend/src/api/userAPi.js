import axios from "axios";
import API_BASE_URL from "./api";

export function getUserById(userId, token) {
  return axios
    .get(`${API_BASE_URL}/users/${userId}`, {
      headers: { Authorization: `Basic ${token}` },
    })
    .then(res => res.data);
}

export function updateUser(userId, body, token) {
  return axios
    .put(`${API_BASE_URL}/users/${userId}`, body, {
      headers: { Authorization: `Basic ${token}` },
    })
    .then(res => res.data);
}

