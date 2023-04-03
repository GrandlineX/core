export default {
  testRegex: "(/tests/*.test.ts|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  coverageReporters: ["html", "text", "text-summary", "cobertura", "lcov"],
  collectCoverageFrom: ["**/*.ts", "!**/node_modules/**","!tests/**","!./src/dev/**"],
  testPathIgnorePatterns: ["/dist/", "/node_modules/"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  setupFilesAfterEnv: ["./jest.pre.config.js"],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
};
