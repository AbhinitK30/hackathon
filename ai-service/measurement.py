"""
Measurement Module: Converts pixel dimensions to real-world measurements
using reference object scaling.
"""

import numpy as np


def calculate_pixels_per_mm(reference_bbox, known_dimension_mm):
    """
    Calculate pixels per millimeter using reference object.
    
    Args:
        reference_bbox: Dictionary with 'x1', 'y1', 'x2', 'y2' coordinates
        known_dimension_mm: Known dimension of reference object in mm (e.g., A4 width = 210mm)
    
    Returns:
        pixels_per_mm: Conversion factor
    """
    if not reference_bbox or not known_dimension_mm:
        raise ValueError("Reference bbox and known dimension required")
    
    # Calculate reference dimension in pixels
    ref_width = abs(reference_bbox['x2'] - reference_bbox['x1'])
    ref_height = abs(reference_bbox['y2'] - reference_bbox['y1'])
    
    # Use the larger dimension for more accurate scaling
    ref_pixels = max(ref_width, ref_height)
    
    if ref_pixels == 0:
        raise ValueError("Reference bbox has zero dimension")
    
    pixels_per_mm = ref_pixels / known_dimension_mm
    return pixels_per_mm


def convert_pixels_to_mm(object_bbox, pixels_per_mm):
    """
    Convert bounding box dimensions from pixels to millimeters.
    
    Args:
        object_bbox: Dictionary with 'x1', 'y1', 'x2', 'y2' coordinates
        pixels_per_mm: Conversion factor from calculate_pixels_per_mm
    
    Returns:
        Dictionary with 'width_mm' and 'height_mm'
    """
    if not object_bbox or not pixels_per_mm:
        raise ValueError("Object bbox and pixels_per_mm required")
    
    width_pixels = abs(object_bbox['x2'] - object_bbox['x1'])
    height_pixels = abs(object_bbox['y2'] - object_bbox['y1'])
    
    width_mm = width_pixels / pixels_per_mm
    height_mm = height_pixels / pixels_per_mm
    
    return {
        'width_mm': round(width_mm, 2),
        'height_mm': round(height_mm, 2)
    }


def calculate_ramp_slope(ramp_bbox, pixels_per_mm):
    """
    Calculate ramp slope ratio (rise/run).
    
    Args:
        ramp_bbox: Dictionary with ramp bounding box
        pixels_per_mm: Conversion factor
    
    Returns:
        slope_ratio: Rise over run ratio
    """
    height_mm = abs(ramp_bbox['y2'] - ramp_bbox['y1']) / pixels_per_mm
    width_mm = abs(ramp_bbox['x2'] - ramp_bbox['x1']) / pixels_per_mm
    
    if width_mm == 0:
        return None
    
    slope_ratio = height_mm / width_mm
    return round(slope_ratio, 4)


def calculate_stair_dimensions(stair_bbox, pixels_per_mm):
    """
    Calculate stair riser and tread dimensions.
    
    Args:
        stair_bbox: Dictionary with stair bounding box
        pixels_per_mm: Conversion factor
    
    Returns:
        Dictionary with 'riser_mm' and 'tread_mm'
    """
    height_mm = abs(stair_bbox['y2'] - stair_bbox['y1']) / pixels_per_mm
    width_mm = abs(stair_bbox['x2'] - stair_bbox['x1']) / pixels_per_mm
    
    # Approximate: riser is height, tread is width
    # In real implementation, would need more sophisticated detection
    return {
        'riser_mm': round(height_mm, 2),
        'tread_mm': round(width_mm, 2)
    }
