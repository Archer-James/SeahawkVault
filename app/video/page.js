"use client";
import React, { useState, useEffect, Image } from "react";
import "../vault/vault.css";
import "./video.css";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { Play, Pause } from 'lucide-react';

export default function SlideshowPage() {
  const [fileList, setFileList] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSlideshowActive, setIsSlideshowActive] = useState(false);
  const { userEmail, graduationYear } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!userEmail) {
      router.push("/login");
    } else {
      fetchFiles();
    }
  }, [userEmail, router]);
  useEffect(() => {
    console.log("Current Graduation Year:", graduationYear);
    // Check if the graduationYear is a valid number and greater than the current year
    if (graduationYear && graduationYear <= new Date().getFullYear()) {
      fetchFiles();
    }
  }, [graduationYear]);

  const fetchFiles = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/files/${userEmail}`);
      const updatedFiles = response.data.files.map((file) => ({
        url: file.url.startsWith("http") ? file.url : `http://localhost:5000${file.url}`,
      }));
      setFileList(updatedFiles);
    } catch (error) {
      console.error("Error fetching files:", error);
      alert("Failed to fetch files.");
    }
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

  const startSlideshow = () => {
    if (fileList.length === 0) {
      alert("No images available for the slideshow.");
      return;
    }
    setIsSlideshowActive(true);
    setCurrentImageIndex(0);
  };

  const toggleSlideshow = () => {
    setIsSlideshowActive((prevState) => !prevState); // Toggle between active and paused
  };

  return (
    <div className="slideshow-container">
      {/* If graduation year is greater than current year, show the locked message and don't allow slideshow */}
      {graduationYear > new Date().getFullYear() ? (
                <div className="l-message">
          <h3 className="l-message-word">
            Oh no! It&apos;s not graduation time yet! This slideshow is locked. Come back when it is {graduationYear}!
          </h3>
          <img src="./clock.jpg" alt="Locked Vault" className="l-image" />
        </div>
      ) : (
        <>
          {/* Play Button in Top-Left */}
          {!isSlideshowActive && (
            <button className="play-button" onClick={startSlideshow}>
              <Play size={24} /> Play Slideshow {/* Play Icon with Text */}
            </button>
          )}

          {/* Slideshow with Centered Rectangle Frame */}
          {isSlideshowActive && fileList.length > 0 && (
            <div className="slideshow-frame">
              <button className="stop-button" onClick={toggleSlideshow}>
                <Pause size={24} /> Pause {/* Pause Icon with Text */}
              </button>
              <img src={fileList[currentImageIndex].url} alt="Slideshow" className="slideshow-image" />
            </div>
          )}
        </>
      )}
    </div>
  );
}
