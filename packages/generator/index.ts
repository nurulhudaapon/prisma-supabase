import { generatorHandler } from '@prisma/generator-helper';
import * as fs from 'fs';
import * as path from 'path';
import { generateTypes } from '@prisma-generator-supabase/core';

generatorHandler({
  onManifest() {
    return {
      defaultOutput: './supabase.ts',
      prettyName: 'Prisma Supabase Generator',
    };
  },
  async onGenerate(options) {
    const types = generateTypes(options.dmmf);
    fs.writeFileSync(
      path.join(__dirname, 'supabase.ts'),
      types
    );
  },
});