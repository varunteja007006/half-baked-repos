import { defineConfig } from "eslint/config";

import { baseConfig } from "@fleetio/eslint-config/base";
import { reactConfig } from "@fleetio/eslint-config/react";

export default defineConfig(
  {
    ignores: [".expo/**", "expo-plugins/**"],
  },
  baseConfig,
  reactConfig,
);
