"""
Rule Engine: Compares measured values against accessibility guidelines.
"""

import json
import os


def load_rules():
    """Load compliance rules from rules.json"""
    rules_path = os.path.join(os.path.dirname(__file__), 'rules.json')
    with open(rules_path, 'r') as f:
        return json.load(f)


def check_compliance(parameter, measured_value, rules=None):
    """
    Check if measured value complies with rules.
    
    Args:
        parameter: Parameter name (e.g., 'door_width')
        measured_value: Measured value in mm
        rules: Optional rules dict, otherwise loads from file
    
    Returns:
        Dictionary with 'compliant', 'status', 'required'
    """
    if rules is None:
        rules = load_rules()
    
    if parameter not in rules:
        return {
            'compliant': None,
            'status': 'needs-review',
            'required': None,
            'measured': measured_value
        }
    
    rule = rules[parameter]
    required = rule.get('min') or rule.get('max')
    
    compliant = True
    status = 'compliant'
    
    if 'min' in rule:
        if measured_value < rule['min']:
            compliant = False
            status = 'non-compliant'
    
    if 'max' in rule:
        if measured_value > rule['max']:
            compliant = False
            status = 'non-compliant'
    
    if 'min' in rule and 'max' in rule:
        if measured_value < rule['min'] or measured_value > rule['max']:
            compliant = False
            status = 'non-compliant'
    
    return {
        'compliant': compliant,
        'status': status,
        'required': required,
        'measured': round(measured_value, 2),
        'min': rule.get('min'),
        'max': rule.get('max')
    }


def evaluate_all_measurements(measurements, rules=None):
    """
    Evaluate all measurements against rules.
    
    Args:
        measurements: Dictionary of parameter -> measured_value
        rules: Optional rules dict
    
    Returns:
        Dictionary with compliance results for each parameter
    """
    if rules is None:
        rules = load_rules()
    
    results = {}
    for param, value in measurements.items():
        if value is not None:
            results[param] = check_compliance(param, value, rules)
    
    return results


def calculate_overall_compliance(results):
    """
    Calculate overall compliance percentage.
    
    Args:
        results: Dictionary of parameter -> compliance result
    
    Returns:
        Dictionary with 'percentage', 'total', 'compliant', 'verdict'
    """
    if not results:
        return {
            'percentage': 0,
            'total': 0,
            'compliant': 0,
            'verdict': 'Non-Compliant'
        }
    
    total = len(results)
    compliant = sum(1 for r in results.values() if r.get('compliant') is True)
    percentage = round((compliant / total) * 100, 2)
    
    if percentage == 100:
        verdict = 'Fully Compliant'
    elif percentage >= 70:
        verdict = 'Partially Compliant'
    else:
        verdict = 'Non-Compliant'
    
    return {
        'percentage': percentage,
        'total': total,
        'compliant': compliant,
        'verdict': verdict
    }
