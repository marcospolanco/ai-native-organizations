import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  // Default to jsdom for React components, override per project
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  projects: [
    {
      displayName: "api",
      testMatch: ["<rootDir>/app/api/**/__tests__/**/*.test.ts"],
      testEnvironment: "node",
      transform: {
        "^.+\\.(ts|tsx)$": [
          "ts-jest",
          {
            tsconfig: "<rootDir>/tsconfig.test.json",
          },
        ],
      },
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
        "^@ai-sdk/rsc$": "<rootDir>/jest/mocks/ai-sdk-rsc.ts",
        "^@ai-sdk/openai$": "<rootDir>/jest/mocks/ai-sdk-openai.ts",
        "^ai$": "<rootDir>/jest/mocks/ai.ts",
      },
    },
    {
      displayName: "server-actions",
      testMatch: ["<rootDir>/app/actions/**/__tests__/**/*.test.ts"],
      testEnvironment: "node",
      transform: {
        "^.+\\.(ts|tsx)$": [
          "ts-jest",
          {
            tsconfig: "<rootDir>/tsconfig.test.json",
          },
        ],
      },
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
        "^@ai-sdk/rsc$": "<rootDir>/jest/mocks/ai-sdk-rsc.ts",
        "^@ai-sdk/openai$": "<rootDir>/jest/mocks/ai-sdk-openai.ts",
        "^ai$": "<rootDir>/jest/mocks/ai.ts",
      },
    },
    {
      displayName: "components",
      testMatch: [
        "<rootDir>/app/__tests__/**/*.test.ts?(x)",
        "<rootDir>/components/**/__tests__/**/*.test.ts?(x)",
      ],
      testEnvironment: "jsdom",
      transform: {
        "^.+\\.(ts|tsx)$": [
          "ts-jest",
          {
            tsconfig: "<rootDir>/tsconfig.test.json",
          },
        ],
      },
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
        "\\.(css|less|scss|sass)$": "identity-obj-proxy",
        "^@ai-sdk/rsc$": "<rootDir>/jest/mocks/ai-sdk-rsc.ts",
        "^@ai-sdk/openai$": "<rootDir>/jest/mocks/ai-sdk-openai.ts",
        "^ai$": "<rootDir>/jest/mocks/ai.ts",
      },
    },
    {
      displayName: "hooks",
      testMatch: ["<rootDir>/hooks/**/__tests__/**/*.test.ts?(x)"],
      testEnvironment: "jsdom",
      transform: {
        "^.+\\.(ts|tsx)$": [
          "ts-jest",
          {
            tsconfig: "<rootDir>/tsconfig.test.json",
          },
        ],
      },
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
        "\\.(css|less|scss|sass)$": "identity-obj-proxy",
        "^@ai-sdk/rsc$": "<rootDir>/jest/mocks/ai-sdk-rsc.ts",
        "^@ai-sdk/openai$": "<rootDir>/jest/mocks/ai-sdk-openai.ts",
        "^ai$": "<rootDir>/jest/mocks/ai.ts",
      },
    },
    {
      displayName: "lib",
      testMatch: ["<rootDir>/lib/**/__tests__/**/*.test.ts"],
      testEnvironment: "jsdom",
      transform: {
        "^.+\\.(ts|tsx)$": [
          "ts-jest",
          {
            tsconfig: "<rootDir>/tsconfig.test.json",
          },
        ],
      },
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
        "\\.(css|less|scss|sass)$": "identity-obj-proxy",
      },
    },
  ],
  collectCoverageFrom: [
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "lib/**/*.{ts,tsx}",
    "hooks/**/*.{ts,tsx}",
    "!app/**/__tests__/**",
    "!components/**/__tests__/**",
    "!hooks/**/__tests__/**",
    "!**/*.d.ts",
  ],
};

export default config;
