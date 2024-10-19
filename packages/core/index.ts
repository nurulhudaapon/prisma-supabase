import { DMMF } from "@prisma/generator-helper";

export function generateTypes(dmmf: DMMF.Document) {
  const { datamodel } = dmmf;
  const schemas = generateSchemas(datamodel);
  const output = generateOutput(schemas);
  return output;
}

function generateSchemas(datamodel: DMMF.Datamodel) {
  return [
    {
      compositeTypes: datamodel.types,
      enums: datamodel.enums.map(stringifyName),
      functions: [],
      name: "public",
      tables: datamodel.models.map(stringifyName),
      views: [],
    },
  ];
}

type Schema = ReturnType<typeof generateSchemas>[number];

function generateOutput(schemas: Schema[]) {
  return `
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
${schemas.sort((a, b) => a.name.localeCompare(b.name)).map(generateSchemaOutput).join('')}
}

${generateHelperTypes()}
`;
}

function generateSchemaOutput(schema: Schema) {
  const schemaTables = [...schema.tables].sort(alphaSort);
  const schemaEnums = schema.enums.filter((type) => type.values.length > 0).sort(alphaSort);
  const schemaCompositeTypes = schema.compositeTypes.filter((type: any) => type.fields.length > 0).sort(alphaSort);

  return `  ${schema.name}: {
    Tables: {
${generateTablesOutput(schemaTables)}
    }
    Views: {
      ${generateViewsOutput()}
    }
    Functions: {
      ${generateFunctionsOutput()}
    }
    Enums: {
${generateEnumsOutput(schemaEnums)}
    }
    CompositeTypes: {
${generateCompositeTypesOutput(schemaCompositeTypes)}
    }
  }`;
}

function generateTablesOutput(schemaTables: DMMF.Model[]) {
  return !schemaTables.length
    ? "      [_ in never]: never"
    : schemaTables.map((table) => `      ${table.name}: {
        Row: {
${generateTableRowOutput(table)}
        }
        Insert: {
${generateTableInsertOutput(table)}
        }
        Update: {
${generateTableUpdateOutput(table)}
        }
        Relationships: [
${generateTableRelationshipsOutput(table)}
        ]
      }`).join(';\n');
}

function generateTableRowOutput(table: DMMF.Model) {
  return table.fields
    .filter(filterField)
    .sort(alphaSort)
    .map((col: any) => `          ${col.name}: ${prismaTypeToTsType(col)}${col.isRequired ? "" : " | null"}`)
    .join(';\n');
}

function generateTableInsertOutput(table: DMMF.Model) {
  return table.fields
    .filter(filterField)
    .sort(alphaSort)
    .map((col: any) => {
      if (col.isGenerated) return `          ${col.name}?: never`;
      const type = `${prismaTypeToTsType(col)}${col.isRequired ? "" : " | null"}`;
      return (!col.isRequired || col.hasDefaultValue) ? `          ${col.name}?: ${type}` : `          ${col.name}: ${type}`;
    })
    .join(';\n');
}

function generateTableUpdateOutput(table: DMMF.Model) {
  return table.fields
    .filter(filterField)
    .sort(alphaSort)
    .map((col: any) => {
      if (col.isGenerated) return `          ${col.name}?: never`;
      return `          ${col.name}?: ${prismaTypeToTsType(col)}${!col.isRequired ? " | null" : ""}`;
    })
    .join(';\n');
}

function generateTableRelationshipsOutput(table: DMMF.Model) {
  return table.fields
    .filter((field) => field.relationName && field?.relationFromFields?.length && field?.relationToFields?.length)
    .sort(alphaSort)
    .map((relationship) => `          {
            foreignKeyName: "${relationship.relationName}";
            columns: ${JSON.stringify(relationship.relationFromFields)};
            isOneToOne: ${relationship.isList};
            referencedRelation: "${relationship.type}";
            referencedColumns: ${JSON.stringify(relationship.relationToFields)}
          }`)
    .join(',\n');
}

function generateViewsOutput() {
  return "/* No support for views */";
}

function generateFunctionsOutput() {
  return "/* No support for functions */";
}

function generateEnumsOutput(schemaEnums: DMMF.DatamodelEnum[]) {
  return !schemaEnums.length
    ? "      [_ in never]: never"
    : schemaEnums.map((enum_) => `      ${enum_.name}: ${enum_.values.map((variant: any) => `"${variant.name}"`).join(" | ")}`)
      .join('\n');
}

function generateCompositeTypesOutput(schemaCompositeTypes: DMMF.Model[]) {
  return !schemaCompositeTypes.length
    ? "      [_ in never]: never"
    : schemaCompositeTypes.map(({ name, fields }) => `      ${name}: {
${fields.map((field: any) => {
          const tsType = field.type ? `${prismaTypeToTsType(field)} | null` : "unknown";
          return `        ${field.name}: ${tsType}`;
        }).join(',\n')}
      }`)
    .join(',\n\n');
}

function generateHelperTypes() {
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

function prismaTypeToTsType(field: DMMF.Field) {
  if (field.kind === "scalar") {
    return PRISMA_TO_TS_TYPE[field.type as keyof typeof PRISMA_TO_TS_TYPE];
  }

  if (field.kind === "enum") {
    return `Database['public']['Enums']['${field.type}']`;
  }

  return field.type;
}

const PRISMA_TO_TS_TYPE = {
  BigInt: "number",
  Boolean: "boolean",
  Bytes: "string",
  DateTime: "string",
  Decimal: "number",
  Float: "number",
  Int: "number",
  Json: "Json",
  String: "string",
} as const;

function alphaSort(a: { name: string }, b: { name: string }) {
  return a.name.localeCompare(b.name);
}

function filterField(field: DMMF.Field) {
  return !field.relationName;
}

function stringifyName<T extends { name: string }>(entity: T): T {
  const isValidJsKey = entity.name.match(/^[a-zA-Z_$][a-zA-Z_$0-9]*$/);
  if (isValidJsKey) return entity;

  return {
    ...entity,
    name: JSON.stringify(entity.name),
  };
}
