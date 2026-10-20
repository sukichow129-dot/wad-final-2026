// src/context/UserContext.jsx

import { createContext, useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check current logged-in user
  async function checkUser() {
    try {
      const response = await fetch(`${API_URL}/api/user`, {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Check user error:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  // Login
  async function login(email, password) {
    try {
      const response = await fetch(`${API_URL}/api/user`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || "Login failed",
        };
      }

      setUser(data.user);

      return {
        success: true,
        user: data.user,
      };
    } catch (error) {
      console.error("Login error:", error);

      return {
        success: false,
        message: "Cannot connect to server",
      };
    }
  }

  // Logout
  async function logout() {
    try {
      await fetch(`${API_URL}/api/user`, {
        method: "DELETE",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }

    setUser(null);
  }

  useEffect(() => {
    checkUser();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        checkUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}