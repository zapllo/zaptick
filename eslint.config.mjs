import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // 🔻 Custom overrides
  {
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',         // disables unused import/var errors
      '@typescript-eslint/no-explicit-any': 'off',        // allows usage of `any`
      'quotes': ['off'],                                  // disables quote style warnings (single/double)
      'prefer-const': 'off',                              // optionally disable const suggestions
    },
  },
];

export default eslintConfig;
