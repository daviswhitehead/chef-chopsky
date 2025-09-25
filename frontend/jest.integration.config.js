module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom", // Changed from "node" to "jsdom" for React components
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
  bail: false
};