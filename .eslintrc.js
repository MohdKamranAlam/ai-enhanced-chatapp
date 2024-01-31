module.exports = {
    "env": {
        "es2021": true,
        "node": true
    },
    "extends": [
        "eslint:recommended"
    ],
    "parserOptions": {
        "ecmaVersion": 12,
        "sourceType": "module"
    },
    "globals": {
        "getBigQueryData": "readonly" // This line declares getBigQueryData as a global variable that should not be reassigned
    },
    "rules": {
        "no-unused-vars": "warn",
        "no-console": "off"
    }
};
