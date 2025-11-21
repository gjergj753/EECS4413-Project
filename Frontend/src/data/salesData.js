//dummy sales/orders data for admin sales page
export const mockSales = [
  {
    orderId: 100001,
    createdAt: "2025-01-03T15:30:00",
    totalPrice: 34.97, 
    status: "COMPLETED",
    user: {
      id: 1,
      firstName: "John",
      lastName: "Doe",
      email: "john@gmail.com"
    },
    orderItemList: [
      {
        orderItemId: 1,
        quantity: 1,
        price: 12.99,
        book: {
          id: 1,
          title: "The Great Gatsby"
        }
      },
      {
        orderItemId: 2,
        quantity: 2,
        price: 10.99,
        book: {
          id: 5,
          title: "To Kill a Mockingbird"
        }
      }
    ],
    payment: {
      status: "PAID",
      method: "CARD"
    }
  },

  {
    orderId: 100002,
    createdAt: "2025-01-09T10:10:00",
    totalPrice: 15.99,
    status: "COMPLETED",
    user: {
      id: 2,
       firstName: "Sarah",
      lastName: "Doe",
      email: "sarah@gmail.com"
    },
    orderItemList: [
      {
        orderItemId: 3,
        quantity: 1,
        price: 15.99,
        book: {
          id: 4,
          title: "Dune"
        }
      }
    ],
    payment: {
      status: "PAID",
      method: "CARD"
    }
  },

  {
    orderId: 100003,
    createdAt: "2025-01-12T12:45:00",
    totalPrice: 39.5, 
    status: "PROCESSING",
    user: {
      id: 1,
       firstName: "John",
      lastName: "Doe",
      email: "john@gmail.com"
    },
    orderItemList: [
      {
        orderItemId: 4,
        quantity: 1,
        price: 18.5,
        book: {
          id: 5,
          title: "To Kill a Mockingbird"
        }
      },
      {
        orderItemId: 5,
        quantity: 1,
        price: 21.0,
        book: {
          id: 3,
          title: "Sapiens: A Brief History of Humankind"
        }
      }
    ],
    payment: {
      status: "PAID",
      method: "CARD"
    }
  }
];
