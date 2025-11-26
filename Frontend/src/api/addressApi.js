import axios from "axios";
import API_BASE_URL from "./api";

export function getAddressForUser(userId, authToken) {
  return axios
    .get(`${API_BASE_URL}/addresses/user/${userId}`)
    .then((res) => res.data);
    
}

export function updateAddress(addressId, body, authToken) {
  return axios
    .put(`${API_BASE_URL}/addresses/${addressId}`, body, {
      headers: { Authorization: `Basic ${authToken}` },
    })
    .then((res) => res.data.address);
}
