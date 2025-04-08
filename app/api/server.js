const express = require('express');
const multer = require('multer');
const axios = require('axios');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const cors = require('cors');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { createCanvas } = require("canvas");
require('dotenv').config();

const app = express();
const port = 5000;

const MONGO_URI = process.env.MONGO_URI; 
app.use(cors({
  origin: 'http://localhost:3000', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware
app.use(express.json());

// MongoDB connection
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB successfully!');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// User Schema
const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    graduationYear: {
        type: Number,
        required: true,
        validate: {
            validator: function (v) {
                return v >= new Date().getFullYear(); // Ensure graduation year is not before the current year
            },
            message: 'Graduation year must be the current year or later',
        },
    },
});

const User = mongoose.model('User', userSchema);

// Signup Route
app.post('/api/auth/signup', async (req, res) => {
    const { email, password, graduationYear } = req.body;
    if (!email || !password || !graduationYear) {
        return res.status(400).json({ message: "Email, password, and graduation year are required" });
    }

    // Check if the graduation year is valid (not before the current year)
    if (graduationYear < new Date().getFullYear()) {
        return res.status(400).json({ message: "Graduation year must be the current year or later" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, graduationYear });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
});

// Login Route
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({ email: user.email, graduationYear: user.graduationYear });
});

// Serve files from the "uploads" directory
app.use('/files', express.static(path.join(__dirname, 'uploads')));

// Cloudinary Configuration
cloudinary.config({
  cloud_name: 'dfvniunzg',
  api_key: '431117128247136',
  api_secret: 'tC_Pxjgq5Njz1RGjFDFI15JJrAY',
  secure: true,
});

// File Upload Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Endpoint to get user files
app.get('/files/:email', async (req, res) => {
  const userEmail = req.params.email;
  const folderPath = `users/${userEmail}`;

  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: folderPath,
      max_results: 30,
      sort_by: [{ created_at: "desc" }], // Sort by most recent uploads
    });

    const fileUrls = result.resources.map(resource => ({
      url: resource.secure_url,
      name: resource.public_id,
      createdAt: resource.created_at, // Include timestamp
    }));

    res.status(200).json({ success: true, files: fileUrls });
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch files' });
  }
});



// get files for a specific graduation year
app.get('/files/years/:year', async (req, res) => {
  const graduationYear = req.params.year;
  const graduationYearFolderPath = `years/${graduationYear}`;

  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: graduationYearFolderPath,
      max_results: 30, 
    });

    const fileUrls = result.resources.map((resource) => ({
      url: resource.secure_url,
      name: resource.public_id,
    }));

    res.status(200).json({ success: true, files: fileUrls });
  } catch (error) {
    console.error('Error fetching files for graduation year:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch files' });
  }
});


// File Upload Endpoint
app.post('/upload', upload.single('uploadFile'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const { email, graduationYear, isPublic } = req.body;
  const filePath = req.file.path;

  // Validate email and graduationYear
  if (!email) {
    return res.status(400).json({ message: 'Email required' });
  }

  if (!graduationYear && isPublic === "true") {
    return res.status(400).json({ message: "Graduation year required for public uploads" });
  }

  const userFolderPath = `users/${email}`;
  const publicFolderPath = `years/${graduationYear}`;

  try {
    let userUploadResult = null;
    let publicUploadResult = null;

    if (isPublic === "true") {
      // Upload to graduation year folder first
      publicUploadResult = await cloudinary.uploader.upload(filePath, {
        resource_type: 'auto',
        folder: publicFolderPath,
      });
    }

    // Upload to the user folder
    userUploadResult = await cloudinary.uploader.upload(filePath, {
      resource_type: 'auto',
      folder: userFolderPath,
    });

    res.status(200).json({
      success: true,
      userFileUrl: userUploadResult.secure_url,
      publicFileUrl: publicUploadResult ? publicUploadResult.secure_url : null,
      message: `File uploaded successfully to ${userFolderPath}${isPublic === "true" ? ` and ${publicFolderPath}` : ''}`,
    });
  } catch (error) {
    console.error('File upload failed:', error);
    res.status(500).json({ success: false, message: 'File upload failed', error: error.message });
  }
});

// Route for uploading text
const wrapText = (ctx, text, maxWidth) => {
  const words = text.split(" ");
  let lines = [];
  let line = "";

  for (let i = 0; i < words.length; i++) {
    let testLine = line + words[i] + " ";
    let metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && i > 0) {
      lines.push(line);
      line = words[i] + " ";
    } else {
      line = testLine;
    }
  }
  lines.push(line);
  return lines;
};

app.post("/upload-text", async (req, res) => {
  try {
    const { text, email } = req.body;

    if (!text || !email) {
      return res.status(400).json({ success: false, message: "Missing text or email." });
    }

    const fontSize = 24;
    const maxWidth = 400; 

    let tempCanvas = createCanvas(maxWidth, 100);
    let tempCtx = tempCanvas.getContext("2d");
    tempCtx.font = `${fontSize}px Arial`;

    let lines = wrapText(tempCtx, text, maxWidth);

    let textWidth = Math.min(maxWidth, tempCtx.measureText(text).width);

    let textHeight = lines.length * (fontSize + 10); 
    const padding = 20;
    textHeight += padding * 2; 
    let canvas = createCanvas(textWidth + padding * 2, textHeight);
    let ctx = canvas.getContext("2d");

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "black";
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    lines.forEach((line, index) => {
      ctx.fillText(line, canvas.width / 2, padding + index * (fontSize + 10));
    });

    const buffer = canvas.toBuffer("image/png");

    // Upload to Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "image", folder: `users/${email}` },
      (error, result) => {
        if (error) {
          return res.status(500).json({ success: false, message: "Cloudinary upload failed." });
        }
        res.json({ success: true, url: result.secure_url + "?bg=ffffff" });
      }
    );

    uploadStream.end(buffer);

  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

app.put('/update-grad-year', async (req, res) => {
  const { email, graduationYear } = req.body;

  if (!email || !graduationYear) {
      return res.status(400).json({ message: "Email and graduation year are required" });
  }

  try {
      // Find the user by email
      const user = await User.findOne({ email });

      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }

      // Update the graduation year
      user.graduationYear = graduationYear;

      // Save the updated user
      await user.save();

      res.status(200).json({ message: "Graduation year updated successfully" });
  } catch (error) {
      console.error("Error updating graduation year:", error);
      res.status(500).json({ message: "Failed to update graduation year" });
  }
});

// Start the Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
