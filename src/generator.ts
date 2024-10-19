import { generatorHandler } from "@prisma/generator-helper";
import * as fs from "fs/promises";
import { generateTypes } from "./core";
import * as prettier from "prettier";
const packageJson = require("../package.json");

generatorHandler({
  onManifest() {
    return {
      defaultOutput: "./database.ts",
      version: packageJson.version,
      prettyName: "Supabase Types",
    };
  },
  async onGenerate(options) {
    const types = generateTypes(options.dmmf, options);
    const writeLocation = options.generator.output?.value;

    if (!writeLocation) throw new Error("No output location provided");

    const prettierConfig = await tryLoadPrettierConfig(writeLocation);

    const formattedTypes = await prettier.format(types, {
      ...prettierConfig,
      parser: "typescript",
    });

    await fs.writeFile(writeLocation, formattedTypes);
  },
});

/** A prettier config that generates compact output */
const defaultPrettierConfig: prettier.Options = {
  printWidth: 120,
  tabWidth: 2,
  semi: false,
  singleQuote: true,
  trailingComma: "none",
  bracketSpacing: false,
  arrowParens: "avoid",
};

async function tryLoadPrettierConfig(path: string) {
  try {
    const config = await prettier.resolveConfig(path);
    if (config) return config;
    return defaultPrettierConfig;
  } catch (e) {
    return defaultPrettierConfig;
  }
}
