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
  // More verbose in CI for better debugging
  verbose: process.env.CI ? true : false,
  // Integration tests should fail fast if services aren't available
  bail: false,
  // Retry failed tests in CI (Jest 27+ feature)
  ...(process.env.CI && { 
    retryTimes: 1,
    retryDelay: 1000
  }),
  // Add global setup for integration tests
  globalSetup: "<rootDir>/tests/integration/global-setup.js",
  globalTeardown: "<rootDir>/tests/integration/global-teardown.js"
};