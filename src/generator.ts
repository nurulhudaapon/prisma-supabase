import { generatorHandler } from "@prisma/generator-helper";
import * as fs from "fs/promises";
import { generateTypes } from "./core";

generatorHandler({
  onManifest() {
    return {
      defaultOutput: "./database.ts",
      prettyName: "Supabase Types",
    };
  },
  async onGenerate(options) {
    const types = generateTypes(options.dmmf);
    const writeLocation = options.generator.output?.value;

    if (!writeLocation) throw new Error("No output location provided");

    await fs.writeFile(writeLocation, types);
  },
});
