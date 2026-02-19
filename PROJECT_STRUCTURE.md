# Project Structure

```
hackathon/
├── client/                          # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.jsx          # Navigation layout
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Authentication context
│   │   ├── pages/
│   │   │   ├── Login.jsx           # Login page
│   │   │   ├── Signup.jsx          # Signup page
│   │   │   ├── Dashboard.jsx       # Dashboard
│   │   │   ├── NewAudit.jsx        # New audit creation
│   │   │   ├── ReportHistory.jsx   # List of reports
│   │   │   └── ReportViewer.jsx    # Individual report view
│   │   ├── App.jsx                 # Main app component
│   │   ├── main.jsx                # Entry point
│   │   └── index.css               # Global styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── server/                          # Node.js Backend
│   ├── server.js                   # Express server
│   ├── package.json
│   ├── .env.example
│   └── uploads/                    # Uploaded images
│
├── ai-service/                      # Python FastAPI AI Service
│   ├── main.py                     # FastAPI app
│   ├── detection.py                # YOLOv8 detection
│   ├── measurement.py              # Pixel to mm conversion
│   ├── rule_engine.py              # Compliance checking
│   ├── rules.json                  # Accessibility rules
│   ├── requirements.txt
│   ├── .env.example
│   └── __init__.py
│
├── README.md                        # Main documentation
├── SETUP.md                        # Setup instructions
├── PROJECT_STRUCTURE.md            # This file
├── .gitignore
├── start.sh                        # Start script (Unix/Mac)
└── start.bat                       # Start script (Windows)
```

## Key Files

### Frontend (React)
- **Layout.jsx**: Navigation and layout wrapper
- **NewAudit.jsx**: Camera capture, image upload, detection overlay
- **ReportViewer.jsx**: Report display with PDF, audio, print

### Backend (Node.js)
- **server.js**: Express server with auth, audit, and report endpoints

### AI Service (Python)
- **main.py**: FastAPI endpoints for detection
- **detection.py**: YOLOv8 object detection
- **measurement.py**: Real-world measurement conversion
- **rule_engine.py**: Compliance rule evaluation
- **rules.json**: Accessibility guidelines

## Data Flow

1. User captures/uploads image → Frontend
2. Frontend sends image → Backend
3. Backend forwards to AI Service → AI Service
4. AI Service:
   - Detects objects (YOLOv8)
   - Calculates measurements (measurement.py)
   - Checks compliance (rule_engine.py)
5. Results returned → Backend → Frontend
6. Report saved to MongoDB
7. User views report with audio/PDF options
