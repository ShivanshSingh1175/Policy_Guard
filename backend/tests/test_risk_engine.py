"""
Tests for hybrid risk scoring engine
"""
import pytest
from app.services.hybrid_risk_engine import HybridRiskEngine


def test_rule_score_calculation():
    """Test rule severity to score conversion"""
    rule_critical = {"severity": "CRITICAL"}
    rule_high = {"severity": "HIGH"}
    rule_medium = {"severity": "MEDIUM"}
    rule_low = {"severity": "LOW"}
    
    assert HybridRiskEngine.calculate_rule_score(rule_critical) == 100
    assert HybridRiskEngine.calculate_rule_score(rule_high) == 75
    assert HybridRiskEngine.calculate_rule_score(rule_medium) == 50
    assert HybridRiskEngine.calculate_rule_score(rule_low) == 25
    assert HybridRiskEngine.calculate_rule_score(None) == 0


def test_risk_level_determination():
    """Test risk score to risk level mapping"""
    assert HybridRiskEngine.determine_risk_level(90) == "CRITICAL"
    assert HybridRiskEngine.determine_risk_level(80) == "CRITICAL"
    assert HybridRiskEngine.determine_risk_level(70) == "HIGH"
    assert HybridRiskEngine.determine_risk_level(60) == "HIGH"
    assert HybridRiskEngine.determine_risk_level(50) == "MEDIUM"
    assert HybridRiskEngine.determine_risk_level(40) == "MEDIUM"
    assert HybridRiskEngine.determine_risk_level(30) == "LOW"
    assert HybridRiskEngine.determine_risk_level(10) == "LOW"


def test_score_combination():
    """Test hybrid score calculation"""
    # Test maximum strategy
    combined = HybridRiskEngine.combine_scores(50, 30)
    assert combined == 50
    
    combined = HybridRiskEngine.combine_scores(30, 70)
    assert combined == 70
    
    # Test bonus for both high
    combined = HybridRiskEngine.combine_scores(70, 65)
    assert combined >= 70  # Should get bonus


def test_hybrid_risk_calculation():
    """Test complete hybrid risk assessment"""
    rule = {
        "_id": "test_rule",
        "name": "Test Rule",
        "severity": "HIGH"
    }
    
    ml_result = {
        "success": True,
        "risk_score": 60.0,
        "prediction": "SUSPICIOUS",
        "reasons": ["High velocity", "New beneficiary"],
        "model_version": "v1"
    }
    
    hybrid_risk = HybridRiskEngine.calculate_hybrid_risk(
        rule=rule,
        ml_result=ml_result
    )
    
    assert "risk_score" in hybrid_risk
    assert "risk_level" in hybrid_risk
    assert "rule_score" in hybrid_risk
    assert "ml_score" in hybrid_risk
    assert "detection_sources" in hybrid_risk
    assert "reasons" in hybrid_risk
    
    assert hybrid_risk["risk_score"] >= 60
    assert "RULE_ENGINE" in hybrid_risk["detection_sources"]
    assert "ML_ANOMALY" in hybrid_risk["detection_sources"]


def test_ml_only_detection():
    """Test risk calculation with ML but no rule"""
    ml_result = {
        "success": True,
        "risk_score": 85.0,
        "prediction": "CRITICAL",
        "reasons": ["Extreme deviation"],
        "model_version": "v1"
    }
    
    hybrid_risk = HybridRiskEngine.calculate_hybrid_risk(
        rule=None,
        ml_result=ml_result
    )
    
    assert hybrid_risk["ml_score"] == 85.0
    assert hybrid_risk["rule_score"] == 0.0
    assert hybrid_risk["risk_level"] == "CRITICAL"
    assert "ML_ANOMALY" in hybrid_risk["detection_sources"]
    assert "RULE_ENGINE" not in hybrid_risk["detection_sources"]


def test_rule_only_detection():
    """Test risk calculation with rule but no ML"""
    rule = {
        "_id": "test_rule",
        "name": "Test Rule",
        "severity": "CRITICAL"
    }
    
    hybrid_risk = HybridRiskEngine.calculate_hybrid_risk(
        rule=rule,
        ml_result=None
    )
    
    assert hybrid_risk["rule_score"] == 100
    assert hybrid_risk["ml_score"] == 0.0
    assert hybrid_risk["risk_level"] == "CRITICAL"
    assert "RULE_ENGINE" in hybrid_risk["detection_sources"]
    assert "ML_ANOMALY" not in hybrid_risk["detection_sources"]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
