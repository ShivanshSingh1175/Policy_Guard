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
