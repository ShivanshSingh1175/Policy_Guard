"""
Explainability service - generates human-readable explanations for violations
"""
from typing import Dict, Any, List, Optional


def generate_violation_explanation(
    violation: Dict[str, Any],
    rule: Dict[str, Any],
    recommendation: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Generates human-readable explanation for a violation
    """
    document_data = violation.get("document_data", {})
    threshold_params = rule.get("threshold_params", {})
    control_id = rule.get("control_id")
    
    # Build rule summary
    rule_summary = f"{rule['name']}: {rule.get('description', 'No description available')}"
    
    # Build dataset mapping if available
    dataset_mapping = None
    if recommendation:
        dataset_mapping = {
            "control_id": recommendation.get("control_id", ""),
            "title": recommendation.get("title", ""),
            "regulatory_reference": recommendation.get("regulatory_reference", "")
        }
    
    # Build reasons based on control type
    reasons = build_reasons(control_id, document_data, threshold_params, rule)
    
    # Build threshold info
    threshold_info = {
        "configured": threshold_params,
        "actual": extract_actual_values(document_data, control_id)
    }
    
    return {
        "rule_summary": rule_summary,
        "dataset_mapping": dataset_mapping,
        "reasons": reasons,
        "threshold_info": threshold_info
    }


def build_reasons(
    control_id: Optional[str],
    document_data: Dict[str, Any],
    threshold_params: Dict[str, Any],
    rule: Dict[str, Any]
) -> List[str]:
    """
    Builds bullet-point reasons for the violation
    """
    reasons = []
    
    if not control_id:
        # Generic reason
        reasons.append(f"Document matched rule criteria: {rule.get('name', 'Unknown rule')}")
        return reasons
    
    if control_id == "CTR-01":
        amount = document_data.get("amount", 0)
        limit = threshold_params.get("amount_limit", 1000000)
        reasons.append(f"Cash transaction of ₹{amount:,.0f} exceeds CTR threshold of ₹{limit:,.0f}")
        reasons.append(f"Transaction type: {document_data.get('transaction_type', 'CASH')}")
        reasons.append(f"Account: {document_data.get('src_account', 'Unknown')}")
        
    elif control_id == "STR-01":
        amount = document_data.get("amount", 0)
        min_amt = threshold_params.get("min_amount", 900000)
        max_amt = threshold_params.get("max_amount", 1000000)
        reasons.append(f"Transaction of ₹{amount:,.0f} falls in structuring range (₹{min_amt:,.0f} - ₹{max_amt:,.0f})")
        reasons.append(f"Potential smurfing pattern detected")
        reasons.append(f"Threshold: {threshold_params.get('min_count', 3)} transactions in {threshold_params.get('window_hours', 24)} hours")
        
    elif control_id == "HR-01":
        risk_score = document_data.get("risk_score", 0)
        threshold = threshold_params.get("risk_score_threshold", 70)
        reasons.append(f"Account risk score of {risk_score} exceeds threshold of {threshold}")
        reasons.append(f"Account: {document_data.get('account_id', 'Unknown')}")
        reasons.append(f"Customer segment: {document_data.get('segment', 'Unknown')}")
        
    elif control_id == "SAN-01":
        country = document_data.get("country", "Unknown")
        reasons.append(f"Transaction involves sanctioned jurisdiction: {country}")
        reasons.append(f"Account: {document_data.get('account_id', 'Unknown')}")
        reasons.append("Requires immediate review and potential blocking")
        
    elif control_id == "VEL-01":
        reasons.append(f"Unusual transaction velocity detected")
        reasons.append(f"Account: {document_data.get('account_id', 'Unknown')}")
        reasons.append(f"Daily limit: {threshold_params.get('daily_limit', 10)} transactions")
        
    elif control_id == "RRT-01":
        amount = document_data.get("amount", 0)
        reasons.append(f"Potential round-trip transaction of ₹{amount:,.0f}")
        reasons.append(f"Detection window: {threshold_params.get('window_hours', 72)} hours")
        reasons.append(f"Source and destination accounts may be linked")
        
    elif control_id == "NW-01":
        amount = document_data.get("amount", 0)
        reasons.append(f"Large transaction of ₹{amount:,.0f} outside business hours")
        reasons.append(f"Threshold: ₹{threshold_params.get('amount_limit', 500000):,.0f}")
        reasons.append(f"Business hours: {threshold_params.get('business_hours_start', 6)}:00 - {threshold_params.get('business_hours_end', 22)}:00")
        
    elif control_id == "CDD-01":
        reasons.append(f"Customer due diligence refresh required")
        reasons.append(f"Account: {document_data.get('account_id', 'Unknown')}")
        reasons.append(f"Risk level determines refresh frequency")
        
    elif control_id == "PAY-01":
        salary = document_data.get("salary_amount", 0)
        reasons.append(f"Payroll anomaly detected: ₹{salary:,.0f}")
        reasons.append(f"Employee: {document_data.get('employee_id', 'Unknown')}")
        reasons.append(f"Check for ghost employees or unusual salary spikes")
        
    elif control_id == "GEO-01":
        country = document_data.get("country", "Unknown")
        amount = document_data.get("amount", 0)
        reasons.append(f"Transaction to high-risk jurisdiction: {country}")
        reasons.append(f"Amount: ₹{amount:,.0f}")
        reasons.append(f"Threshold: ₹{threshold_params.get('amount_threshold', 100000):,.0f}")
    
    else:
        # Generic fallback
        reasons.append(f"Document matched rule: {rule.get('name', 'Unknown')}")
        reasons.append(f"Severity: {rule.get('severity', 'MEDIUM')}")
    
    return reasons


def extract_actual_values(document_data: Dict[str, Any], control_id: Optional[str]) -> Dict[str, Any]:
    """
    Extracts actual values from document data for comparison
    """
    actual = {}
    
    if control_id in ["CTR-01", "STR-01", "RRT-01", "NW-01", "GEO-01"]:
        actual["amount"] = document_data.get("amount", 0)
        actual["transaction_type"] = document_data.get("transaction_type", "Unknown")
        
    if control_id == "HR-01":
        actual["risk_score"] = document_data.get("risk_score", 0)
        
    if control_id in ["SAN-01", "GEO-01"]:
        actual["country"] = document_data.get("country", "Unknown")
        
    if control_id == "PAY-01":
        actual["salary_amount"] = document_data.get("salary_amount", 0)
    
    return actual
