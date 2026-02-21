"""
Test endpoint for LLM integration
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.llm_service import test_gemini_connection, generate_rules_from_policy

router = APIRouter()


class TestLLMRequest(BaseModel):
    policy_text: str
    schema_hint: str | None = None


@router.get("/test-connection")
async def test_llm_connection():
    """
    Test connection to Gemini API
    """
    try:
        result = await test_gemini_connection()
        if result["status"]:
            return {
                "status": "success",
                "message": result["message"],
                "model": "gemini-pro"
            }
        else:
            return {
                "status": "error",
                "message": result["message"]
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Connection test failed: {str(e)}")


@router.post("/test-generation")
async def test_rule_generation(request: TestLLMRequest):
    """
    Test rule generation with sample policy text
    """
    try:
        rules = await generate_rules_from_policy(
            policy_text=request.policy_text,
            schema_hint=request.schema_hint
        )
        
        return {
            "status": "success",
            "rules_generated": len(rules),
            "rules": [
                {
                    "name": rule.name,
                    "description": rule.description,
                    "collection": rule.collection,
                    "severity": rule.severity,
                    "query": rule.query
                }
                for rule in rules
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Rule generation failed: {str(e)}")
