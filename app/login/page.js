"use client"; 

import { useState } from "react";
import { useAuth } from "../context/AuthContext"; 
import { useRouter } from "next/navigation"; 
import axios from "axios";
import Link from "next/link"; 
import "./login.css"; 

export default function LoginPage() {
  // Form data state to track user input
  const [formData, setFormData] = useState({ email: "", password: "" });

  // Error state to display error messages
  const [error, setError] = useState("");

  const router = useRouter(); 
  const { login } = useAuth(); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // Clear error when user starts typing again
  };

  const isValidEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailPattern.test(email);
  };

  // Handle form submission for login
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Check for valid email format before sending the request
    if (!isValidEmail(formData.email)) {
      setError("Enter a valid email.");
      return;
    }
  
    try {
      // Send login request to backend
      const response = await axios.post("http://localhost:5000/api/auth/login", formData);
  
      const { email, graduationYear } = response.data;
  
      if (email && graduationYear) {
        login(email, graduationYear); // Pass both email and graduationYear to the login function
        router.push("/"); // Redirect to home page or the intended page
      } else {
        setError("Email not registered.");
      }
    } catch (err) {
      // Display error from backend or fallback error message
      setError(err.response?.data?.error || "Login failed.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className={`input-field ${error ? "input-error" : ""}`} // Highlight input on error
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="input-field"
            required
          />

          {/* Display error message if an error exists */}
          {error && <p className="error-message">{error}</p>}

          {/* Submit Button */}
          <button type="submit" className="login-button">Login</button>
        </form>

        {/* Sign-up Link for new users */}
        <Link href="/signup" className="signup-link">
          Don&apos;t have an account? Sign up
        </Link>
      </div>
    </div>
  );
}
