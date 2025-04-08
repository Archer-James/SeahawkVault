"use client"; 

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation"; 
import "./signup.css"; 
import Link from "next/link"; 


const Signup = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    graduationYear: "", 
  });

  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const router = useRouter(); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // Clear error when typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // email validation
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError("Please enter a valid email.");
      return;
    }

    // Check if the email ends with '@uncw.edu'
    if (!formData.email.endsWith('@uncw.edu')) {
      setError("Not an UNCW email.");
      return;
    }

    // Validate graduation year 
    const currentYear = new Date().getFullYear();
    if (formData.graduationYear < currentYear) {
      setError("Graduation year cannot be before the current year.");
      return;
    }

    const signupData = {
      email: formData.email,
      password: formData.password,
      graduationYear: formData.graduationYear, // Send graduationYear
    };

    try {
      await axios.post("http://localhost:5000/api/auth/signup", signupData); // Change this line to use the correct backend URL      
      alert("Signup successful!");
      setSubmitted(true);

      // Redirect to the login page after successful signup
      router.push("/login"); 
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed.");
    }
  };

  return (
    <div className="signup-container">
      <div className = 'signup-box'>
      <h2>Sign Up</h2>
      {submitted ? (
        <p className="success-message">Thank you for signing up! You can now log in.</p>
      ) : (
        <form onSubmit={handleSubmit} className="signup-form">
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
            className={`input-field ${error ? "input-error" : ""}`}
          />
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
            className="input-field"
          />
          <input
            type="number"
            name="graduationYear"
            placeholder="Enter your graduation year"
            value={formData.graduationYear}
            onChange={handleChange}
            required
            className="input-field"
          />
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="signup-button">Sign Up</button>

          
        </form>
        
        
      )}
      <Link href="/login" className="login-link">
          Already have an account? Login
          </Link>
          </div>
    </div>
  );
};

export default Signup;
