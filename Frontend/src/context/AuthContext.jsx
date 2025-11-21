import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });


  const login = async (email, password) => {
    // dummy authentication, replace with API call later

    // dummyadmin
    if (email === "admin@bookstore.com" && password === "admin123") {
      const dummyAdmin = {
        firstName: "Admin",
        lastName: "A",
        email,
        isAdmin: true,
      };
      setUser(dummyAdmin);
      localStorage.setItem("user", JSON.stringify(dummyAdmin));
      return { success: true };

    // dummy customer
    } else if (email === "johndoe@gmail.com" && password === "password") {
      const dummyUser = {
        firstName: "John",
        lastName: "Doe",
        email,
        isAdmin: false,
      };
      setUser(dummyUser);
      localStorage.setItem("user", JSON.stringify(dummyUser));
      return { success: true };


    } else {
      throw new Error("Invalid email or password");
    }
  };


  const register = async (formData) => {
    // call backend
    console.log("Registering user:", formData);
    const dummyUser = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      isAdmin: false,
    };
    setUser(dummyUser);
    localStorage.setItem("user", JSON.stringify(dummyUser));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
