import { createContext, useContext, useState } from "react";
import { loginUser, registerUser } from "../api/authApi";
import { addItemToCart } from "../api/cartApi";

const AuthContext = createContext();

function detectCardBrand(number) {
  if (!number) return "Unknown";

  if (/^4/.test(number)) return "Visa";
  if (/^5[1-5]/.test(number)) return "MasterCard";
  if (/^3[47]/.test(number)) return "American Express";
  if (/^6(?:011|5)/.test(number)) return "Discover";

  return "Unknown";
}

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

  const cardBrand = detectCardBrand(form.cardNumber);
  const last4 = form.cardNumber.slice(-4);

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
      cardLast4: last4,
      cardBrand: cardBrand,
      expiryMonth: form.expiryMonth,
      expiryYear: form.expiryYear,
      isDefault: true
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

// UPDATE PASSWORD LOCALLY AFTER SAVING
const updatePasswordInContext = (newPassword) => {
  // rebuild Basic Auth token
  const newToken = btoa(`${user.email}:${newPassword}`);

  const updatedUser = {
    ...user,
    authToken: newToken,
  };

  setUser(updatedUser);
  localStorage.setItem("user", JSON.stringify(updatedUser));
};

  return (
    <AuthContext.Provider value={{ user, login, register, logout,   setUser,
  updatePasswordInContext }}>
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  return useContext(AuthContext);
}

