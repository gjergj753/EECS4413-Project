import axios from "axios";
import API_BASE_URL from "./api";

export function checkoutOrder(payload, token) {
  return axios.post(`${API_BASE_URL}/orders/checkout`, payload, {
    headers: { Authorization: `Basic ${token}` },
  })
  .then(res => res.data);
}