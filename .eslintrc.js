module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true,
  },
  extends: ["standard", "prettier"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: "./tsconfig.json",
  },
  plugins: ["@typescript-eslint"],
  rules: {
    "no-useless-constructor": "off",
    "@typescript-eslint/restrict-plus-operands": [
      "error",
      {
        allowNumberAndString: false,
      },
    ],
  },
  overrides: [
    {
      files: ["*.js"],
      parserOptions: { project: null },
    },
  ],
};
