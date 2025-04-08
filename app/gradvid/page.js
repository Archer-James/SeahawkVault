"use client";
import React, { useState, useEffect, Image } from "react";
import "../vault/vault.css";
import "./gradvid.css";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Play, Pause } from 'lucide-react';

export default function SlideshowPage() {
  const [fileList, setFileList] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSlideshowActive, setIsSlideshowActive] = useState(false);
  const [graduationYear, setGraduationYear] = useState(""); 
  const [inputYear, setInputYear] = useState(""); 
  const router = useRouter();

  useEffect(() => {
    if (graduationYear && graduationYear <= new Date().getFullYear()) {
      fetchFiles();
    }
  }, [graduationYear]);

  const fetchFiles = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/files/years/${graduationYear}`);
      const updatedFiles = response.data.files.map((file) => ({
        url: file.url.startsWith("http") ? file.url : `http://localhost:5000${file.url}`,
      }));
      setFileList(updatedFiles);
    } catch (error) {
      console.error("Error fetching files:", error);
      alert("Failed to fetch files.");
    }
  };

  const handleYearChange = (e) => {
    setInputYear(e.target.value);
  };

  const startSlideshow = () => {
    if (!inputYear || inputYear < 1900 || inputYear > 2099) {
      alert("Please enter a valid graduation year.");
      return;
    }
    setGraduationYear(inputYear); // Set the graduation year based on input
    setIsSlideshowActive(true); // Start the slideshow
    setCurrentImageIndex(0); // Reset to the first image
  };

  useEffect(() => {
    let interval;
    if (isSlideshowActive && fileList.length > 0) {
      interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % fileList.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isSlideshowActive, fileList]);

  const toggleSlideshow = () => {
    setIsSlideshowActive((prevState) => !prevState);
  };

  // slideshow start when Enter key is pressed
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      startSlideshow();
    }
  };

  return (
    <div className="unique-slideshow-container">
      {/* Input Box for Graduation Year and Play/Pause Button */}
      <div className="unique-top-bar">
        <text className="enter">Enter Year</text>

        <div className="input-button-container">
          <input
            type="number"
            value={inputYear}
            onChange={handleYearChange}
            onKeyDown={handleKeyDown} // Add keydown event listener
            min="1900"
            max="2099"
            className="unique-grad-year-input"
          />
          <button
            className="unique-play-button"
            onClick={isSlideshowActive ? toggleSlideshow : startSlideshow}
          >
            {isSlideshowActive ? (
              <>
                <Pause size={24} /> Pause
              </>
            ) : (
              <>
                <Play size={24} /> Start Slideshow
              </>
            )}
          </button>
        </div>
      </div>


      {/* Conditionally render locked message or slideshow */}
      {graduationYear && graduationYear > new Date().getFullYear() ? (
        <div className="slide-lock">
          <h3 className="l-slide-word">
            Oh no! It&apos;s not graduation time yet! This vault is locked. Come back when it is {graduationYear}!
          </h3>
          <img src="./clock.jpg" alt="Locked Vault" className="l-image" />
        </div>
      ) : (
        <>
          {/* Slideshow with Centered Rectangle Frame */}
          {isSlideshowActive && fileList.length > 0 && (
            
            <div className="unique-slideshow-frame">
              <img src={fileList[currentImageIndex].url} alt="Slideshow" className="unique-slideshow-image" />
            </div>
          )}
        </>
      )}
    </div>
  );
}
