import { createContext, useContext, useState } from "react";
import { loginUser, registerUser } from "../api/authApi";
import { addItemToCart } from "../api/cartApi";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Load stored user
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });


  const login = async (email, password) => {
    try {
      const res = await loginUser(email, password);

      const authToken = btoa(`${email}:${password}`);

      const loggedInUser = {
        ...res.user,
        email,
        authToken,  
      };

      // Save user
      setUser(loggedInUser);
      localStorage.setItem("user", JSON.stringify(loggedInUser));

      // MERGE GUEST CART
      const guestCart = JSON.parse(localStorage.getItem("cart") || "[]");

      if (guestCart.length > 0) {
        for (const item of guestCart) {
          await addItemToCart(
            loggedInUser.userId,
            item.book.bookId,
            item.quantity,
            loggedInUser.authToken 
          );
        }

        // Clear guest cart
        localStorage.removeItem("cart");

        // Tell CartContext to reload backend cart
        localStorage.setItem("forceReloadCart", "1");
      }

      return { success: true };
    } catch (err) {
      throw new Error(err.response?.data?.message || "Login failed");
    }
  };

  // REGISTER
const register = async (form) => {
  // Build backend payload
  const requestBody = {
    user: {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      hashedPassword: form.password,
    },
    address: {
      street: form.street,
      city: form.city,
      province: form.province,
      postalCode: form.postalCode,
      country: form.country,
    },
    paymentMethod: {
      cardHolderName: form.cardHolderName,     // <-- user typed
      cardNumber: form.cardNumber,
      expiryMonth: Number(form.expiryMonth),
      expiryYear: Number(form.expiryYear),
      cvv: form.cvv,
    },
  };
  console.log("REGISTER USER API CALL BODY:", requestBody);
  // call backend
  const res = await registerUser(requestBody);

  if (!res.user) throw new Error("Registration failed");

  // create token for persistence
  const authToken = btoa(`${form.email}:${form.password}`);

  const storedUser = {
    ...res.user,
    email: form.email,
    authToken,
  };

  setUser(storedUser);
  localStorage.setItem("user", JSON.stringify(storedUser));

  return storedUser;
};


  // LOGOUT
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("sessionToken");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

