module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  roots: ["<rootDir>"],
  moduleDirectories: ["node_modules", "<rootDir>"],
  testMatch: ["**/tests/**/*.test.ts", "**/tests/**/*.test.tsx"],
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
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"]
};