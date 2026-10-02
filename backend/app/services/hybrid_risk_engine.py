"""
Hybrid Risk Engine - combines policy rules, ML predictions, and AML patterns
"""
from typing import Dict, Any, List, Optional


class HybridRiskEngine:
    """Combine rule-based and ML-based risk assessment"""
    
    # Risk level thresholds
    RISK_THRESHOLDS = {
        'CRITICAL': 80,
        'HIGH': 60,
        'MEDIUM': 40,
        'LOW': 0
    }
    
    # Severity weights
    SEVERITY_WEIGHTS = {
        'CRITICAL': 100,
        'HIGH': 75,
        'MEDIUM': 50,
        'LOW': 25
    }
    
    @staticmethod
    def calculate_rule_score(
        rule: Optional[Dict[str, Any]],
        pattern_matches: Optional[List[str]] = None
    ) -> float:
        """Calculate score from rule violations"""
        if not rule and not pattern_matches:
            return 0.0
        
        max_score = 0.0
        
        # Rule severity
        if rule:
            severity = rule.get('severity', 'MEDIUM')
            rule_score = HybridRiskEngine.SEVERITY_WEIGHTS.get(severity, 50)
            max_score = max(max_score, rule_score)
        
        # Pattern matches
        if pattern_matches:
            # Multiple patterns increase score
            pattern_boost = min(len(pattern_matches) * 10, 30)
            max_score = min(max_score + pattern_boost, 100)
        
        return max_score
    
    @staticmethod
    def combine_scores(
        rule_score: float,
        ml_score: float,
        strategy: str = 'weighted_max'
    ) -> float:
        """Combine rule and ML scores"""
        
        if strategy == 'weighted_max':
            # Take maximum but boost if both are high
            combined = max(rule_score, ml_score)
            
            # Both high? Add bonus
            if rule_score >= 60 and ml_score >= 60:
                combined = min(combined + 15, 100)
            
            return combined
        
        elif strategy == 'weighted_average':
            # Weighted average favoring higher score
            return 0.6 * max(rule_score, ml_score) + 0.4 * min(rule_score, ml_score)
        
        else:
            # Simple average
            return (rule_score + ml_score) / 2
    
    @staticmethod
    def determine_risk_level(risk_score: float) -> str:
        """Map risk score to risk level"""
        if risk_score >= HybridRiskEngine.RISK_THRESHOLDS['CRITICAL']:
            return 'CRITICAL'
        elif risk_score >= HybridRiskEngine.RISK_THRESHOLDS['HIGH']:
            return 'HIGH'
        elif risk_score >= HybridRiskEngine.RISK_THRESHOLDS['MEDIUM']:
            return 'MEDIUM'
        else:
            return 'LOW'
    
    @staticmethod
    def generate_explanation(
        rule: Optional[Dict[str, Any]],
        ml_result: Optional[Dict[str, Any]],
        pattern_matches: Optional[List[str]] = None,
        risk_score: float = 0.0,
        risk_level: str = 'LOW'
    ) -> Dict[str, Any]:
        """Generate human-readable explanation"""
        
        reasons = []
        detection_sources = []
        triggered_rules = []
        
        # Rule evidence
        if rule:
            detection_sources.append('RULE_ENGINE')
            triggered_rules.append({
                'rule_id': str(rule.get('_id', '')),
                'rule_name': rule.get('name', 'Unknown'),
                'severity': rule.get('severity', 'MEDIUM')
            })
            reasons.append(f"Policy rule triggered: {rule.get('name', 'Unknown')}")
        
        # Pattern evidence
        if pattern_matches:
            detection_sources.append('AML_PATTERN')
            for pattern in pattern_matches:
                reasons.append(f"AML pattern detected: {pattern}")
        
        # ML evidence
        if ml_result and ml_result.get('success'):
            if ml_result.get('risk_score', 0) >= 40:
                detection_sources.append('ML_ANOMALY')
                reasons.append(f"ML anomaly score: {ml_result.get('risk_score', 0):.1f}")
                
                ml_reasons = ml_result.get('reasons', [])
                reasons.extend(ml_reasons)
        
        return {
            'risk_score': risk_score,
            'risk_level': risk_level,
            'detection_sources': list(set(detection_sources)),
            'triggered_rules': triggered_rules,
            'reasons': reasons,
            'ml_prediction': ml_result.get('prediction') if ml_result else None,
            'ml_score': ml_result.get('risk_score') if ml_result else None,
            'model_version': ml_result.get('model_version') if ml_result else None
        }
    
    @staticmethod
    def calculate_hybrid_risk(
        rule: Optional[Dict[str, Any]] = None,
        ml_result: Optional[Dict[str, Any]] = None,
        pattern_matches: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Calculate comprehensive risk assessment
        
        Args:
            rule: Matched policy rule
            ml_result: ML prediction result
            pattern_matches: List of matched AML patterns
        
        Returns:
            Hybrid risk assessment with score, level, and explanation
        """
        
        # Calculate component scores
        rule_score = HybridRiskEngine.calculate_rule_score(rule, pattern_matches)
        ml_score = ml_result.get('risk_score', 0.0) if ml_result and ml_result.get('success') else 0.0
        
        # Combine scores
        combined_score = HybridRiskEngine.combine_scores(rule_score, ml_score)
        
        # Determine risk level
        risk_level = HybridRiskEngine.determine_risk_level(combined_score)
        
        explanation_dict = HybridRiskEngine.generate_explanation(
            rule=rule,
            ml_result=ml_result,
            pattern_matches=pattern_matches,
            risk_score=combined_score,
            risk_level=risk_level
        )
        
        # Remove ml_score from explanation to avoid overwriting
        explanation_ml_score = explanation_dict.pop('ml_score', None)
        
        return {
            'risk_score': combined_score,
            'risk_level': risk_level,
            'rule_score': rule_score,
            'ml_score': ml_score if ml_score is not None else 0.0,
            **explanation_dict
        }
