"""
Dataset parser service for importing compliance recommendations
"""
from typing import List, Dict, Any
from datetime import datetime


def get_sample_recommendations() -> List[Dict[str, Any]]:
    """
    Returns sample dataset recommendations aligned with AML/CTR requirements
    Based on HackFest internal recommendation doc
    """
    return [
        {
            "control_id": "CTR-01",
            "title": "Large Cash Transaction Reporting",
            "description": "Monitor and report cash transactions exceeding ₹10 lakhs (or equivalent) within a 24-hour period. This control helps detect potential money laundering through large cash deposits or withdrawals.",
            "threshold_params": {
                "amount_limit": 1000000,
                "window_hours": 24,
                "transaction_type": "CASH"
            },
            "risk_level": "HIGH",
            "regulatory_reference": "PMLA 2002, Section 12 - Cash Transaction Report (CTR)"
        },
        {
            "control_id": "STR-01",
            "title": "Structuring Detection (Smurfing)",
            "description": "Detect multiple transactions just below reporting thresholds to evade CTR requirements. Monitor for 3 or more transactions between ₹9-10 lakhs within 24 hours from the same source.",
            "threshold_params": {
                "min_count": 3,
                "min_amount": 900000,
                "max_amount": 1000000,
                "window_hours": 24
            },
            "risk_level": "CRITICAL",
            "regulatory_reference": "FATF Recommendation 10 - Structuring/Smurfing Detection"
        },
        {
            "control_id": "HR-01",
            "title": "High-Risk Account Monitoring",
            "description": "Enhanced monitoring for accounts with risk scores above 70. Includes PEPs, high-risk jurisdictions, and suspicious activity patterns.",
            "threshold_params": {
                "risk_score_threshold": 70,
                "transaction_limit": 500000
            },
            "risk_level": "HIGH",
            "regulatory_reference": "PMLA Rules 2005, Rule 9 - Enhanced Due Diligence"
        },
        {
            "control_id": "SAN-01",
            "title": "Sanctions Screening",
            "description": "Screen all transactions against OFAC, UN, and local sanctions lists. Block transactions involving sanctioned entities or countries.",
            "threshold_params": {
                "sanctioned_countries": ["NK", "IR", "SY"],
                "match_threshold": 0.85
            },
            "risk_level": "CRITICAL",
            "regulatory_reference": "UNSC Sanctions, OFAC SDN List"
        },
        {
            "control_id": "VEL-01",
            "title": "Transaction Velocity Monitoring",
            "description": "Detect unusual transaction frequency. Alert when account exceeds 10 transactions per day or 50 per week.",
            "threshold_params": {
                "daily_limit": 10,
                "weekly_limit": 50
            },
            "risk_level": "MEDIUM",
            "regulatory_reference": "Basel AML Index - Velocity Checks"
        },
        {
            "control_id": "RRT-01",
            "title": "Round-Trip Transaction Detection",
            "description": "Identify circular money flows where funds return to origin within 72 hours. Common in trade-based money laundering.",
            "threshold_params": {
                "window_hours": 72,
                "min_amount": 100000
            },
            "risk_level": "HIGH",
            "regulatory_reference": "FATF Recommendation 16 - Wire Transfers"
        },
        {
            "control_id": "NW-01",
            "title": "Night/Weekend Transaction Monitoring",
            "description": "Flag large transactions (>₹5 lakhs) occurring outside business hours (10 PM - 6 AM) or on weekends.",
            "threshold_params": {
                "amount_limit": 500000,
                "business_hours_start": 6,
                "business_hours_end": 22
            },
            "risk_level": "MEDIUM",
            "regulatory_reference": "RBI Master Direction - KYC"
        },
        {
            "control_id": "CDD-01",
            "title": "Customer Due Diligence Refresh",
            "description": "Ensure CDD is refreshed every 2 years for low-risk, 1 year for medium-risk, and 6 months for high-risk customers.",
            "threshold_params": {
                "low_risk_months": 24,
                "medium_risk_months": 12,
                "high_risk_months": 6
            },
            "risk_level": "MEDIUM",
            "regulatory_reference": "PMLA Rules 2005, Rule 9 - CDD Procedures"
        },
        {
            "control_id": "PAY-01",
            "title": "Payroll Anomaly Detection",
            "description": "Detect ghost employees (multiple employees with same bank account) and unusual salary spikes (>50% increase).",
            "threshold_params": {
                "spike_threshold_percent": 50,
                "duplicate_account_check": True
            },
            "risk_level": "HIGH",
            "regulatory_reference": "Internal Fraud Prevention - Payroll Controls"
        },
        {
            "control_id": "GEO-01",
            "title": "Geographic Risk Assessment",
            "description": "Monitor transactions to/from high-risk jurisdictions as per FATF grey/black lists.",
            "threshold_params": {
                "high_risk_countries": ["AF", "MM", "PK"],
                "amount_threshold": 100000
            },
            "risk_level": "HIGH",
            "regulatory_reference": "FATF High-Risk Jurisdictions"
        }
    ]


def parse_recommendations_from_json(data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Parse and validate recommendations from JSON data
    """
    parsed = []
    now = datetime.utcnow()
    
    for item in data:
        rec = {
            "control_id": item.get("control_id"),
            "title": item.get("title"),
            "description": item.get("description"),
            "threshold_params": item.get("threshold_params", {}),
            "risk_level": item.get("risk_level", "MEDIUM"),
            "regulatory_reference": item.get("regulatory_reference", ""),
            "implemented": False,
            "mapped_rule_id": None,
            "violations_detected": 0,
            "accounts_affected": 0,
            "created_at": now,
            "updated_at": now
        }
        parsed.append(rec)
    
    return parsed
