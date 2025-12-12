module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
    jest: true,
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    // 完全宽松的配置，不报错
    "no-unused-vars": "off",
    "no-console": "off",
    "no-case-declarations": "off",
    semi: "off",
    indent: "off",
    quotes: "off",
    "no-unused-expressions": "off",
    "no-undef": "off",
  },
};
