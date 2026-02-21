"""
Create a test PDF file for policy upload testing
"""
import fitz  # PyMuPDF

def create_test_pdf():
    """Create a simple PDF with AML policy text"""
    
    policy_text = """
ANTI-MONEY LAUNDERING POLICY
Version 1.0

1. LARGE CASH TRANSACTION REPORTING
All cash transactions exceeding $10,000 must be reported to FinCEN within 15 days.
Documentation must include transaction details, customer information, and purpose.

2. STRUCTURING DETECTION
Multiple transactions just below the $10,000 reporting threshold within a short time period
may indicate structuring or smurfing activities. These patterns must be flagged for review.

3. HIGH-RISK ACCOUNT MONITORING
Accounts classified as high-risk must undergo enhanced due diligence and continuous monitoring.
Any unusual activity must be investigated within 24 hours.

4. SANCTIONS SCREENING
All customers and transactions must be screened against OFAC sanctions lists and PEP databases
before account opening and on an ongoing basis.

5. CUSTOMER DUE DILIGENCE
Know Your Customer (KYC) procedures must be completed for all new accounts, including
identity verification, beneficial ownership identification, and risk assessment.
"""
    
    # Create a new PDF
    doc = fitz.open()
    page = doc.new_page()
    
    # Add text to the page
    rect = fitz.Rect(50, 50, 550, 750)
    page.insert_textbox(rect, policy_text, fontsize=11, fontname="helv")
    
    # Save the PDF
    output_path = "test_aml_policy.pdf"
    doc.save(output_path)
    doc.close()
    
    print(f"✓ Created test PDF: {output_path}")
    return output_path

if __name__ == "__main__":
    create_test_pdf()
