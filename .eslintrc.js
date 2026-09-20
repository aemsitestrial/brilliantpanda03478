module.exports = {
  root: true,
  ignorePatterns: [
    "helix-importer-ui",
    "dompurify.min.js",
    "**/*.min.js",
    "blocks/form/rules/**",
    "blocks/form/rules-doc/**",
  ],
  extends: [
    "airbnb-base",
    "plugin:json/recommended",
    "plugin:xwalk/recommended",
  ],
  env: {
    browser: true,
  },
  parser: "@babel/eslint-parser",
  parserOptions: {
    allowImportExportEverywhere: true,
    sourceType: "module",
    requireConfigFile: false,
  },
  rules: {
    "import/extensions": ["error", { js: "always" }], // require js file extensions in imports
    "linebreak-style": ["error", "unix"], // enforce unix linebreaks
    "no-param-reassign": [2, { props: false }], // allow modifying properties of param
  },
};
