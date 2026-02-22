"""
Add IBM AML Dataset Labels and Ground Truth Comparison
Simulates laundering labels from IBM AML dataset for validation
"""
import asyncio
import sys
import random
from pathlib import Path
from datetime import datetime

sys.path.insert(0, str(Path(__file__).parent.parent))

from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings


async def add_laundering_labels(db, company_id):
    """
    Add simulated laundering labels to transactions
    Based on IBM AML dataset structure
    """
    print("\n1. Adding laundering labels to transactions...")
    
    # Get all transactions
    transactions = await db.transactions.find({"company_id": company_id}).to_list(length=None)
    
    if not transactions:
        print("  ! No transactions found")
        return
    
    # Label transactions based on patterns
    labeled_count = 0
    laundering_count = 0
    
    for txn in transactions:
        # Determine if transaction should be labeled as laundering
        is_laundering = False
        laundering_type = None
        confidence = 0.0
        
        amount = txn.get("amount", 0)
        txn_type = txn.get("transaction_type", "")
        
        # High-value cash transactions
        if amount >= 10000 and txn_type == "CASH":
            is_laundering = True
            laundering_type = "placement"
            confidence = 0.85
        
        # Structuring pattern (near threshold)
        elif 9000 <= amount < 10000 and txn_type == "CASH":
            is_laundering = True
            laundering_type = "structuring"
            confidence = 0.92
        
        # Large wire transfers
        elif amount >= 10000 and txn_type == "WIRE":
            is_laundering = random.choice([True, False])  # 50% chance
            laundering_type = "layering" if is_laundering else None
            confidence = 0.65 if is_laundering else 0.0
        
        # Round amounts (potential layering)
        elif amount % 1000 == 0 and amount >= 5000:
            is_laundering = random.choice([True, False, False])  # 33% chance
            laundering_type = "layering" if is_laundering else None
            confidence = 0.55 if is_laundering else 0.0
        
        # Normal transactions
        else:
            is_laundering = False
            laundering_type = None
            confidence = 0.0
        
        # Update transaction with label
        await db.transactions.update_one(
            {"_id": txn["_id"]},
            {
                "$set": {
                    "is_laundering": is_laundering,
                    "laundering_type": laundering_type,
                    "laundering_confidence": confidence,
                    "labeled_at": datetime.utcnow()
                }
            }
        )
        
        labeled_count += 1
        if is_laundering:
            laundering_count += 1
    
    print(f"✓ Labeled {labeled_count} transactions")
    print(f"  - Laundering: {laundering_count} ({laundering_count/labeled_count*100:.1f}%)")
    print(f"  - Normal: {labeled_count - laundering_count} ({(labeled_count-laundering_count)/labeled_count*100:.1f}%)")
    
    return labeled_count, laundering_count


async def calculate_detection_accuracy(db, company_id):
    """
    Calculate detection accuracy by comparing violations to ground truth labels
    """
    print("\n2. Calculating detection accuracy...")
    
    # Get all violations
    violations = await db.violations.find({"company_id": company_id}).to_list(length=None)
    
    if not violations:
        print("  ! No violations found")
        return
    
    # Extract transaction IDs from violations
    detected_txn_ids = set()
    for violation in violations:
        doc_data = violation.get("document_data", {})
        txn_id = doc_data.get("transaction_id")
        if txn_id:
            detected_txn_ids.add(txn_id)
    
    # Get all labeled transactions
    all_txns = await db.transactions.find({"company_id": company_id}).to_list(length=None)
    
    # Calculate metrics
    true_positives = 0  # Correctly detected laundering
    false_positives = 0  # Incorrectly flagged as laundering
    true_negatives = 0  # Correctly identified as normal
    false_negatives = 0  # Missed laundering
    
    for txn in all_txns:
        txn_id = txn.get("transaction_id")
        is_laundering = txn.get("is_laundering", False)
        is_detected = txn_id in detected_txn_ids
        
        if is_laundering and is_detected:
            true_positives += 1
        elif is_laundering and not is_detected:
            false_negatives += 1
        elif not is_laundering and is_detected:
            false_positives += 1
        elif not is_laundering and not is_detected:
            true_negatives += 1
    
    # Calculate metrics
    total = len(all_txns)
    accuracy = (true_positives + true_negatives) / total if total > 0 else 0
    precision = true_positives / (true_positives + false_positives) if (true_positives + false_positives) > 0 else 0
    recall = true_positives / (true_positives + false_negatives) if (true_positives + false_negatives) > 0 else 0
    f1_score = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
    
    # Store metrics
    metrics_doc = {
        "company_id": company_id,
        "calculated_at": datetime.utcnow(),
        "total_transactions": total,
        "true_positives": true_positives,
        "false_positives": false_positives,
        "true_negatives": true_negatives,
        "false_negatives": false_negatives,
        "accuracy": round(accuracy, 4),
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "f1_score": round(f1_score, 4),
        "detection_rate": round(true_positives / (true_positives + false_negatives), 4) if (true_positives + false_negatives) > 0 else 0
    }
    
    # Clear old metrics and insert new
    await db.detection_metrics.delete_many({"company_id": company_id})
    await db.detection_metrics.insert_one(metrics_doc)
    
    print(f"✓ Detection Accuracy Metrics:")
    print(f"  - Accuracy:  {accuracy*100:.2f}%")
    print(f"  - Precision: {precision*100:.2f}%")
    print(f"  - Recall:    {recall*100:.2f}%")
    print(f"  - F1 Score:  {f1_score:.4f}")
    print(f"\n  Confusion Matrix:")
    print(f"  - True Positives:  {true_positives}")
    print(f"  - False Positives: {false_positives}")
    print(f"  - True Negatives:  {true_negatives}")
    print(f"  - False Negatives: {false_negatives}")
    
    return metrics_doc


async def generate_detection_report(db, company_id):
    """
    Generate detailed detection report by laundering type
    """
    print("\n3. Generating detection report by laundering type...")
    
    # Aggregate by laundering type
    pipeline = [
        {
            "$match": {
                "company_id": company_id,
                "is_laundering": True
            }
        },
        {
            "$group": {
                "_id": "$laundering_type",
                "count": {"$sum": 1},
                "total_amount": {"$sum": "$amount"},
                "avg_confidence": {"$avg": "$laundering_confidence"}
            }
        },
        {
            "$sort": {"count": -1}
        }
    ]
    
    results = await db.transactions.aggregate(pipeline).to_list(length=None)
    
    print(f"✓ Laundering Activity by Type:")
    for result in results:
        laundering_type = result["_id"] or "unknown"
        count = result["count"]
        total_amount = result["total_amount"]
        avg_confidence = result["avg_confidence"]
        print(f"  - {laundering_type.upper()}: {count} transactions, ${total_amount:,.2f}, avg confidence: {avg_confidence:.2f}")
    
    return results


async def main():
    """Main function"""
    print("=" * 70)
    print("IBM AML Dataset Labels & Ground Truth Comparison")
    print("=" * 70)
    
    # Connect to MongoDB
    print(f"\nConnecting to MongoDB at {settings.MONGO_URI}...")
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = client[settings.MONGO_DB_NAME]
    
    try:
        await client.admin.command('ping')
        print("✓ Connected to MongoDB successfully")
    except Exception as e:
        print(f"✗ Failed to connect to MongoDB: {e}")
        return
    
    # Get demo company
    demo_company = await db.companies.find_one({"name": "AML Demo Bank"})
    if not demo_company:
        print("✗ Demo company not found. Run seed_demo_data.py first.")
        return
    
    company_id = str(demo_company["_id"])
    print(f"✓ Found demo company: {company_id}")
    
    try:
        # Add labels and calculate metrics
        await add_laundering_labels(db, company_id)
        metrics = await calculate_detection_accuracy(db, company_id)
        report = await generate_detection_report(db, company_id)
        
        print("\n" + "=" * 70)
        print("LABELING AND VALIDATION COMPLETED!")
        print("=" * 70)
        print(f"\nGround truth labels added to transactions")
        print(f"Detection metrics stored in 'detection_metrics' collection")
        print(f"View metrics in the Analytics dashboard")
        print("\n" + "=" * 70)
        
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        client.close()


if __name__ == '__main__':
    asyncio.run(main())
