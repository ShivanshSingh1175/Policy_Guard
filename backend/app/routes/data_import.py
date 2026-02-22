"""
Data import endpoints for CSV uploads
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from typing import Dict, Any, List
import csv
import io
from datetime import datetime
from bson import ObjectId

from app.db import get_database
from app.routes.auth import get_current_user, TokenData

router = APIRouter()


def parse_csv_file(file_content: bytes) -> List[Dict[str, Any]]:
    """Parse CSV file content into list of dictionaries"""
    try:
        # Decode bytes to string
        content = file_content.decode('utf-8')
        # Parse CSV
        reader = csv.DictReader(io.StringIO(content))
        return list(reader)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")


@router.post("/import/transactions")
async def import_transactions(
    file: UploadFile = File(...),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Import transactions from CSV file
    Expected columns: transaction_id (optional), date, amount, currency, from_account, to_account, type, channel
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
    
    # Read and parse CSV
    file_content = await file.read()
    rows = parse_csv_file(file_content)
    
    if not rows:
        raise HTTPException(status_code=400, detail="CSV file is empty")
    
    # Validate required columns
    required_columns = ['date', 'amount', 'from_account', 'to_account']
    first_row = rows[0]
    missing_columns = [col for col in required_columns if col not in first_row]
    if missing_columns:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required columns: {', '.join(missing_columns)}"
        )
    
    db = get_database()
    company_id = current_user.company_id
    
    inserted = 0
    failed = 0
    errors = []
    
    for idx, row in enumerate(rows):
        try:
            # Parse and validate data
            transaction_doc = {
                "company_id": company_id,
                "transaction_id": row.get('transaction_id', f"TXN{idx:06d}"),
                "timestamp": datetime.fromisoformat(row['date'].replace('Z', '+00:00')) if 'T' in row['date'] else datetime.strptime(row['date'], '%Y-%m-%d'),
                "amount": float(row['amount']),
                "currency": row.get('currency', 'USD'),
                "transaction_type": row.get('type', 'TRANSFER'),
                "channel": row.get('channel', 'ONLINE'),
                "src_account": row['from_account'],
                "dst_account": row['to_account'],
                "description": row.get('description', ''),
                "status": row.get('status', 'COMPLETED'),
                "created_at": datetime.utcnow()
            }
            
            await db.transactions.insert_one(transaction_doc)
            inserted += 1
            
        except Exception as e:
            failed += 1
            if len(errors) < 5:  # Keep only first 5 errors
                errors.append(f"Row {idx + 1}: {str(e)}")
    
    return {
        "rows_processed": len(rows),
        "rows_inserted": inserted,
        "rows_failed": failed,
        "sample_errors": errors
    }


@router.post("/import/accounts")
async def import_accounts(
    file: UploadFile = File(...),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Import accounts from CSV file
    Expected columns: account_id, customer_id, country, risk_score, segment
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
    
    # Read and parse CSV
    file_content = await file.read()
    rows = parse_csv_file(file_content)
    
    if not rows:
        raise HTTPException(status_code=400, detail="CSV file is empty")
    
    # Validate required columns
    required_columns = ['account_id']
    first_row = rows[0]
    missing_columns = [col for col in required_columns if col not in first_row]
    if missing_columns:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required columns: {', '.join(missing_columns)}"
        )
    
    db = get_database()
    company_id = current_user.company_id
    
    inserted = 0
    failed = 0
    errors = []
    
    for idx, row in enumerate(rows):
        try:
            # Parse and validate data
            account_doc = {
                "company_id": company_id,
                "account_id": row['account_id'],
                "customer_id": row.get('customer_id', f"CUST{idx:04d}"),
                "customer_name": row.get('customer_name', f"Customer {idx}"),
                "account_type": row.get('account_type', 'CHECKING'),
                "balance": float(row.get('balance', 0)),
                "currency": row.get('currency', 'USD'),
                "country": row.get('country', 'US'),
                "status": row.get('status', 'ACTIVE'),
                "risk_score": int(row.get('risk_score', 50)),
                "segment": row.get('segment', 'RETAIL'),
                "opened_date": datetime.utcnow(),
                "created_at": datetime.utcnow()
            }
            
            await db.accounts.insert_one(account_doc)
            inserted += 1
            
        except Exception as e:
            failed += 1
            if len(errors) < 5:
                errors.append(f"Row {idx + 1}: {str(e)}")
    
    return {
        "rows_processed": len(rows),
        "rows_inserted": inserted,
        "rows_failed": failed,
        "sample_errors": errors
    }


@router.post("/import/payroll")
async def import_payroll(
    file: UploadFile = File(...),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Import payroll data from CSV file
    Expected columns: employee_id, name, department, salary, bank_account, pay_date
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
    
    # Read and parse CSV
    file_content = await file.read()
    rows = parse_csv_file(file_content)
    
    if not rows:
        raise HTTPException(status_code=400, detail="CSV file is empty")
    
    # Validate required columns
    required_columns = ['employee_id', 'name', 'salary']
    first_row = rows[0]
    missing_columns = [col for col in required_columns if col not in first_row]
    if missing_columns:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required columns: {', '.join(missing_columns)}"
        )
    
    db = get_database()
    company_id = current_user.company_id
    
    inserted = 0
    failed = 0
    errors = []
    
    for idx, row in enumerate(rows):
        try:
            # Parse and validate data
            payroll_doc = {
                "company_id": company_id,
                "employee_id": row['employee_id'],
                "employee_name": row['name'],
                "department": row.get('department', 'GENERAL'),
                "salary_amount": float(row['salary']),
                "bank_account_number": row.get('bank_account', ''),
                "pay_date": datetime.fromisoformat(row['pay_date'].replace('Z', '+00:00')) if 'pay_date' in row and 'T' in row['pay_date'] else datetime.strptime(row.get('pay_date', datetime.now().strftime('%Y-%m-%d')), '%Y-%m-%d'),
                "payment_method": row.get('payment_method', 'BANK_TRANSFER'),
                "status": row.get('status', 'PAID'),
                "created_at": datetime.utcnow()
            }
            
            await db.payroll.insert_one(payroll_doc)
            inserted += 1
            
        except Exception as e:
            failed += 1
            if len(errors) < 5:
                errors.append(f"Row {idx + 1}: {str(e)}")
    
    return {
        "rows_processed": len(rows),
        "rows_inserted": inserted,
        "rows_failed": failed,
        "sample_errors": errors
    }


@router.get("/stats")
async def get_data_stats(current_user: TokenData = Depends(get_current_user)):
    """
    Get statistics about imported data for the current company
    """
    db = get_database()
    company_id = current_user.company_id
    
    transactions_count = await db.transactions.count_documents({"company_id": company_id})
    accounts_count = await db.accounts.count_documents({"company_id": company_id})
    payroll_count = await db.payroll.count_documents({"company_id": company_id})
    
    return {
        "transactions": transactions_count,
        "accounts": accounts_count,
        "payroll": payroll_count
    }
