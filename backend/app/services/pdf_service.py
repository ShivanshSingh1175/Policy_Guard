"""
PDF text extraction service using PyMuPDF
"""
import pymupdf


def extract_text_from_pdf(file_content: bytes) -> str:
    """
    Extract text content from a PDF file
    
    Args:
        file_content: Raw bytes of the PDF file
        
    Returns:
        Extracted text as a string
        
    Raises:
        Exception: If PDF processing fails
    """
    try:
        # Open PDF from bytes
        doc = pymupdf.open(stream=file_content, filetype="pdf")
        
        # Extract text from all pages
        text_parts = []
        for page_num in range(len(doc)):
            page = doc[page_num]
            text_parts.append(page.get_text())
        
        doc.close()
        
        # Combine all pages
        full_text = "\n\n".join(text_parts)
        
        return full_text.strip()
        
    except Exception as e:
        raise Exception(f"PDF text extraction failed: {str(e)}")
