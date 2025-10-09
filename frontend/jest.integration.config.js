module.exports = {
  preset: "ts-jest",
  testEnvironment: "node", // Use Node.js environment for integration tests to avoid CORS issues
  rootDir: ".", // Use current working directory instead of __dirname
  roots: ["<rootDir>"],
  moduleDirectories: ["node_modules", "<rootDir>"],
  testMatch: ["**/tests/integration/**/*.test.ts", "**/tests/integration/**/*.test.tsx"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { 
      tsconfig: "tsconfig.json",
      jsx: "react-jsx"
    }]
  },
  moduleNameMapper: {
    // Handle module aliases - match tsconfig.json paths
    "^@/(.*)$": "<rootDir>/$1"
  },
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.next/"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  // Integration tests need longer timeouts for HTTP calls
  testTimeout: 60000, // Increased from 30s to 60s
  // Don't clear mocks between tests - integration tests may need persistent state
  clearMocks: false,
  restoreMocks: false,
  // Less verbose for integration tests (they make real HTTP calls)
  verbose: false,
  // Integration tests should fail fast if services aren't available
  bail: false,
  // Add global setup for integration tests
  globalSetup: "<rootDir>/tests/integration/global-setup.js",
  globalTeardown: "<rootDir>/tests/integration/global-teardown.js"
};