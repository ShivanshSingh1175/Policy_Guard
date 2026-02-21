"""
LLM service for generating MongoDB rules from policy text using Google Gemini API
"""
from typing import List, Optional
import json
import google.generativeai as genai

from app.config import settings
from app.models.rule import RuleIn, RuleSeverity


async def generate_rules_from_policy(
    policy_text: str,
    schema_hint: Optional[str] = None
) -> List[RuleIn]:
    """
    Use Google Gemini to generate MongoDB query rules from policy text
    
    Args:
        policy_text: Extracted text from policy document
        schema_hint: Optional hint about the MongoDB schema structure
        
    Returns:
        List of RuleIn objects ready to be stored
    """
    try:
        # Configure Gemini API
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-pro')
        
        # Build prompt
        prompt = build_rule_generation_prompt(policy_text, schema_hint)
        
        # Generate content
        response = model.generate_content(prompt)
        
        # Parse response
        rules_data = parse_gemini_response(response.text)
        
        # Convert to RuleIn objects
        rules = []
        for rule_data in rules_data:
            rule = RuleIn(
                policy_id="",  # Will be set by caller
                name=rule_data.get("name", "Generated Rule"),
                description=rule_data.get("description", ""),
                collection=rule_data.get("collection", "transactions"),
                query=rule_data.get("query", {}),
                severity=RuleSeverity(rule_data.get("severity", "MEDIUM")),
                enabled=rule_data.get("enabled", True),
                tags=rule_data.get("tags", [])
            )
            rules.append(rule)
        
        return rules
        
    except Exception as e:
        print(f"Error generating rules with Gemini: {str(e)}")
        # Fallback to sample rules if API fails
        return get_fallback_rules()


def build_rule_generation_prompt(policy_text: str, schema_hint: Optional[str]) -> str:
    """
    Build a detailed prompt for Gemini to generate MongoDB rules
    """
    schema_info = schema_hint or """
    MongoDB Collections:
    - transactions: {amount, sender, receiver, transaction_type, documentation_status, timestamp}
    - accounts: {account_id, balance, account_type, last_activity_days, risk_profile}
    - customers: {customer_id, name, kyc_status, risk_score}
    """
    
    prompt = f"""You are an expert in financial compliance and MongoDB query generation.

Given the following policy document, generate MongoDB query rules to detect violations.

POLICY DOCUMENT:
{policy_text}

DATABASE SCHEMA:
{schema_info}

INSTRUCTIONS:
1. Analyze the policy requirements
2. Generate 2-5 MongoDB query rules that detect violations
3. Each rule should have:
   - name: Clear, descriptive name
   - description: What the rule checks for
   - collection: Which MongoDB collection to query
   - query: Valid MongoDB query object (use $and, $or, $gt, $lt, $ne, etc.)
   - severity: LOW, MEDIUM, HIGH, or CRITICAL
   - tags: Relevant tags (e.g., "aml", "kyc", "sanctions")

OUTPUT FORMAT (JSON):
[
  {{
    "name": "Rule Name",
    "description": "What this rule detects",
    "collection": "transactions",
    "query": {{"field": {{"$operator": value}}}},
    "severity": "HIGH",
    "enabled": true,
    "tags": ["tag1", "tag2"]
  }}
]

Generate the rules now as valid JSON:"""
    
    return prompt


def parse_gemini_response(response_text: str) -> List[dict]:
    """
    Parse Gemini's response and extract rule definitions
    """
    try:
        # Try to find JSON in the response
        start_idx = response_text.find('[')
        end_idx = response_text.rfind(']') + 1
        
        if start_idx != -1 and end_idx > start_idx:
            json_str = response_text[start_idx:end_idx]
            rules = json.loads(json_str)
            return rules
        else:
            print("No JSON found in Gemini response")
            return []
            
    except json.JSONDecodeError as e:
        print(f"Error parsing Gemini response: {str(e)}")
        return []


def get_fallback_rules() -> List[RuleIn]:
    """
    Return fallback rules if Gemini API fails
    """
    return [
        RuleIn(
            policy_id="",
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


async def test_gemini_connection() -> bool:
    """
    Test connection to Gemini API
    
    Returns:
        True if connection successful, False otherwise
    """
    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content("Hello, respond with 'OK' if you can read this.")
        return "OK" in response.text or "ok" in response.text.lower()
    except Exception as e:
        print(f"Gemini connection test failed: {str(e)}")
        return False
