# Setup Instructions

## Quick Start

### 1. Install Dependencies

**Backend:**
```bash
cd server
npm install
```

**AI Service:**
```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**Frontend:**
```bash
cd client
npm install
```

### 2. Configure Environment Variables

**Backend (.env):**
```bash
cd server
cp .env.example .env
# Edit .env with your settings
```

**AI Service (.env):**
```bash
cd ai-service
cp .env.example .env
# Edit if using custom model
```

**Frontend (.env):**
```bash
cd client
cp .env.example .env
# Edit API URL if needed
```

### 3. Start Services

**Terminal 1 - MongoDB:**
```bash
mongod
```

**Terminal 2 - AI Service:**
```bash
cd ai-service
source venv/bin/activate
python main.py
```

**Terminal 3 - Backend:**
```bash
cd server
npm start
```

**Terminal 4 - Frontend:**
```bash
cd client
npm run dev
```

### 4. Access Application

Open http://localhost:3000 in your browser

## First Run Notes

- YOLOv8 model will download automatically (~6MB)
- Create an account to start auditing
- Place A4 sheet (210mm width) in frame for accurate measurements
- Click on reference object to set scaling

## Troubleshooting

- Ensure MongoDB is running
- Check all services are on correct ports (3000, 5000, 8000)
- Verify Python virtual environment is activated
- Check browser console for errors
