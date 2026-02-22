"""
Core scan execution engine
Loads rules and executes them against MongoDB collections
"""
from typing import List, Optional, Dict, Any
from datetime import datetime
import time
from bson import ObjectId

from app.db import get_database
from app.models.scan import ScanStatus, ScanSummary, RuleScanResult
from app.services.advanced_rules import (
    AdvancedRuleEngine,
    create_violations_from_pattern
)


async def run_scan(
    company_id: str,
    collections: Optional[List[str]] = None,
    rule_ids: Optional[List[str]] = None
) -> ScanSummary:
    """
    Execute compliance scan across specified collections
    
    Args:
        company_id: Company ID for multi-tenant isolation
        collections: Optional list of collection names to scan
        rule_ids: Optional list of specific rule IDs to execute
        
    Returns:
        ScanSummary with execution results
    """
    db = get_database()
    scan_start_time = time.time()
    
    # Build rule query filter with company_id
    rule_filter: Dict[str, Any] = {
        "enabled": True,
        "company_id": company_id
    }
    if collections:
        rule_filter["collection"] = {"$in": collections}
    if rule_ids:
        rule_filter["_id"] = {"$in": [ObjectId(rid) for rid in rule_ids if ObjectId.is_valid(rid)]}
    
    # Load enabled rules
    rules_cursor = db.rules.find(rule_filter)
    rules = await rules_cursor.to_list(length=None)
    
    if not rules:
        # Create empty scan run
        scan_run_doc = {
            "company_id": company_id,
            "status": ScanStatus.COMPLETED,
            "started_at": datetime.utcnow(),
            "completed_at": datetime.utcnow(),
            "total_rules_executed": 0,
            "total_violations_found": 0,
            "collections_scanned": [],
            "rule_results": []
        }
        result = await db.scan_runs.insert_one(scan_run_doc)
        
        return ScanSummary(
            scan_run_id=str(result.inserted_id),
            status=ScanStatus.COMPLETED,
            total_rules_executed=0,
            total_violations_found=0,
            execution_time_seconds=0.0,
            rule_results=[]
        )
    
    # Create scan run document
    scan_run_doc = {
        "company_id": company_id,
        "status": ScanStatus.RUNNING,
        "started_at": datetime.utcnow(),
        "completed_at": None,
        "total_rules_executed": 0,
        "total_violations_found": 0,
        "collections_scanned": list(set([r["collection"] for r in rules])),
        "rule_results": []
    }
    scan_run_result = await db.scan_runs.insert_one(scan_run_doc)
    scan_run_id = str(scan_run_result.inserted_id)
    
    # Execute each rule
    rule_results = []
    total_violations = 0
    
    # First, run advanced pattern detection rules
    print("Running advanced pattern detection...")
    advanced_violations = await run_advanced_pattern_detection(
        db=db,
        company_id=company_id,
        scan_run_id=scan_run_id
    )
    total_violations += advanced_violations
    
    for rule in rules:
        rule_start = time.time()
        rule_id = str(rule["_id"])
        
        try:
            # Execute rule query against target collection
            violations = await execute_rule(
                db=db,
                rule=rule,
                scan_run_id=scan_run_id
            )
            
            violations_count = len(violations)
            total_violations += violations_count
            
            rule_result = RuleScanResult(
                rule_id=rule_id,
                rule_name=rule["name"],
                collection=rule["collection"],
                violations_found=violations_count,
                execution_time_ms=(time.time() - rule_start) * 1000
            )
            rule_results.append(rule_result)
            
        except Exception as e:
            # Log error but continue with other rules
            print(f"Error executing rule {rule_id}: {str(e)}")
            rule_results.append(RuleScanResult(
                rule_id=rule_id,
                rule_name=rule["name"],
                collection=rule["collection"],
                violations_found=0,
                execution_time_ms=(time.time() - rule_start) * 1000
            ))
    
    # Update scan run with results
    scan_end_time = datetime.utcnow()
    await db.scan_runs.update_one(
        {"_id": ObjectId(scan_run_id)},
        {
            "$set": {
                "status": ScanStatus.COMPLETED,
                "completed_at": scan_end_time,
                "total_rules_executed": len(rules),
                "total_violations_found": total_violations,
                "rule_results": [r.model_dump() for r in rule_results]
            }
        }
    )
    
    execution_time = time.time() - scan_start_time
    
    return ScanSummary(
        scan_run_id=scan_run_id,
        status=ScanStatus.COMPLETED,
        total_rules_executed=len(rules),
        total_violations_found=total_violations,
        execution_time_seconds=round(execution_time, 2),
        rule_results=rule_results
    )


async def execute_rule(
    db,
    rule: Dict[str, Any],
    scan_run_id: str
) -> List[Dict[str, Any]]:
    """
    Execute a single rule's query against its target collection
    
    Args:
        db: Database instance
        rule: Rule document
        scan_run_id: ID of the current scan run
        
    Returns:
        List of violation documents created
    """
    collection_name = rule["collection"]
    query = rule["query"]
    
    # Check if collection exists
    collection_names = await db.list_collection_names()
    if collection_name not in collection_names:
        print(f"Warning: Collection '{collection_name}' does not exist. Skipping rule.")
        return []
    
    # Execute query
    target_collection = db[collection_name]
    
    # Ensure query is scoped by company_id
    scoped_query = query.copy()
    scoped_query["company_id"] = rule["company_id"]
    
    cursor = target_collection.find(scoped_query)
    matching_docs = await cursor.to_list(length=None)
    
    # Create violation records
    violations = []
    now = datetime.utcnow()
    
    for doc in matching_docs:
        violation_doc = {
            "company_id": rule["company_id"],
            "scan_run_id": scan_run_id,
            "rule_id": str(rule["_id"]),
            "rule_name": rule["name"],
            "collection": collection_name,
            "document_id": str(doc.get("_id", "unknown")),
            "document_data": sanitize_document(doc),
            "severity": rule["severity"],
            "status": "OPEN",
            "reviewer_note": None,
            "reviewed_by": None,
            "reviewed_at": None,
            "created_at": now
        }
        
        result = await db.violations.insert_one(violation_doc)
        violation_doc["_id"] = str(result.inserted_id)
        violations.append(violation_doc)
    
    return violations


def sanitize_document(doc: Dict[str, Any]) -> Dict[str, Any]:
    """
    Sanitize document for storage (convert ObjectId to string, etc.)
    """
    sanitized = {}
    for key, value in doc.items():
        if isinstance(value, ObjectId):
            sanitized[key] = str(value)
        elif isinstance(value, dict):
            sanitized[key] = sanitize_document(value)
        elif isinstance(value, list):
            sanitized[key] = [
                sanitize_document(item) if isinstance(item, dict) else item
                for item in value
            ]
        else:
            sanitized[key] = value
    return sanitized



async def run_advanced_pattern_detection(
    db,
    company_id: str,
    scan_run_id: str
) -> int:
    """
    Run advanced pattern detection using aggregation pipelines
    
    Returns: Total number of violations created
    """
    total_violations = 0
    engine = AdvancedRuleEngine()
    
    # 1. Structuring Detection
    try:
        structuring_results = await engine.detect_structuring_pattern(db, company_id, hours_window=24)
        if structuring_results:
            violations_created = await create_violations_from_pattern(
                db=db,
                company_id=company_id,
                scan_run_id=scan_run_id,
                rule_id="ADVANCED_STRUCTURING",
                rule_name="Advanced Structuring Detection",
                pattern_results=structuring_results,
                severity="CRITICAL",
                explanation_template="Account {account_id} made {transaction_count} transactions totaling ${total_amount:.2f} between $9,000-$9,999 within {time_span_hours:.1f} hours. This pattern indicates potential structuring to avoid CTR reporting."
            )
            total_violations += violations_created
            print(f"  ✓ Structuring detection: {violations_created} violations")
    except Exception as e:
        print(f"  ! Structuring detection error: {e}")
    
    # 2. Rapid Transfers Detection
    try:
        rapid_transfer_results = await engine.detect_rapid_transfers(db, company_id, hours_window=24, min_transfers=5)
        if rapid_transfer_results:
            violations_created = await create_violations_from_pattern(
                db=db,
                company_id=company_id,
                scan_run_id=scan_run_id,
                rule_id="ADVANCED_RAPID_TRANSFERS",
                rule_name="Rapid Transfer Pattern Detection",
                pattern_results=rapid_transfer_results,
                severity="HIGH",
                explanation_template="Account {src_account} made {transfer_count} rapid transfers to {dst_account} totaling ${total_amount:.2f} within 24 hours. Average transfer: ${avg_amount:.2f}. This may indicate layering activity."
            )
            total_violations += violations_created
            print(f"  ✓ Rapid transfers detection: {violations_created} violations")
    except Exception as e:
        print(f"  ! Rapid transfers detection error: {e}")
    
    # 3. High-Risk Account Detection
    try:
        high_risk_results = await engine.detect_high_risk_accounts(db, company_id, violation_threshold=5)
        if high_risk_results:
            violations_created = await create_violations_from_pattern(
                db=db,
                company_id=company_id,
                scan_run_id=scan_run_id,
                rule_id="ADVANCED_HIGH_RISK",
                rule_name="High-Risk Account Activity",
                pattern_results=high_risk_results,
                severity="HIGH",
                explanation_template="Account {account_id} has {violation_count} violations (Risk Score: {risk_score}) including {critical_count} critical and {high_count} high severity. Enhanced due diligence required."
            )
            total_violations += violations_created
            print(f"  ✓ High-risk accounts: {violations_created} violations")
    except Exception as e:
        print(f"  ! High-risk account detection error: {e}")
    
    # 4. Unusual Frequency Detection
    try:
        unusual_freq_results = await engine.detect_unusual_frequency(db, company_id, days_window=7)
        if unusual_freq_results:
            violations_created = await create_violations_from_pattern(
                db=db,
                company_id=company_id,
                scan_run_id=scan_run_id,
                rule_id="ADVANCED_UNUSUAL_FREQUENCY",
                rule_name="Unusual Transaction Frequency",
                pattern_results=unusual_freq_results,
                severity="MEDIUM",
                explanation_template="Account {account_id} shows {frequency_multiplier:.1f}x increase in transaction frequency. Recent: {recent_transaction_count} transactions (${recent_total_amount:.2f}) vs historical average: {historical_avg_per_week:.1f} per week."
            )
            total_violations += violations_created
            print(f"  ✓ Unusual frequency: {violations_created} violations")
    except Exception as e:
        print(f"  ! Unusual frequency detection error: {e}")
    
    # 5. Round Amount Pattern Detection
    try:
        round_amount_results = await engine.detect_round_amount_pattern(db, company_id, days_window=30)
        if round_amount_results:
            violations_created = await create_violations_from_pattern(
                db=db,
                company_id=company_id,
                scan_run_id=scan_run_id,
                rule_id="ADVANCED_ROUND_AMOUNTS",
                rule_name="Suspicious Round Amount Pattern",
                pattern_results=round_amount_results,
                severity="MEDIUM",
                explanation_template="Account {account_id} made {round_transaction_count} transactions with round amounts totaling ${total_round_amount:.2f}. Round amounts may indicate layering or placement activities."
            )
            total_violations += violations_created
            print(f"  ✓ Round amount patterns: {violations_created} violations")
    except Exception as e:
        print(f"  ! Round amount detection error: {e}")
    
    # 6. Daily Structuring Detection
    try:
        daily_structuring_results = await engine.detect_daily_structuring(db, company_id, days_window=30)
        if daily_structuring_results:
            violations_created = await create_violations_from_pattern(
                db=db,
                company_id=company_id,
                scan_run_id=scan_run_id,
                rule_id="ADVANCED_DAILY_STRUCTURING",
                rule_name="Daily Structuring Pattern",
                pattern_results=daily_structuring_results,
                severity="CRITICAL",
                explanation_template="Account {account_id} made {transaction_count} transactions on {day} totaling ${daily_total:.2f} (below $10k threshold). This sophisticated structuring pattern avoids daily reporting requirements."
            )
            total_violations += violations_created
            print(f"  ✓ Daily structuring patterns: {violations_created} violations")
    except Exception as e:
        print(f"  ! Daily structuring detection error: {e}")
    
    return total_violations
