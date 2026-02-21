# Contributing to PolicyGuard

Thank you for your interest in contributing to PolicyGuard! This project was built for **GDG Hackfest 2.0**, and we welcome contributions from the community.

## 🚀 Getting Started

1. **Fork the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Policy_Guard.git
   cd Policy_Guard
   ```

2. **Set up your development environment**
   - Follow the [Quick Start guide](README.md#-quick-start) in the main README
   - Ensure all tests pass before making changes

3. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 📝 Development Guidelines

### Code Style

**Python (Backend)**
- Follow PEP 8 style guide
- Use type hints where possible
- Add docstrings to functions and classes
- Keep functions focused and small

**TypeScript/React (Frontend)**
- Use TypeScript for all new code
- Follow React best practices and hooks patterns
- Use Material-UI components consistently
- Keep components small and reusable

### Commit Messages

Use clear, descriptive commit messages:
```
feat: Add risk score calculation for accounts
fix: Resolve violation status update bug
docs: Update API documentation
refactor: Simplify scan execution logic
```

### Testing

- Write tests for new features
- Ensure existing tests pass
- Test multi-tenant isolation thoroughly
- Verify JWT authentication works correctly

## 🐛 Reporting Bugs

When reporting bugs, please include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Python/Node version)
- Screenshots if applicable

## 💡 Feature Requests

We love new ideas! When suggesting features:
- Explain the use case
- Describe the expected behavior
- Consider multi-tenant implications
- Think about audit trail requirements

## 🔄 Pull Request Process

1. **Update documentation** if you're changing functionality
2. **Add tests** for new features
3. **Ensure all tests pass** locally
4. **Update the README** if needed
5. **Submit your PR** with a clear description

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] Multi-tenant isolation maintained
- [ ] No breaking changes (or clearly documented)
- [ ] Commit messages are clear

## 🎯 Priority Areas

We're especially interested in contributions for:

1. **ML/AI Features**
   - Anomaly detection algorithms
   - Advanced RAG implementations
   - Pattern recognition for violations

2. **Integrations**
   - Additional alert channels (Teams, Discord)
   - SSO providers (SAML, OAuth)
   - Data source connectors

3. **UI/UX Improvements**
   - Mobile responsiveness
   - Accessibility enhancements
   - Data visualization improvements

4. **Performance**
   - Query optimization
   - Caching strategies
   - Real-time streaming

## 📚 Resources

- [Main README](README.md) - Project overview and setup
- [API Documentation](http://localhost:8000/docs) - FastAPI interactive docs
- [Architecture Overview](README.md#-architecture) - System design

## 🤝 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow

## 📧 Questions?

If you have questions about contributing:
- Open an issue with the `question` label
- Check existing issues and discussions
- Review the main README documentation

## 🏆 Recognition

Contributors will be recognized in:
- GitHub contributors list
- Project documentation
- Release notes

Thank you for helping make PolicyGuard better! 🛡️
