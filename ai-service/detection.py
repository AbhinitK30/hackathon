"""
Detection Module: YOLOv8 object detection for architectural elements.
"""

from ultralytics import YOLO
import cv2
import numpy as np
import os


class ArchitectureDetector:
    def __init__(self, model_path=None):
        """
        Initialize YOLOv8 detector.
        
        Args:
            model_path: Path to custom YOLOv8 model weights (.pt file)
                       If None, uses pretrained model
        """
        import os
        env_model_path = os.getenv('MODEL_PATH')
        final_model_path = model_path or env_model_path
        
        if final_model_path and os.path.exists(final_model_path):
            self.model = YOLO(final_model_path)
        else:
            # Use pretrained YOLOv8 model
            # In production, replace with custom trained model
            # Note: This will download yolov8n.pt on first run
            self.model = YOLO('yolov8n.pt')
        
        # Map class IDs to architectural element names
        # NOTE: For production, train custom YOLOv8 model with these classes
        # Current pretrained model may not detect architectural elements accurately
        self.class_mapping = {
            'door': 0,
            'ramp': 1,
            'stair': 2,
            'handrail': 3,
            'corridor': 4,
            'lift_panel': 5,
            'signage': 6,
            'toilet': 7,
            'reference_marker': 8  # A4 sheet or printed marker
        }
    
    def detect(self, image_path):
        """
        Detect architectural elements in image.
        
        Args:
            image_path: Path to image file
        
        Returns:
            List of detections with bbox, confidence, class
        """
        results = self.model(image_path)
        detections = []
        
        for result in results:
            boxes = result.boxes
            for box in boxes:
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                confidence = float(box.conf[0].cpu().numpy())
                class_id = int(box.cls[0].cpu().numpy())
                
                # Map class ID to name
                class_name = self._get_class_name(class_id)
                
                detections.append({
                    'bbox': {
                        'x1': float(x1),
                        'y1': float(y1),
                        'x2': float(x2),
                        'y2': float(y2)
                    },
                    'confidence': round(confidence, 3),
                    'class': class_name,
                    'class_id': class_id
                })
        
        return detections
    
    def _get_class_name(self, class_id):
        """Map class ID to architectural element name"""
        # For pretrained YOLOv8, map COCO classes to architectural elements
        # This is a placeholder - in production, use custom trained model
        coco_to_arch = {
            0: 'door',      # person -> door (placeholder)
            1: 'ramp',      # bicycle -> ramp (placeholder)
            2: 'stair',     # car -> stair (placeholder)
        }
        
        # Try custom mapping first
        reverse_mapping = {v: k for k, v in self.class_mapping.items()}
        if class_id in reverse_mapping.values():
            return reverse_mapping.get(class_id)
        
        # Fallback to COCO mapping or generic
        return coco_to_arch.get(class_id, f'element_{class_id}')
