# ML Model - Policy Rule Generator

This folder contains the machine learning model and notebooks for PolicyGuard's AI-powered rule generation system.

## Overview

The ML model is responsible for:
- Analyzing policy document text
- Understanding compliance requirements
- Generating executable MongoDB query rules
- Mapping policy language to database operations

## Files

- `policy_rule_generator.ipynb` - Main Jupyter notebook for rule generation model
- `requirements.txt` - Python dependencies for ML model (to be added)
- `models/` - Trained model weights (to be added)
- `data/` - Sample training data (to be added)

## Model Architecture

The rule generation system uses:
- **LLM Integration**: Large Language Model (GPT-4, Claude, or similar) for natural language understanding
- **Prompt Engineering**: Carefully crafted prompts to extract structured rules from policy text
- **Schema Mapping**: MongoDB schema understanding to generate valid queries
- **Validation**: Rule syntax validation and testing

## Usage

### Training/Fine-tuning (Future)

```python
# Load policy documents
policies = load_policies("data/policies/")

# Fine-tune model on policy-to-rule pairs
model = train_rule_generator(policies, rules)

# Save model
model.save("models/rule_generator_v1.pkl")
```

### Inference

```python
from policy_rule_generator import generate_rules

# Load policy text
policy_text = extract_text_from_pdf("policy.pdf")

# Generate rules
rules = generate_rules(
    policy_text=policy_text,
    schema_hint="transactions collection with amount, sender, receiver fields",
    model="gpt-4"
)

# Output: List of MongoDB query rules
```

## Integration with Backend

The ML model is integrated into the backend via `backend/app/services/llm_service.py`:

```python
from ml_model.policy_rule_generator import generate_rules

async def generate_rules_from_policy(policy_text: str, schema_hint: str):
    rules = generate_rules(policy_text, schema_hint)
    return [RuleIn(**rule) for rule in rules]
```

## Development

### Setup

```bash
cd ml_model

# Create virtual environment
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install dependencies
pip install jupyter pandas numpy scikit-learn transformers openai anthropic
```

### Run Notebook

```bash
jupyter notebook policy_rule_generator.ipynb
```

## Model Performance

### Metrics (To be measured)
- Rule accuracy: % of generated rules that correctly identify violations
- Precision: % of flagged violations that are true positives
- Recall: % of actual violations that are detected
- F1 Score: Harmonic mean of precision and recall

### Evaluation Dataset
- Sample policies from financial regulations (AML, KYC, sanctions)
- IBM AML dataset for testing generated rules
- Manual validation by compliance experts

## Future Enhancements

- [ ] Fine-tune model on domain-specific policy documents
- [ ] Add rule optimization (simplify complex queries)
- [ ] Implement rule versioning and A/B testing
- [ ] Add explainability (why this rule was generated)
- [ ] Support for multiple languages
- [ ] Incremental learning from user feedback

## Dependencies

```
jupyter>=1.0.0
pandas>=2.0.0
numpy>=1.24.0
scikit-learn>=1.3.0
transformers>=4.30.0
openai>=1.0.0
anthropic>=0.3.0
pymongo>=4.5.0
```

## References

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Anthropic Claude API](https://docs.anthropic.com)
- [MongoDB Query Language](https://docs.mongodb.com/manual/tutorial/query-documents/)
- [AML Compliance Best Practices](https://www.fatf-gafi.org/)

## License

MIT License - See LICENSE file in root directory

---

**Note**: This is a research and development component. The model is currently in development and uses external LLM APIs for rule generation.
