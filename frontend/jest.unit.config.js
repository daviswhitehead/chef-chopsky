module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  roots: ["<rootDir>"],
  moduleDirectories: ["node_modules", "<rootDir>"],
  testMatch: ["**/tests/unit/**/*.test.ts", "**/tests/unit/**/*.test.tsx"],
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
  // Unit tests should be fast and isolated
  testTimeout: 5000,
  // Clear mocks between tests for isolation
  clearMocks: true,
  restoreMocks: true,
  // Verbose output for unit tests
  verbose: true
};
