module.exports = {
  // Remove preset and use explicit transformer instead
  testEnvironment: "node", // Use Node.js environment for integration tests to avoid CORS issues
  rootDir: ".", // Use current working directory instead of __dirname
  roots: ["<rootDir>"],
  moduleDirectories: ["node_modules", "<rootDir>"],
  testMatch: ["**/tests/integration/**/*.test.ts", "**/tests/integration/**/*.test.tsx"],
  transform: {
    "^.+\\.tsx?$": [require.resolve("ts-jest"), { 
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
  // CI-specific configuration
  testTimeout: process.env.CI ? 90000 : 60000, // Longer timeout in CI (90s vs 60s)
  // Don't clear mocks between tests - integration tests may need persistent state
  clearMocks: false,
  restoreMocks: false,
  // Force verbose output in CI to see failed tests
  verbose: true,
  // Show individual test results
  reporters: process.env.CI ? [
    'default',
    ['jest-junit', { outputDirectory: 'test-results', outputName: 'junit.xml' }]
  ] : ['default'],
  // Integration tests should fail fast if services aren't available
  bail: false,
  // Force Jest to show all test results
  collectCoverage: false,
  // Add global setup for integration tests
  globalSetup: "<rootDir>/tests/integration/global-setup.js",
  globalTeardown: "<rootDir>/tests/integration/global-teardown.js"
};