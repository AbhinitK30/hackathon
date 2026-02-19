# API Examples

## Authentication

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

## Audit

### Create Audit
```bash
curl -X POST http://localhost:5000/api/audit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/image.jpg" \
  -F "title=Building Entrance Audit" \
  -F "referenceDimensionMm=210" \
  -F "referenceBbox={\"x1\":100,\"y1\":100,\"x2\":200,\"y2\":200}"
```

Response:
```json
{
  "reportId": "507f1f77bcf86cd799439012",
  "detections": [
    {
      "bbox": {"x1": 100, "y1": 150, "x2": 300, "y2": 400},
      "confidence": 0.85,
      "class": "door",
      "class_id": 0
    }
  ],
  "measurements": {
    "door_width": 950,
    "door_height": 2150
  },
  "compliance": {
    "door_width": {
      "compliant": true,
      "status": "compliant",
      "measured": 950,
      "min": 900,
      "max": null
    }
  },
  "overallCompliance": {
    "percentage": 85.5,
    "total": 10,
    "compliant": 8,
    "verdict": "Partially Compliant"
  }
}
```

## Reports

### Get All Reports
```bash
curl -X GET http://localhost:5000/api/reports \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Specific Report
```bash
curl -X GET http://localhost:5000/api/reports/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Delete Report
```bash
curl -X DELETE http://localhost:5000/api/reports/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## AI Service

### Detect (Direct)
```bash
curl -X POST http://localhost:8000/api/detect \
  -F "file=@/path/to/image.jpg" \
  -F "reference_dimension_mm=210" \
  -F "reference_bbox={\"x1\":100,\"y1\":100,\"x2\":200,\"y2\":200}"
```

### Health Check
```bash
curl http://localhost:8000/api/health
```

## Frontend Usage

### JavaScript Example
```javascript
// Login
const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com', password: 'password123' })
});
const { token } = await loginResponse.json();

// Create Audit
const formData = new FormData();
formData.append('image', imageFile);
formData.append('title', 'My Audit');
formData.append('referenceDimensionMm', '210');

const auditResponse = await fetch('http://localhost:5000/api/audit', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
const auditData = await auditResponse.json();
```

## Compliance Rules

Rules are defined in `ai-service/rules.json`:

```json
{
  "door_width": { "min": 900 },
  "door_height": { "min": 2100 },
  "ramp_slope_ratio": { "max": 0.083 },
  "stair_riser": { "max": 150 },
  "stair_tread": { "min": 300 },
  "handrail_height": { "min": 760, "max": 900 },
  "corridor_width": { "min": 1200 },
  "toilet_door": { "min": 900 },
  "signage_height": { "min": 1400, "max": 1700 },
  "lift_button_height": { "min": 900, "max": 1200 }
}
```

All measurements are in millimeters (mm).
