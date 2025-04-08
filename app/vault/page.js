"use client";
import React, { useState, useEffect, Image } from "react";
import "./vault.css";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

export default function VaultPage() {
  const [uploadType, setUploadType] = useState("image");
  const [selectedFile, setSelectedFile] = useState(null);
  const [textInput, setTextInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [isPublic, setIsPublic] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [agreeToMakePublic, setAgreeToMakePublic] = useState(false);
  const { userEmail, graduationYear } = useAuth();
  const router = useRouter();
  const [uploadMessage, setUploadMessage] = useState("");

  useEffect(() => {
    if (!userEmail) {
      router.push("/login");
    } else {
      fetchFiles();
    }
  }, [userEmail, router]);

  const fetchFiles = async () => {
    try {
      const currentYear = new Date().getFullYear();
      if (graduationYear > currentYear) {
        setFileList([{ url: "/frog.ico" }]);
      } else {
        const response = await axios.get(`http://localhost:5000/files/${userEmail}`);
        
        const updatedFiles = response.data.files.map((file) => ({
          url: file.url.startsWith("http") ? file.url : `http://localhost:5000${file.url}`,
          createdAt: file.createdAt, // Ensure timestamps are included
        }));
  
        // Ensure sorting by most recent upload time
        updatedFiles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
        setFileList(updatedFiles);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
      alert("Failed to fetch files.");
    }
  };
  

  useEffect(() => {
    fetchFiles();
  }, [isPublic]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setFilePreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const handleUpload = async () => {
    if (!userEmail) {
      alert("Please log in before uploading.");
      return;
    }

    if (uploadType === "image" && !selectedFile) {
      alert("Please select an image.");
      return;
    }

    if (uploadType === "text" && !textInput.trim()) {
      alert("Please enter some text.");
      return;
    }

    if (isPublic && !agreeToMakePublic) {
      alert("You must agree to make this photo public.");
      return;
    }

    setIsUploading(true);

    try {
      let response;
      if (uploadType === "image") {
        const formData = new FormData();
        formData.append("uploadFile", selectedFile);
        formData.append("email", userEmail);
        formData.append("isPublic", isPublic);
        formData.append("graduationYear", graduationYear);

        response = await axios.post("http://localhost:5000/upload", formData);
      } else {
        response = await axios.post("http://localhost:5000/upload-text", {
          text: textInput,
          email: userEmail,
        });
      }

      if (response.data.success) {
        setUploadMessage("File uploaded successfully!");
        setTimeout(() => setUploadMessage(""), 3000);
        setFileList((prev) => [...prev, { url: response.data.url }]);
        setSelectedFile(null);
        setFilePreviewUrl(null);
        setTextInput("");
        setIsPublic(false);
        setAgreeToMakePublic(false);
        fetchFiles();
      } else {
        throw new Error("Upload failed.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload.");
    } finally {
      setIsUploading(false);
    }
  };

  const toggleUploadType = () => {
    setUploadType(uploadType === "image" ? "text" : "image");
    setSelectedFile(null);
    setFilePreviewUrl(null);
    setTextInput("");
    setIsPublic(false);
    setAgreeToMakePublic(false);
  };

  const openImagemodel = (url) => {
    setSelectedImage(url);
  };

  const closemodel = () => {
    setSelectedImage(null);
  };

  return (
    <div className="grid-container">
      {/* Left Panel */}
      <div className="left-panel">
        <button className="upload-button" onClick={toggleUploadType}>
          {uploadType === "image" ? "Switch to Text" : "Switch to Image"}
        </button>

        {uploadType === "image" ? (
          <>
            {/* Hidden file input */}
            <input 
              type="file" 
              id="fileUpload" 
              className="file-input" 
              onChange={handleFileChange} 
              accept="image/*" 
            />
            
            {/* Clickable preview box */}
            <div className="preview-box" id="previewBox" onClick={() => document.getElementById("fileUpload").click()}>
              {filePreviewUrl ? <img src={filePreviewUrl} alt="Preview" className="preview-image" /> : "Click to Upload"}
            </div>

            {/* Smaller Upload Button */}

            <label>
              <input type="checkbox" checked={isPublic} onChange={() => setIsPublic(!isPublic)} />
              Upload to Graduation Year Folder
            </label>

            {isPublic && (
              <label>
                <input 
                  type="checkbox" 
                  checked={agreeToMakePublic} 
                  onChange={() => setAgreeToMakePublic(!agreeToMakePublic)} 
                />
                This photo will be made public. Click to agree.
              </label>
            )}
          </>
        ) : (
          <textarea
            className="text-input"
            placeholder="Enter text here..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          ></textarea>
        )}

        <button className="upload-button" onClick={handleUpload} disabled={isUploading}>
          {isUploading ? "Uploading..." : "Upload"}
        </button>
        {uploadMessage && <p className="upload-success">{uploadMessage}</p>}
      </div>

      {/* Right Panel - Image Grid or Locked Message */}
      
      <div className={graduationYear > new Date().getFullYear() ? "v-container flex" : "v-container grid"}>
  {graduationYear > new Date().getFullYear() ? (
    <div className="locked-message">
      <h3 className="locked-message-word">
        Oh no! It&apos;s not graduation time yet! This vault is locked. Come back when it is {graduationYear}!
      </h3>
      <img src="./clock.jpg" alt="Locked Vault" className="locked-image" />
    </div>
  ) : fileList.length > 0 ? (
    [...fileList] // Create a shallow copy before sorting
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort by most recent
      .map((file) => (
        <div className="image-item" key={file.name} onClick={() => openImagemodel(file.url)}>
          <img className="vault-image" src={file.url} alt={file.name} />
        </div>
      ))
  ) : (
    <p className="no-files-message">No files uploaded yet.</p>
  )}
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
