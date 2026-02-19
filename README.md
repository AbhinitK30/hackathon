# Harmonized Accessibility Architectural Audit System

Complete production-ready system for auditing architectural spaces for compliance with accessibility guidelines.

## Project Structure

```
.
├── client/          # React frontend
├── server/          # Node.js backend
├── ai-service/      # Python FastAPI AI service
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 18+
- Python 3.9+
- MongoDB 6+
- npm/yarn

### 1. Backend Setup

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm start
```

### 2. AI Service Setup

```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env if using custom model
python main.py
```

### 3. Frontend Setup

```bash
cd client
npm install
npm run dev
```

## Environment Variables

### Server (.env)
- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `AI_SERVICE_URL`: URL of AI service (default: http://localhost:8000)

### AI Service (.env)
- `MODEL_PATH`: Path to custom YOLOv8 model (optional)
- `PORT`: AI service port (default: 8000)

## Running Locally

1. Start MongoDB
2. Start AI service: `cd ai-service && python main.py`
3. Start backend: `cd server && npm start`
4. Start frontend: `cd client && npm run dev`

Access frontend at http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Audit
- `POST /api/audit` - Create new audit (requires auth)

### Reports
- `GET /api/reports` - Get all reports (requires auth)
- `GET /api/reports/:id` - Get specific report (requires auth)
- `DELETE /api/reports/:id` - Delete report (requires auth)

### AI Service
- `POST /api/detect` - Detect and measure architectural elements
- `GET /api/health` - Health check

## Sample API Request

### Create Audit

```bash
curl -X POST http://localhost:5000/api/audit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@image.jpg" \
  -F "title=Building Entrance Audit" \
  -F "referenceDimensionMm=210" \
  -F "referenceBbox={\"x1\":100,\"y1\":100,\"x2\":200,\"y2\":200}"
```

## Notes

- YOLOv8 model will download automatically on first run
- For production, train custom model with architectural element dataset
- Reference object (A4 sheet) should be placed in frame for accurate measurements
- Default reference dimension is 210mm (A4 width)
