"use client";
import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

// Create a provider component
export const AuthProvider = ({ children }) => {
  const [userEmail, setUserEmail] = useState(null);
  const [graduationYear, setGraduationYear] = useState(null);

  useEffect(() => {
    // Initialize userEmail and graduationYear from localStorage
    const storedEmail = localStorage.getItem("userEmail");
    const storedGraduationYear = localStorage.getItem("graduationYear");

    if (storedEmail) setUserEmail(storedEmail);
    if (storedGraduationYear) setGraduationYear(storedGraduationYear);

    // Add listener for beforeunload to clear localStorage
    const handleBeforeUnload = () => {
      localStorage.clear();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Function to handle login
  const login = (email, gradYear) => {
    setUserEmail(email);
    setGraduationYear(gradYear);
    localStorage.setItem("userEmail", email);
    localStorage.setItem("graduationYear", gradYear);
  };

  // Function to handle logout
  const logout = () => {
    setUserEmail(null);
    setGraduationYear(null);
    localStorage.removeItem("userEmail");
    localStorage.removeItem("graduationYear");
  };

  const updateGraduationYear = async (graduationYear) => {
    try {
        const token = localStorage.getItem("token");
        if (!token) return "User is not logged in";

        const response = await axios.put(
            "http://localhost:5000/update-grad-year",
            { graduationYear },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        setUser((prevUser) => ({ ...prevUser, graduationYear }));
        localStorage.setItem("user", JSON.stringify({ ...user, graduationYear }));
        return response.data.message;
    } catch (error) {
        return error.response?.data?.message || "Error updating graduation year";
    }
  };


  return (
    <AuthContext.Provider value={{ userEmail, graduationYear, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
