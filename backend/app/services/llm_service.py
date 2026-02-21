"""
LLM service for generating MongoDB rules from policy text
"""
from typing import List, Optional
import httpx

from app.config import settings
from app.models.rule import RuleIn, RuleSeverity


async def generate_rules_from_policy(
    policy_text: str,
    schema_hint: Optional[str] = None
) -> List[RuleIn]:
    """
    Use LLM to generate MongoDB query rules from policy text
    
    Args:
        policy_text: Extracted text from policy document
        schema_hint: Optional hint about the MongoDB schema structure
        
    Returns:
        List of RuleIn objects ready to be stored
        
    Note:
        This is a stubbed implementation. In production, this would:
        1. Send policy_text to LLM endpoint
        2. Include schema_hint in the prompt
        3. Parse LLM response into structured rules
        4. Validate generated MongoDB queries
    """
    # TODO: Implement actual LLM integration
    # For now, return sample rules for testing
    
    sample_rules = [
        RuleIn(
            policy_id="",  # Will be set by caller
            name="High-Risk Transaction Detection",
            description="Identifies transactions exceeding $10,000 without proper documentation",
            collection="transactions",
            query={
                "$and": [
                    {"amount": {"$gt": 10000}},
                    {"documentation_status": {"$ne": "complete"}}
                ]
            },
            severity=RuleSeverity.HIGH,
            enabled=True,
            tags=["aml", "high-value", "documentation"]
        ),
        RuleIn(
            policy_id="",
            name="Sanctioned Entity Check",
            description="Flags transactions involving entities on sanctions lists",
            collection="transactions",
            query={
                "$or": [
                    {"sender.sanctioned": True},
                    {"receiver.sanctioned": True}
                ]
            },
            severity=RuleSeverity.CRITICAL,
            enabled=True,
            tags=["sanctions", "compliance", "aml"]
        )
    ]
    
    return sample_rules


async def call_llm_endpoint(prompt: str) -> dict:
    """
    Make HTTP request to LLM endpoint
    
    Args:
        prompt: The prompt to send to the LLM
        
    Returns:
        LLM response as dictionary
    """
    headers = {}
    if settings.LLM_API_KEY:
        headers["Authorization"] = f"Bearer {settings.LLM_API_KEY}"
    
    payload = {
        "model": settings.LLM_MODEL,
        "prompt": prompt,
        "temperature": settings.LLM_TEMPERATURE
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            settings.LLM_ENDPOINT,
            json=payload,
            headers=headers,
            timeout=60.0
        )
        response.raise_for_status()
        return response.json()
