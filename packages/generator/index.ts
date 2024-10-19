import { generatorHandler } from '@prisma/generator-helper';
import * as fs from 'fs';
import * as path from 'path';

generatorHandler({
  onManifest() {
    return {
      defaultOutput: './docs',
      prettyName: 'Prisma Supabase Generator',
    };
  },
  async onGenerate(options) {
    console.log('Generating...', options);
  },
});