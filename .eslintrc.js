module.exports = {
    root: true,
    env: {
        "node": true,
        "browser": true,
    },
    "extends": [
        "plugin:vue/essential",
        "eslint:recommended",
        "@vue/typescript",
    ],
    rules: {
        "no-console": "off",
        "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
        "indent": ["error", 4],
        "max-len": ["warn", { "code": 120 }],
        "object-curly-spacing": ["error", "always"],
        "quotes": ["error", "double"],
        "space-before-function-paren": ["error", "never"],
        "no-inner-declarations": "off",
        "brace-style": ["error", "1tbs"],
        "keyword-spacing": "error",
        "no-case-declarations": "off",
        "no-async-promise-executor": "off",
    },
    parserOptions: {
        "parser": "@typescript-eslint/parser",
        "ecmaVersion": 6,
    },
};
