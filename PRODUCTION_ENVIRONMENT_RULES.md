# ===============================
# 🚨 CRITICAL: Production Environment Rules
# ===============================

# --- Environment Configuration ---
- **NEVER use mock/test data in production environments**
- **ALWAYS use real API keys and services when available**
- **Environment files (.env) must contain real credentials, not placeholders**
- **Mock mode should ONLY be used for unit tests, never for integration or production**

# --- Agent Service Configuration ---
- **Agent service MUST have valid OPENAI_API_KEY in .env file**
- **Mock responses are ONLY acceptable in unit tests**
- **Integration tests MUST use real services when available**
- **Production deployments MUST use real API keys**

# --- Development Workflow ---
- **Before starting development: Verify all .env files have real credentials**
- **Before testing: Confirm services are using real APIs, not mocks**
- **Before deployment: Validate all environment variables are production-ready**
- **Never commit .env files, but ensure .env.example files are accurate**

# --- Validation Checks ---
- **Agent service health check should verify API connectivity**
- **Integration tests should fail if services are in mock mode**
- **CI/CD pipeline should validate environment configuration**
- **Development setup scripts should guide users to configure real credentials**

# --- Error Prevention ---
- **If OPENAI_API_KEY is missing or 'test-key', show clear error message**
- **Log warnings when services fall back to mock mode**
- **Add environment validation to startup scripts**
- **Include real API key setup in README and setup instructions**

# --- Code Quality ---
- **Mock responses should be clearly marked and only used in tests**
- **Production code paths should never use mock data**
- **Environment validation should happen at startup**
- **Clear error messages when configuration is missing**

# --- Documentation ---
- **README should clearly explain how to set up real API keys**
- **Setup scripts should guide users through real configuration**
- **Environment examples should be accurate and complete**
- **Troubleshooting guides should address mock vs real service issues**
