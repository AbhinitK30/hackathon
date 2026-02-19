"""
FastAPI Main Application: AI Service for Accessibility Auditing
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import cv2
import numpy as np
from PIL import Image
import io
import os
from detection import ArchitectureDetector
from measurement import (
    calculate_pixels_per_mm,
    convert_pixels_to_mm,
    calculate_ramp_slope,
    calculate_stair_dimensions
)
from rule_engine import evaluate_all_measurements, calculate_overall_compliance

app = FastAPI(title="Accessibility Audit AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

detector = ArchitectureDetector()


class DetectionRequest(BaseModel):
    reference_bbox: Optional[Dict] = None
    reference_dimension_mm: Optional[float] = 210.0  # A4 width default


class DetectionResponse(BaseModel):
    detections: List[Dict]
    measurements: Dict
    compliance: Dict
    overall_compliance: Dict


@app.post("/api/detect", response_model=DetectionResponse)
async def detect_architecture(
    file: UploadFile = File(...),
    reference_bbox: Optional[str] = Form(None),
    reference_dimension_mm: float = Form(210.0)
):
    """
    Detect architectural elements and calculate compliance.
    
    Args:
        file: Image file
        reference_bbox: JSON string of reference object bbox
        reference_dimension_mm: Known dimension of reference in mm
    """
    try:
        # Read image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image file")
        
        # Save temporary image for detection
        temp_path = "/tmp/temp_image.jpg"
        cv2.imwrite(temp_path, img)
        
        # Detect objects
        detections = detector.detect(temp_path)
        
        # Parse reference bbox if provided
        ref_bbox = None
        if reference_bbox:
            import json
            ref_bbox = json.loads(reference_bbox)
        
        # Calculate measurements
        measurements = {}
        pixels_per_mm = None
        
        if ref_bbox:
            pixels_per_mm = calculate_pixels_per_mm(ref_bbox, reference_dimension_mm)
        
        for det in detections:
            class_name = det['class']
            bbox = det['bbox']
            
            if pixels_per_mm:
                if class_name == 'door':
                    dims = convert_pixels_to_mm(bbox, pixels_per_mm)
                    measurements['door_width'] = dims['width_mm']
                    measurements['door_height'] = dims['height_mm']
                
                elif class_name == 'ramp':
                    dims = convert_pixels_to_mm(bbox, pixels_per_mm)
                    measurements['ramp_width'] = dims['width_mm']
                    slope = calculate_ramp_slope(bbox, pixels_per_mm)
                    if slope:
                        measurements['ramp_slope_ratio'] = slope
                
                elif class_name == 'stair':
                    dims = calculate_stair_dimensions(bbox, pixels_per_mm)
                    measurements['stair_riser'] = dims['riser_mm']
                    measurements['stair_tread'] = dims['tread_mm']
                
                elif class_name == 'handrail':
                    dims = convert_pixels_to_mm(bbox, pixels_per_mm)
                    measurements['handrail_height'] = dims['height_mm']
                
                elif class_name == 'corridor':
                    dims = convert_pixels_to_mm(bbox, pixels_per_mm)
                    measurements['corridor_width'] = dims['width_mm']
                
                elif class_name == 'toilet':
                    dims = convert_pixels_to_mm(bbox, pixels_per_mm)
                    measurements['toilet_door'] = dims['width_mm']
                
                elif class_name == 'signage':
                    dims = convert_pixels_to_mm(bbox, pixels_per_mm)
                    measurements['signage_height'] = dims['height_mm']
                
                elif class_name == 'lift_panel':
                    dims = convert_pixels_to_mm(bbox, pixels_per_mm)
                    measurements['lift_button_height'] = dims['height_mm']
        
        # Evaluate compliance
        compliance = evaluate_all_measurements(measurements)
        overall_compliance = calculate_overall_compliance(compliance)
        
        # Cleanup
        if os.path.exists(temp_path):
            os.remove(temp_path)
        
        return DetectionResponse(
            detections=detections,
            measurements=measurements,
            compliance=compliance,
            overall_compliance=overall_compliance
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "ai-service"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
