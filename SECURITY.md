# Security Policy

## Environment Variable Management

**IMPORTANT:** This application requires proper environment configuration:

### Required Credentials
1. **JWT_SECRET_KEY** - Generate a secure random secret (minimum 32 characters)
2. **GEMINI_API_KEY** - Obtain from Google AI Studio
3. **MONGO_URI** - MongoDB connection string (use MongoDB Atlas for production)
4. **Firebase Credentials** (Optional) - Only needed if using Firebase authentication

### Setup Instructions
1. Copy `.env.example` to `.env` in backend and frontend directories
2. Generate secure secrets:
   ```powershell
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```
3. Never commit `.env` files to source control
4. Use environment-specific configuration for production

## Reporting a Vulnerability

If you discover a security vulnerability, please report it privately to the repository maintainers.

Do NOT create public issues for security vulnerabilities.

## Security Architecture

### Authentication
- Argon2 password hashing (time_cost=2, memory_cost=102400)
- JWT token-based authentication
- Configurable token expiration (default: 24 hours)
- Email/password and optional Firebase authentication support

### Authorization
- Role-based access control (Admin, Manager, Investigator, Analyst)
- JWT token validation on protected endpoints
- User verification against database

### Tenant Isolation
- **Critical:** All data queries filter by `company_id`
- Company ID extracted from authenticated JWT token
- 35+ enforcement points across routes and services
- Verified through automated tests

### Database Security
- MongoDB with authentication required
- Tenant isolation enforced at query level
- Parameterized queries prevent NoSQL injection
- Indexes on company_id for performance and isolation

### Input Validation
- Pydantic schemas validate all request bodies
- File upload type and size validation (PDF, CSV)
- MongoDB ObjectId format validation
- Maximum file size: 10MB (configurable)
- Maximum rows: 100,000 per CSV import

### API Security
- CORS configured for allowed origins only
- Public endpoints: `/health`, `/`, `/docs`, `/openapi.json`
- All other endpoints require authentication
- Error messages sanitized (no sensitive data leakage)

### File Upload Security
- File type validation (MIME type checking)
- Content validation before processing
- Maximum size limits enforced
- Secure file storage

## Production Deployment Checklist

Before deploying to production:

- [ ] Generate and set secure `JWT_SECRET_KEY` (32+ characters)
- [ ] Obtain and set valid `GEMINI_API_KEY`
- [ ] Configure production MongoDB URI (MongoDB Atlas recommended)
- [ ] Set production `CORS_ORIGINS`
- [ ] Review and rotate any development credentials
- [ ] Enable HTTPS (required for production)
- [ ] Configure proper logging and monitoring
- [ ] Set appropriate rate limiting
- [ ] Review and test authentication flows
- [ ] Verify tenant isolation
- [ ] Run all automated tests
- [ ] Perform security audit

## Development Best Practices

- Never commit secrets or credentials
- Use `.env` files (already gitignored)
- Generate new secrets for each environment
- Rotate credentials regularly
- Keep dependencies updated
- Review security advisories
- Test authentication and authorization
- Verify tenant isolation in tests

## Audit and Monitoring

Production deployments should implement:
- Request logging with user context
- Authentication attempt tracking
- Failed authorization logging
- Data access audit trail
- Change tracking (who, what, when)
- Anomaly detection alerts
- Regular security reviews
