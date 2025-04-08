"use client";
import "./gradedit.css"
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext"; 
import { useRouter } from "next/navigation";

const EditGradYear = () => {
    const router = useRouter();
    const { login } = useAuth();
    const { userEmail, graduationYear } = useAuth();
    const [newGradYear, setNewGradYear] = useState(graduationYear || ""); 
    const [error, setError] = useState(""); 

    
    // Get the current year
    const currentYear = new Date().getFullYear();
    const [message, setMessage] = useState("");

   

    // Redirect to login page if logged out
    useEffect(() => {
        if (!userEmail) {
            router.push("/login");
        }
    }, [userEmail, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check if the new graduation year is valid
        if (parseInt(newGradYear) < currentYear) {
            setError(`Graduation year must be ${currentYear} or later.`);
            return;}
        else{
            setMessage("Graduation year updated successfully!");

        }
        

        setError("");

        // Make the API request to update the graduation year
        try {
            const response = await fetch("http://localhost:5000/update-grad-year", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: userEmail,  
                    graduationYear: newGradYear,  
                }),
            });

            if (response.ok) {
                const data = await response.json();
                login(userEmail, newGradYear);
                router.refresh();
                setTimeout(() => {
                    router.push("/vault");
                },1000);
                
            } else {
                alert("Failed to update graduation year.");
            }
        } catch (error) {
            console.error("Error updating graduation year:", error);
            alert("An error occurred.");
        }
    };

    return (
        <div>
            <h1>Edit Graduation Year</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Current Graduation Year: {graduationYear}
                </label>
                <br />
                <label>
                    New Graduation Year:
                    <input
                        type="text"
                        value={newGradYear}
                        onChange={(e) => setNewGradYear(e.target.value)}
                    />
                </label>
                {error && <div className="error-message">{error}</div>}
                <br />
                <button className = "year-button" type="submit">Update Graduation Year</button>
                {message && <p style={{ color: "green", marginTop: "10px" }}>{message}</p>}
            </form>
        </div>
    );
};

export default EditGradYear;
