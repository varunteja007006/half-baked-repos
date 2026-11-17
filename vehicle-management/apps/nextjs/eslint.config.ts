import { defineConfig } from "eslint/config";

import { baseConfig, restrictEnvAccess } from "@fleetio/eslint-config/base";
import { nextjsConfig } from "@fleetio/eslint-config/nextjs";
import { reactConfig } from "@fleetio/eslint-config/react";

export default defineConfig(
  {
    ignores: [".next/**"],
  },
  baseConfig,
  reactConfig,
  nextjsConfig,
  restrictEnvAccess,
);
