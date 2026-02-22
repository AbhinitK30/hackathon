import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));

// MongoDB connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/accessibility-audit';
mongoose.connect(mongoUri).catch((err) => {
  console.error('MongoDB connection error:', err.message);
});

// Schemas
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const ReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  imageUrl: { type: String },
  detections: { type: Object },
  measurements: { type: Object },
  compliance: { type: Object },
  overallCompliance: { type: Object },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', UserSchema);
const Report = mongoose.model('Report', ReportSchema);

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads', { recursive: true });
}

// Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Auth
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body || {};
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }
    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, name });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your-secret-key', {
      expiresIn: '7d',
    });

    res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your-secret-key', {
      expiresIn: '7d',
    });

    res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Audit
app.post('/api/audit', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file required' });
    }

    const imagePath = req.file.path;
    const referenceBbox = req.body.referenceBbox;
    const referenceDimensionMm = parseFloat(req.body.referenceDimensionMm) || 210.0;

    // Call AI service
    const formData = new FormData();
    const fileStream = fs.createReadStream(imagePath);
    formData.append('file', fileStream);
    if (referenceBbox) {
      formData.append('reference_bbox', referenceBbox);
    }
    formData.append('reference_dimension_mm', referenceDimensionMm.toString());

    const aiResponse = await axios.post(`${AI_SERVICE_URL}/api/detect`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    const { detections, measurements, compliance, overall_compliance } = aiResponse.data;

    // Save report
    const report = new Report({
      userId: req.user.userId,
      title: req.body.title || `Audit ${new Date().toLocaleString()}`,
      imageUrl: `/uploads/${req.file.filename}`,
      detections,
      measurements,
      compliance,
      overallCompliance: overall_compliance,
    });

    await report.save();

    res.json({
      reportId: report._id,
      detections,
      measurements,
      compliance,
      overallCompliance: overall_compliance,
    });
  } catch (error) {
    console.error('Audit error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reports
app.get('/api/reports', authenticateToken, async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .select('-__v');
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/reports/:id', authenticateToken, async (req, res) => {
  try {
    const report = await Report.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/reports/:id', authenticateToken, async (req, res) => {
  try {
    const report = await Report.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({ message: 'Report deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
