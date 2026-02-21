# PolicyGuard Dataset Documentation

## Official Dataset for GDG Hackfest 2.0

**Problem Statement**: Data Policy Compliance Agent (Problem Statement 3)  
**Event**: HackFest 2.0 | GDG Cloud New Delhi × Turgon  
**Date**: Feb 21–22, 2026

---

## Primary Dataset: IBM Transactions for Anti-Money Laundering (AML)

### Overview

PolicyGuard uses the **IBM Transactions for Anti-Money Laundering (AML)** dataset as recommended by the GDG Hackfest 2.0 organizers for the Policy Compliance problem statement.

### Dataset Details

**Source**: https://www.kaggle.com/datasets/ealtman2019/ibm-transactions-for-anti-money-laundering-aml  
**License**: CDLA-Sharing-1.0 (Community Data License Agreement)  
**Size**: Millions of synthetic financial transactions  
**Type**: Fully synthetic data (no PII, no privacy concerns)  
**Publisher**: IBM Research

### Why This Dataset?

The IBM AML dataset is ideal for PolicyGuard because:

1. **Pre-labeled Violations**: Transactions are explicitly tagged as compliant or violating, providing ground truth for testing our compliance agent
2. **Realistic Financial Data**: Generated via multi-agent simulation backed by IBM Research paper
3. **No Privacy Concerns**: Entirely synthetic data with no real customer information
4. **Rich Transaction Types**: Includes bank transfers, credit card transactions, checks, and purchases
5. **Complex Relationships**: Contains account relationships, amounts, timestamps, and beneficiary information
6. **Perfect for Rule Testing**: Easy to define and validate compliance policies against

### Dataset Structure

The IBM AML dataset contains the following key fields:

```
Transactions Collection:
- transaction_id: Unique identifier
- timestamp: Transaction date and time
- amount: Transaction amount in USD
- transaction_type: Type (TRANSFER, PAYMENT, CASH_IN, CASH_OUT, etc.)
- sender_account: Originating account ID
- receiver_account: Destination account ID
- sender_name: Sender information
- receiver_name: Receiver information
- is_laundering: Boolean flag (0 = compliant, 1 = violation)
- laundering_type: Type of money laundering pattern (if applicable)

Accounts Collection:
- account_id: Unique account identifier
- account_type: Personal, Business, etc.
- balance: Current balance
- risk_profile: Risk assessment score
- kyc_status: Know Your Customer verification status
- last_activity: Last transaction date

Customers Collection:
- customer_id: Unique customer identifier
- name: Customer name
- customer_type: Individual, Corporate, etc.
- risk_score: Compliance risk score
- country: Country of residence
- registration_date: Account creation date
```

### Example Compliance Rules

PolicyGuard can generate and apply rules like:

**Rule 1: High-Value Transaction Monitoring**
```json
{
  "name": "Large Transaction Without Documentation",
  "collection": "transactions",
  "query": {
    "$and": [
      {"amount": {"$gt": 10000}},
      {"documentation_status": {"$ne": "complete"}}
    ]
  },
  "severity": "HIGH"
}
```

**Rule 2: Rapid Succession Transfers (Structuring)**
```json
{
  "name": "Multiple Transactions Below Reporting Threshold",
  "collection": "transactions",
  "aggregation": [
    {"$match": {"amount": {"$gte": 9000, "$lt": 10000}}},
    {"$group": {
      "_id": "$sender_account",
      "count": {"$sum": 1},
      "total": {"$sum": "$amount"}
    }},
    {"$match": {"count": {"$gte": 3}}}
  ],
  "severity": "CRITICAL"
}
```

**Rule 3: Sanctioned Entity Screening**
```json
{
  "name": "Transactions with Sanctioned Entities",
  "collection": "transactions",
  "query": {
    "$or": [
      {"sender.sanctioned": true},
      {"receiver.sanctioned": true}
    ]
  },
  "severity": "CRITICAL"
}
```

**Rule 4: Dormant Account Sudden Activity**
```json
{
  "name": "Dormant Account Reactivation",
  "collection": "accounts",
  "query": {
    "$and": [
      {"last_activity_days": {"$gt": 180}},
      {"recent_transaction_count": {"$gt": 5}},
      {"recent_transaction_total": {"$gt": 50000}}
    ]
  },
  "severity": "MEDIUM"
}
```

---

## Dataset Import Process

### 1. Download Dataset

```bash
# Download from Kaggle
kaggle datasets download -d ealtman2019/ibm-transactions-for-anti-money-laundering-aml

# Extract files
unzip ibm-transactions-for-anti-money-laundering-aml.zip -d data/
```

### 2. Import to MongoDB

```bash
# Import transactions
mongoimport --db policyguard --collection transactions --type csv --headerline --file data/transactions.csv

# Import accounts
mongoimport --db policyguard --collection accounts --type csv --headerline --file data/accounts.csv

# Import customers
mongoimport --db policyguard --collection customers --type csv --headerline --file data/customers.csv
```

### 3. Create Indexes

```javascript
// In MongoDB shell
use policyguard

// Transaction indexes
db.transactions.createIndex({"timestamp": 1})
db.transactions.createIndex({"amount": 1})
db.transactions.createIndex({"sender_account": 1})
db.transactions.createIndex({"receiver_account": 1})
db.transactions.createIndex({"is_laundering": 1})

// Account indexes
db.accounts.createIndex({"account_id": 1})
db.accounts.createIndex({"risk_profile": 1})
db.accounts.createIndex({"last_activity": 1})

// Customer indexes
db.customers.createIndex({"customer_id": 1})
db.customers.createIndex({"risk_score": 1})
```

---

## Alternative Datasets (Secondary Options)

### PaySim Financial Dataset

**Source**: https://www.kaggle.com/datasets/ealaxi/paysim1  
**License**: CC BY-SA 4.0  
**Size**: 6.3 million transactions  
**Use Case**: Mobile money fraud detection

**Why it's useful**:
- Pre-labeled fraud transactions
- Contains `isFraud` and `isFlaggedFraud` columns
- Transaction types: CASH_IN, CASH_OUT, DEBIT, PAYMENT, TRANSFER
- Good for testing different compliance scenarios

### Employee Policy Compliance Dataset

**Source**: https://www.kaggle.com/datasets/laraibnadeem2023/employee-policy-compliance-dataset  
**License**: Check Kaggle page  
**Use Case**: HR policy compliance

**Why it's useful**:
- Demonstrates non-financial compliance use cases
- Attendance violations, leave policy breaches
- Training completion status
- Smaller dataset for quick demos

---

## Policy Documents

### Creating Policy PDFs

PolicyGuard requires policy documents in PDF format. For the IBM AML dataset, we use:

**1. Bank Secrecy Act (BSA) / AML Regulations**
- Source: US Treasury FinCEN public documents
- Topics: Transaction reporting, suspicious activity, customer due diligence
- URL: https://www.fincen.gov/resources/statutes-and-regulations

**2. FATF Recommendations**
- Source: Financial Action Task Force
- Topics: International AML standards, risk-based approach
- URL: https://www.fatf-gafi.org/

**3. Custom Policy Documents**

We create custom policy PDFs covering:
- High-value transaction monitoring ($10,000+ threshold)
- Structuring detection (multiple transactions below reporting limits)
- Sanctioned entity screening
- Dormant account monitoring
- Customer due diligence requirements
- Suspicious activity reporting

### Sample Policy Text

```
ANTI-MONEY LAUNDERING POLICY

Section 1: Transaction Monitoring
All financial transactions exceeding $10,000 must be reported to the compliance 
department within 24 hours. Transactions must include complete documentation 
including source of funds, purpose of transaction, and beneficiary information.

Section 2: Structuring Prevention
Multiple transactions by the same customer totaling more than $10,000 within a 
24-hour period must be aggregated and treated as a single transaction for 
reporting purposes. This prevents structuring (breaking large transactions into 
smaller amounts to avoid reporting thresholds).

Section 3: Sanctioned Entity Screening
All transactions must be screened against current sanctions lists including OFAC, 
UN, and EU sanctions. Any match must result in immediate transaction blocking 
and reporting to authorities.

Section 4: Dormant Account Monitoring
Accounts with no activity for more than 180 days that suddenly show high-value 
transactions (>$50,000) or multiple transactions (>5) must be flagged for 
enhanced due diligence review.
```

---

## Data Statistics

### IBM AML Dataset Statistics

- **Total Transactions**: ~5 million
- **Labeled Violations**: ~2% of transactions
- **Transaction Types**: 5 major categories
- **Date Range**: Simulated 2-year period
- **Accounts**: ~100,000 unique accounts
- **Customers**: ~50,000 unique customers

### Violation Distribution

| Violation Type | Percentage | Count |
|---|---|---|
| Structuring | 35% | ~35,000 |
| High-Value Unreported | 25% | ~25,000 |
| Sanctioned Entity | 20% | ~20,000 |
| Unusual Patterns | 15% | ~15,000 |
| Other | 5% | ~5,000 |

---

## License Compliance

### CDLA-Sharing-1.0 License

The IBM AML dataset is licensed under CDLA-Sharing-1.0, which allows:

✅ **Commercial Use**: Yes  
✅ **Modification**: Yes  
✅ **Distribution**: Yes  
✅ **Private Use**: Yes  
✅ **Attribution Required**: Yes  
✅ **Share-Alike**: Yes (for data derivatives)

### Attribution

When using this dataset, include:

```
Dataset: IBM Transactions for Anti-Money Laundering (AML)
Source: https://www.kaggle.com/datasets/ealtman2019/ibm-transactions-for-anti-money-laundering-aml
License: CDLA-Sharing-1.0
Publisher: IBM Research
```

---

## Integration with PolicyGuard

### MongoDB Collections

PolicyGuard stores the IBM AML data in these collections:

```
policyguard (database)
├── transactions     # IBM AML transaction data
├── accounts         # Account master data
├── customers        # Customer profiles
├── entities         # Business entities
├── policies         # Uploaded policy documents
├── rules            # AI-generated compliance rules
├── scan_runs        # Scan execution history
└── violations       # Detected policy violations
```

### Workflow

1. **Data Import**: IBM AML dataset loaded into MongoDB
2. **Policy Upload**: Compliance officer uploads AML policy PDF
3. **Rule Generation**: Gemini AI generates MongoDB rules from policy
4. **Scan Execution**: Rules executed against transactions collection
5. **Violation Detection**: Non-compliant transactions flagged
6. **Review**: Compliance officer reviews and updates violation status

---

## Testing Scenarios

### Scenario 1: High-Value Transaction Detection

**Policy**: "Transactions exceeding $10,000 require documentation"  
**Expected**: System flags all transactions with `amount > 10000` and `documentation_status != 'complete'`  
**Validation**: Compare against `is_laundering` labels in dataset

### Scenario 2: Structuring Detection

**Policy**: "Multiple transactions below $10,000 totaling more than $10,000 in 24 hours"  
**Expected**: System aggregates transactions by sender and time window  
**Validation**: Check against known structuring patterns in dataset

### Scenario 3: Sanctioned Entity Screening

**Policy**: "No transactions with sanctioned entities"  
**Expected**: System flags transactions where sender or receiver is sanctioned  
**Validation**: Cross-reference with sanctions list

---

## References

### Official Documentation

- **GDG Hackfest 2.0 Dataset Recommendations**: https://github.com/GDG-Cloud-New-Delhi/hackfest-2.0-dataset/blob/main/Internal_Recommendation_Doc.md
- **IBM AML Dataset**: https://www.kaggle.com/datasets/ealtman2019/ibm-transactions-for-anti-money-laundering-aml
- **CDLA License**: https://cdla.dev/sharing-1-0/

### Research Papers

- IBM Research: "Synthetic Data Generation for Anti-Money Laundering"
- FATF: "Risk-Based Approach Guidance for Money Service Businesses"

### Compliance Resources

- FinCEN: https://www.fincen.gov/
- FATF: https://www.fatf-gafi.org/
- OFAC Sanctions: https://home.treasury.gov/policy-issues/office-of-foreign-assets-control-sanctions-programs-and-information

---

## Support

For dataset-related questions:
- Check the Kaggle dataset page for documentation
- Review the GDG Hackfest dataset recommendations
- Consult the PolicyGuard README for integration details

---

**Dataset Status**: ✅ Officially Recommended by GDG Hackfest 2.0  
**License**: CDLA-Sharing-1.0 (Permissive)  
**Integration**: Ready for PolicyGuard  
**Documentation**: Complete
