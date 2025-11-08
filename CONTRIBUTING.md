# Contributing to ig-transcribe

Thank you for considering contributing to ig-transcribe!

## How to Contribute

### Reporting Bugs

1. Check [existing issues](https://github.com/yourusername/ig-transcribe/issues) first
2. Create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - System information (OS, Node version, etc.)
   - Error logs

### Suggesting Features

1. Check [existing feature requests](https://github.com/yourusername/ig-transcribe/issues?q=label%3Aenhancement)
2. Create a new issue with:
   - Clear use case
   - Expected behavior
   - Possible implementation approach

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit with clear messages (`git commit -m 'Add amazing feature'`)
6. Push to your fork (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/yourusername/ig-transcribe.git
cd ig-transcribe

# Install dependencies
npm install

# Setup environment
npm run setup

# Run tests
npm test
```

## Code Style

- Use ES6+ features
- Follow existing code structure
- Add JSDoc comments for functions
- Keep functions focused and small
- Handle errors gracefully

## Testing

Before submitting:

```bash
# Test single video processing
node index.js "https://www.instagram.com/p/test/"

# Test batch processing
echo "https://www.instagram.com/p/test/" > test.txt
node examples/batch-process.js test.txt

# Test Notion export
node index.js "URL" --notion --ai --summarize
```

## Documentation

- Update relevant docs in `/docs` if needed
- Add examples for new features
- Update README.md if adding major features

## Commit Messages

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move file" not "Moves file")
- Reference issues/PRs when applicable
- Keep first line under 50 characters

Examples:
```
Add Notion CSV export format
Fix URL validation for profile-based URLs
Update documentation for batch processing
```

## Questions?

- Open a [Discussion](https://github.com/yourusername/ig-transcribe/discussions)
- Ask in issues with `question` label

Thank you for contributing! 🎉
