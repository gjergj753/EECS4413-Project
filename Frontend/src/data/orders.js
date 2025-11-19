export function saveOrder(order) {
  const history = JSON.parse(localStorage.getItem("orders") || "[]");
  history.push(order);
  localStorage.setItem("orders", JSON.stringify(history));
}

export function getOrderHistory() {
  return JSON.parse(localStorage.getItem("orders") || "[]");
}

export const mockOrders = [
  {
    id: "100001",
    date: "2025-01-14",
    total: 59.97,
    shipping: {
      name: "John Doe",
      address: "123 Maple Street",
      city: "Toronto",
      postal: "M3J 1P3",
    },
    billing: {
      cardNumber: "4242 4242 4242 4242",
      expiry: "12/28",
    },
    items: [
      { bookId: 1, title: "The Great Gatsby", quantity: 1, price: 19.99 },
      { bookId: 2, title: "A Brief History of Time", quantity: 2, price: 19.99 },
    ],
  },

  {
    id: "100002",
    date: "2025-02-11",
    total: 24.99,
    shipping: {
      name: "Emma Stone",
      address: "55 Lake Shore Blvd",
      city: "Toronto",
      postal: "M5V 2V9",
    },
    billing: {
      cardNumber: "4242 4242 4242 4242",
      expiry: "10/27",
    },
    items: [
      { bookId: 3, title: "1984", quantity: 1, price: 24.99 },
    ],
  }
];
