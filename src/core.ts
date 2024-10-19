import { DMMF, type GeneratorOptions } from '@prisma/generator-helper';

/**
 * The generator config
 */
type GeneratorConfig = {
  /** Whether to include documentation in the generated types */
  enableDocumentation?: 'true' | 'false';
};

const defaultGeneratorConfig: GeneratorConfig = {
  enableDocumentation: 'true',
};

/**
 * Generates TypeScript types based on the Prisma DMMF document.
 * @param dmmf The Prisma DMMF document
 * @returns A string containing the generated TypeScript types
 */
export function generateTypes(dmmf: DMMF.Document, options?: GeneratorOptions): string {
  const { datamodel } = dmmf;
  const generatorConfig = (options?.generator?.config || {}) as GeneratorConfig;
  const schemas = createSchemaObjects(datamodel, { ...defaultGeneratorConfig, ...generatorConfig });
  return generateTypeDefinitions(schemas, generatorConfig);
}

/**
 * Creates schema objects from the Prisma datamodel.
 * @param datamodel The Prisma datamodel
 * @returns An array of schema objects
 */
function createSchemaObjects(datamodel: DMMF.Datamodel, generatorConfig: GeneratorConfig) {
  return [
    {
      compositeTypes: datamodel.types,
      enums: datamodel.enums.map(stringifyName),
      functions: [],
      name: 'public',
      tables: datamodel.models.map(stringifyName),
      views: [],
    },
  ];
}

type SchemaObject = ReturnType<typeof createSchemaObjects>[number];

/**
 * Generates the full TypeScript type definitions.
 * @param schemas An array of schema objects
 * @returns A string containing the generated TypeScript types
 */
function generateTypeDefinitions(schemas: SchemaObject[], generatorConfig: GeneratorConfig): string {
  const sortedSchemas = schemas.sort((a, b) => a.name.localeCompare(b.name));

  return `
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
${sortedSchemas.map((schema) => generateSchemaDefinition(schema, generatorConfig)).join('')}
}

${generateHelperTypes()}
`;
}

/**
 * Generates the TypeScript definition for a single schema.
 * @param schema The schema object
 * @returns A string containing the schema definition
 */
function generateSchemaDefinition(schema: SchemaObject, generatorConfig: GeneratorConfig): string {
  const schemaTables = [...schema.tables].sort(alphaSort);
  const schemaEnums = schema.enums.filter((type) => type.values.length > 0).sort(alphaSort);
  const schemaCompositeTypes = schema.compositeTypes.filter((type) => type.fields.length > 0).sort(alphaSort);

  return `
  ${schema.name}: {
    Tables: {
      ${generateTablesDefinition(schemaTables, generatorConfig)}
    }
    Views: {
      ${generateViewsDefinition()}
    }
    Functions: {
      ${generateFunctionsDefinition()}
    }
    Enums: {
      ${generateEnumsDefinition(schemaEnums, generatorConfig)}
    }
    CompositeTypes: {
      ${generateCompositeTypesDefinition(schemaCompositeTypes, generatorConfig)}
    }
  }`;
}

/**
 * Generates the TypeScript definition for tables.
 * @param schemaTables An array of DMMF Model objects representing tables
 * @returns A string containing the tables definition
 */
function generateTablesDefinition(schemaTables: DMMF.Model[], generatorConfig: GeneratorConfig): string {
  if (!schemaTables.length) return '[_ in never]: never';

  return schemaTables
    .map(
      (table) => `
      ${renderDoc(table.documentation, generatorConfig)}${table.name}: {
        Row: {
          ${generateTableRowDefinition(table, generatorConfig)}
        }
        Insert: {
          ${generateTableInsertDefinition(table, generatorConfig)}
        }
        Update: {
          ${generateTableUpdateDefinition(table, generatorConfig)}
        }
        Relationships: [
          ${generateTableRelationshipsDefinition(table, generatorConfig)}
        ]
      }`
    )
    .join(';\n');
}

/**
 * Generates the TypeScript definition for a table's row.
 * @param table The DMMF Model object representing a table
 * @returns A string containing the row definition
 */
function generateTableRowDefinition(table: DMMF.Model, generatorConfig: GeneratorConfig): string {
  return table.fields
    .filter(filterField)
    .sort(alphaSort)
    .map((col) => {
      const type = `${prismaTypeToTsType(col)}${col.isRequired ? '' : ' | null'}`;
      const typeDeclaration = `${col.name}: ${type}`;
      return renderDoc(col.documentation, generatorConfig) + typeDeclaration;
    })
    .join('\n');
}

/**
 * Generates the TypeScript definition for a table's insert operation.
 * @param table The DMMF Model object representing a table
 * @returns A string containing the insert definition
 */
function generateTableInsertDefinition(table: DMMF.Model, generatorConfig: GeneratorConfig): string {
  return table.fields
    .filter(filterField)
    .sort(alphaSort)
    .map((col) => {
      const type = `${prismaTypeToTsType(col)}${col.isRequired ? '' : ' | null'}`;
      const isOptional = !col.isRequired || col.hasDefaultValue;
      const fieldName = `${col.name}${isOptional ? '?' : ''}`;

      if (col.isGenerated) return `${fieldName}: never`;

      const typeDeclaration = `${fieldName}: ${type}`;
      return renderDoc(col.documentation, generatorConfig) + typeDeclaration;
    })
    .join('\n');
}

/**
 * Generates the TypeScript definition for a table's update operation.
 * @param table The DMMF Model object representing a table
 * @returns A string containing the update definition
 */
function generateTableUpdateDefinition(table: DMMF.Model, generatorConfig: GeneratorConfig): string {
  return table.fields
    .filter(filterField)
    .sort(alphaSort)
    .map((col) => {
      if (col.isGenerated) return `${col.name}?: never`;

      const type = `${prismaTypeToTsType(col)}${!col.isRequired ? ' | null' : ''}`;
      const typeDeclaration = ` ${col.name}?: ${type}`;
      return renderDoc(col.documentation, generatorConfig) + typeDeclaration;
    })
    .join('\n');
}

/**
 * Generates the TypeScript definition for a table's relationships.
 * @param table The DMMF Model object representing a table
 * @returns A string containing the relationships definition
 */
function generateTableRelationshipsDefinition(table: DMMF.Model, generatorConfig: GeneratorConfig): string {
  return table.fields
    .filter((field) => field.relationName && field?.relationFromFields?.length && field?.relationToFields?.length)
    .sort(alphaSort)
    .map((relationship) => {
      const relationshipDeclaration = `
          {
            foreignKeyName: "${relationship.relationName}"
            columns: ${JSON.stringify(relationship.relationFromFields)}
            isOneToOne: ${relationship.isList}
            referencedRelation: "${relationship.type}"
            referencedColumns: ${JSON.stringify(relationship.relationToFields)}
          }`;
      return relationshipDeclaration;
    })
    .join(',\n');
}

/**
 * Generates the TypeScript definition for views (currently not supported).
 * @returns A string indicating that views are not supported
 */
function generateViewsDefinition(): string {
  return '/* No support for views */';
}

/**
 * Generates the TypeScript definition for functions (currently not supported).
 * @returns A string indicating that functions are not supported
 */
function generateFunctionsDefinition(): string {
  return '/* No support for functions */';
}

/**
 * Generates the TypeScript definition for enums.
 * @param schemaEnums An array of DMMF DatamodelEnum objects
 * @returns A string containing the enums definition
 */
function generateEnumsDefinition(schemaEnums: DMMF.DatamodelEnum[], generatorConfig: GeneratorConfig): string {
  if (!schemaEnums.length) return '[_ in never]: never';

  return schemaEnums
    .map((enm) => {
      const enumRootDoc = renderDoc(enm.documentation, generatorConfig, { noEndingStar: true });
      const enumMemberDocs = renderDoc(
        enm.values
              // @ts-expect-error: documentation is not typed
          .filter((member) => !!member?.documentation?.trim())
          .map(
            (member) =>
              // @ts-expect-error: documentation is not typed
              `\n@member **${member.name}**: ${member.documentation?.split('\n').join(' ')}`
          ),
        generatorConfig,
        {
          noStartingStar: !!enm.documentation,
        }
      );

      // @ts-expect-error: documentation is not typed
      const hasMemberDocs = enm.values.some((member) => !!member?.documentation?.trim());

      const finalEnumDoc = `${enumRootDoc}${hasMemberDocs ? enumMemberDocs : ''}`;

      return `${finalEnumDoc}${enm.name}: ${enm.values.map((member) => `"${member.name}"`).join(' | ')}`;
    })
    .join('\n');
}

/**
 * Generates the TypeScript definition for composite types.
 * @param schemaCompositeTypes An array of DMMF Model objects representing composite types
 * @returns A string containing the composite types definition
 */
function generateCompositeTypesDefinition(
  schemaCompositeTypes: DMMF.Model[],
  generatorConfig: GeneratorConfig
): string {
  if (!schemaCompositeTypes.length) return '[_ in never]: never';

  return schemaCompositeTypes
    .map(
      ({ name, fields, documentation }) => `
      ${renderDoc(documentation, generatorConfig)}${name}: {
        ${fields
          .map((field) => {
            const tsType = field.type ? `${prismaTypeToTsType(field)} | null` : 'unknown';
            return `${renderDoc(field.documentation, generatorConfig)}${field.name}: ${tsType}`;
          })
          .join(',\n')}
      }`
    )
    .join(',\n\n');
}

/**
 * Generates helper types for the generated TypeScript definitions.
 * @returns A string containing the helper types
 */
function generateHelperTypes(): string {
  return `
type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    ? (PublicSchema["Tables"] & PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes']
    ? PublicSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never
`;
}

/**
 * Converts a Prisma type to its corresponding TypeScript type.
 * @param field The DMMF Field object
 * @returns The corresponding TypeScript type as a string
 */
function prismaTypeToTsType(field: DMMF.Field): string {
  if (field.kind === 'scalar') {
    return PRISMA_TO_TS_TYPE[field.type as keyof typeof PRISMA_TO_TS_TYPE];
  }

  if (field.kind === 'enum') {
    return `Database['public']['Enums']['${field.type}']`;
  }

  return field.type;
}

const PRISMA_TO_TS_TYPE = {
  BigInt: 'number',
  Boolean: 'boolean',
  Bytes: 'string',
  DateTime: 'string',
  Decimal: 'number',
  Float: 'number',
  Int: 'number',
  Json: 'Json',
  String: 'string',
} as const;

/**
 * Sorts two objects alphabetically by their 'name' property.
 * @param a The first object
 * @param b The second object
 * @returns A number indicating the sort order
 */
function alphaSort(a: { name: string }, b: { name: string }): number {
  return a.name.localeCompare(b.name);
}

/**
 * Filters out fields that have a relation name.
 * @param field The DMMF Field object to filter
 * @returns A boolean indicating whether the field should be included
 */
function filterField(field: DMMF.Field): boolean {
  return !field.relationName;
}

/**
 * Stringifies the name of an entity if it's not a valid JavaScript identifier.
 * @param entity An object with a 'name' property
 * @returns The entity with a potentially stringified name
 */
function stringifyName<T extends { name: string }>(entity: T): T {
  const isValidJsKey = entity.name.match(/^[a-zA-Z_$][a-zA-Z_$0-9]*$/);
  if (isValidJsKey) return entity;

  return {
    ...entity,
    name: JSON.stringify(entity.name),
  };
}

/**
 * Renders a documentation string as a multi-line JSDoc comment.
 * @param doc The documentation string to render
 * @returns A formatted multi-line JSDoc comment
 */
function renderDoc(
  doc: string | null | undefined | string[],
  generatorConfig: GeneratorConfig,
  options?: {
    noEndingStar?: boolean;
    noStartingStar?: boolean;
  }
): string {
  if (!doc || generatorConfig.enableDocumentation === 'false') return '';
  const lines = Array.isArray(doc) ? doc.map((line) => line.trim()) : doc.split('\n').map((line) => line.trim());

  if (lines.length === 1) return `/** ${lines[0]} */\n`;

  const startLine = options?.noStartingStar ? '' : '/**';
  const contentLines = lines.map((line) => ` * ${line}`);
  const endLine = options?.noEndingStar ? '' : ' */';

  return [startLine, ...contentLines, endLine, ''].filter(Boolean).join('\n') + '\n';
}
