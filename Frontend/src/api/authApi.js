import API_BASE_URL from "./api";
import axios from "axios";

export async function registerUser(form) {
  return axios.post(`${API_BASE_URL}/auth/register`, {
    firstName: form.firstName,
    lastName: form.lastName,
    email: form.email,
    hashedPassword: form.password   
  })
    .then(res => res.data)
    .catch(err => { throw err; });
}

export async function loginUser(email, password) {
  return axios.post(`${API_BASE_URL}/auth/login`, {
    email,
    password
  })
    .then(res => res.data)
    .catch(err => { throw err; });
}

