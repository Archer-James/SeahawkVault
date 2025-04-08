"use client";
import "./grad.css";
import React, { useState, useEffect, Image } from "react";
import axios from "axios";

export default function GradYearPage() {
  const [fileList, setFileList] = useState([]);
  const [graduationYear, setGraduationYear] = useState(""); // Store the year entered by user
  const [inputYear, setInputYear] = useState(""); // Temporary input value for the year
  const [selectedImage, setSelectedImage] = useState(null); // State to track the selected image for model

  useEffect(() => {
    // Fetch files for the graduation year when the component mounts or the graduation year changes
    if (graduationYear && graduationYear <= new Date().getFullYear()) {
      fetchFiles();
    }
  }, [graduationYear]);

  useEffect(() => {
    setGraduationYear(new Date().getFullYear()); // Set the default year to the current year
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/files/years/${graduationYear}`);
      const updatedFiles = response.data.files.map((file) => {
        if (!file.url.startsWith("http")) {
          file.url = `http://localhost:5000${file.url}`;
        }
        return file;
      });
      setFileList(updatedFiles);
    } catch (error) {
      console.error("Error fetching files:", error);
      alert("Failed to fetch files.");
    }
  };

  const handleYearSubmit = (e) => {
    e.preventDefault();

    if (!inputYear) {
      alert("Please enter a valid graduation year.");
      return;
    }

    setGraduationYear(inputYear); // Update state with the input year
  };

  // Open image model
  const openImagemodel = (url) => {
    setSelectedImage(url); // Set the clicked image URL to state
  };

  // Close image model
  const closemodel = () => {
    setSelectedImage(null); // Close the model by clearing the selected image
  };

  return (
    <div className="g-container">
      {/* Left Panel - Input Box for Graduation Year */}
      <div className="l-panel">
        <h3 className = 'enter-grad'>Enter Graduation Year</h3>
        <form onSubmit={handleYearSubmit}>
          <input
            type="number"
            value={inputYear}
            onChange={(e) => setInputYear(e.target.value)}
            min="1900"
            max="2099"
            className="grad-year-input"
          />
          <button type="submit" className="grad-btn">Submit</button>
        </form>
      </div>

      {/* Right Panel - Image Vault (Image Grid) */}
      <div className="v-container">
      {graduationYear && <h3 className="class-title">Class of {graduationYear}</h3>}
        <div className={graduationYear > new Date().getFullYear() ? "v-container flex" : "vault-container grid"}>
          {graduationYear > new Date().getFullYear() ? (
            <div className="l-message">
              <h3 className = 'l-message-word'>Oh no! It&apos;s not graduation time yet! This vault is locked. Come back when it is {graduationYear}!</h3>
              <img src="./clock.jpg" alt="Locked Vault" className="l-image" />
            </div>
          ) : fileList.length > 0 ? (
            fileList.map((file) => (
              <div className="i-item" key={file.name} onClick={() => openImagemodel(file.url)}>
                <img className="v-image" src={file.url} alt={file.name} />
              </div>
            ))
          ) : (
            <p className="no-files-message">No files uploaded for this graduation year yet.</p>
          )}
        </div>

      </div>

      {/* model for Full-Size Image */}
      {selectedImage && (
        <div className="image-model">
          <div className="model-content">
            <button className="close-model" onClick={closemodel}>X</button>
            <img src={selectedImage} alt="Full-size" className="model-image" />
          </div>
        </div>
      )}
    </div>
  );
}
