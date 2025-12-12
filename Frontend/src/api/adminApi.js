import axios from "axios";
import { API_ADMIN_BASE_URL } from "./api";
import API_BASE_URL from "./api";

function authHeader(authToken) {
  return {
    headers: {
      Authorization: `Basic ${authToken}`,
    },
  };
}


//------------ BOOKS ------------
export async function getAllBooks() { //paginated
  try {
    const first = await axios
      .get(`${API_BASE_URL}/catalog/books`, { params: { page: 0, size: 100 } })
      .then(res => res.data);

    const totalPages = first.totalPage;
    const results = [...first.bookList];

    // fetch remaining pages if any in parallel
    if (totalPages > 1) {
      const requests = [];

      for (let p = 1; p < totalPages; p++) {
        requests.push(
          axios
            .get(`${API_BASE_URL}/catalog/books`, {
              params: { page: p, size: 100 }
            })
            .then(res => res.data.bookList)
        );
      }

      const pages = await Promise.all(requests);
      pages.forEach(list => results.push(...list));
    }

    return results; //returns a list
  } catch (err) {
    console.error("Error fetching all books:", err);
    throw err;
  }
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


//------------ USERS / CUSTOMERS ------------
export async function getAllCustomers() { //paginated
  try {
    const first = await axios
      .get(`${API_BASE_URL}/users`, { params: { page: 0, size: 100 } })
      .then(res => res.data);

    const totalPages = first.totalPage;
    const results = [...first.userList];

    // fetch remaining pages if any in parallel
    if (totalPages > 1) {
      const requests = [];

      for (let p = 1; p < totalPages; p++) {
        requests.push(
          axios
            .get(`${API_BASE_URL}/users`, {
              params: { page: p, size: 100 }
            })
            .then(res => res.data.userList)
        );
      }

      const pages = await Promise.all(requests);
      pages.forEach(list => results.push(...list));
    }

    return results; //returns a list
  } catch (err) {
    console.error("Error fetching all customers:", err);
    throw err;
  }
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

export function deleteCustomer(userId) {
  return axios
    .delete(`${API_BASE_URL}/users/${userId}`)
    .then(res => res.data);
}


//------------ ORDERS ------------
export async function getAllOrders(authToken) { //paginated
  try {
    const first = await axios
      .get(`${API_ADMIN_BASE_URL}/orders`, {
        ...authHeader(authToken),
        params: { page: 0, size: 100 }
      })
      .then(res => res.data);

    const totalPages = first.totalPage;
    const results = [...first.orderList];

    // fetch remaining pages if any in parallel
    if (totalPages > 1) {
      const requests = [];

      for (let p = 1; p < totalPages; p++) {
        requests.push(
          axios
            .get(`${API_ADMIN_BASE_URL}/orders`, {
              ...authHeader(authToken),
              params: { page: p, size: 100 }
            })
            .then(res => res.data.orderList)
        );
      }

      const pages = await Promise.all(requests);
      pages.forEach(list => results.push(...list));
    }

    return results; //returns a list
  } catch (err) {
    console.error("Error fetching all orders:", err);
    throw err;
  }
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

export function getCustomerFromOrder(authToken, orderId) {
  return axios
    .get(`${API_ADMIN_BASE_URL}/orders/${orderId}/user`, authHeader(authToken))
    .then(res => res.data.user);
}