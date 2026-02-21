# PolicyGuard Backend

FastAPI-based backend for PolicyGuard - an AI-powered policy compliance scanning system.

## Tech Stack

- **FastAPI** - Modern async web framework
- **Uvicorn** - ASGI server
- **MongoDB** (motor) - Async MongoDB driver
- **Pydantic** - Data validation
- **PyMuPDF** - PDF text extraction

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app and startup
│   ├── config.py            # Settings from environment
│   ├── db.py                # MongoDB connection
│   ├── models/              # Pydantic models
│   │   ├── policy.py
│   │   ├── rule.py
│   │   ├── scan.py
│   │   └── violation.py
│   ├── routes/              # API endpoints
│   │   ├── policies.py
│   │   ├── rules.py
│   │   ├── scans.py
│   │   └── violations.py
│   └── services/            # Business logic
│       ├── pdf_service.py
│       ├── llm_service.py
│       └── scan_service.py
├── .env.example
├── requirements.txt
└── README.md
```

## Setup

1. **Install dependencies**
```bash
pip install -r requirements.txt
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your MongoDB URI and LLM endpoint
```

3. **Start MongoDB**
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or use your existing MongoDB instance
```

4. **Run the server**
```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

Once running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API Endpoints

### Policies
- `POST /policies/upload` - Upload policy PDF
- `GET /policies` - List policies
- `GET /policies/{id}` - Get policy details
- `POST /policies/{id}/extract-rules` - Generate rules from policy
- `DELETE /policies/{id}` - Delete policy

### Rules
- `GET /rules` - List rules (filterable)
- `GET /rules/{id}` - Get rule details
- `POST /rules` - Create rule manually
- `PATCH /rules/{id}` - Update rule (toggle enabled, etc.)
- `DELETE /rules/{id}` - Delete rule

### Scans
- `POST /scans/run` - Execute compliance scan
- `GET /scans/runs` - List scan history
- `GET /scans/runs/{id}` - Get scan details
- `DELETE /scans/runs/{id}` - Delete scan run

### Violations
- `GET /violations` - List violations (filterable)
- `GET /violations/{id}` - Get violation details
- `PATCH /violations/{id}` - Update violation status
- `DELETE /violations/{id}` - Delete violation

## Database Collections

- `policies` - Policy documents and extracted text
- `rules` - MongoDB query rules generated from policies
- `scan_runs` - Scan execution history
- `violations` - Detected compliance violations
- `transactions` (example) - AML dataset to scan

## Development

The LLM service (`app/services/llm_service.py`) currently returns stub data. Implement actual LLM integration by:

1. Configuring your LLM endpoint in `.env`
2. Implementing the `call_llm_endpoint` function
3. Parsing LLM responses into `RuleIn` objects

## Testing

```bash
# Run with test data
python -m pytest

# Manual testing via Swagger UI
# Visit http://localhost:8000/docs
```

## Production Deployment

1. Set `APP_ENV=production` in `.env`
2. Configure proper CORS origins in `main.py`
3. Use production MongoDB instance
4. Run with production ASGI server:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```
