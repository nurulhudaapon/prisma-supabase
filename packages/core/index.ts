import { DMMF } from "@prisma/generator-helper";

export function generateTypes(dmmf: DMMF.Document) {
  const { datamodel } = dmmf;

  const schemas = [
    {
      compositeTypes: datamodel.types,
      enums: datamodel.enums,
      functions: [],
      name: "public",
      tables: datamodel.models,
      views: [],
    },
  ];

  let output = `
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  ${schemas
    .sort(({ name: a }, { name: b }) => a.localeCompare(b))
    .map((schema) => {
      const schemaTables = [...schema.tables].sort(({ name: a }, { name: b }) =>
        a.localeCompare(b)
      );
      const schemaEnums = schema.enums
        .filter((type) => type.values.length > 0)
        .sort(({ name: a }, { name: b }) => a.localeCompare(b));
      const schemaCompositeTypes = schema.compositeTypes
        .filter((type) => type.fields.length > 0)
        .sort(({ name: a }, { name: b }) => a.localeCompare(b));

      return `${JSON.stringify(schema.name)}: {
          Tables: {
            ${
              schemaTables.length === 0
                ? "[_ in never]: never"
                : schemaTables.map(
                    (table) => `${JSON.stringify(table.name)}: {
                  Row: {
                    ${[
                      ...table.fields
                        .filter((field) => !field.relationName)
                        .map(
                          (column) =>
                            `${JSON.stringify(
                              column.name
                            )}: ${prismaTypeToTsType(column)} ${
                              !column.isRequired ? "| null" : ""
                            }`
                        ),
                    ]}
                  }
                  Insert: {
                    ${table.fields
                      .filter((field) => !field.relationName)
                      .map((column) => {
                        let output = JSON.stringify(column.name);

                        if (column.isGenerated) {
                          return `${output}?: never`;
                        }

                        if (
                          !column.isRequired ||
                          column.isId ||
                          column.default !== null
                        ) {
                          output += "?:";
                        } else {
                          output += ":";
                        }

                        output += prismaTypeToTsType(column);

                        return output;
                      })}
                  }
                  Update: {
                    ${table.fields
                      .filter((field) => !field.relationName)
                      .map((column) => {
                        let output = JSON.stringify(column.name);

                        if (column.isGenerated) {
                          return `${output}?: never`;
                        }

                        output += `?: ${prismaTypeToTsType(column)}`;

                        if (!column.isRequired) {
                          output += "| null";
                        }

                        return output;
                      })}
                  }
                  Relationships: [
                    ${table.fields
                      .filter((field) => field.relationName)
                      .sort(
                        (a, b) =>
                          a.name.localeCompare(b.name) ||
                          a.relationName!.localeCompare(b.relationName!)
                      )
                      .map(
                        (relationship) => `{
                              foreignKeyName: ${JSON.stringify(relationship.relationName)}
                              columns: ${JSON.stringify(relationship.relationToFields)}
                              ${
                                relationship.isList
                                  ? `isOneToOne: ${relationship.isList};`
                                  : ""
                              }referencedRelation: ${JSON.stringify(relationship.name)}
                              referencedColumns: ${JSON.stringify(relationship.relationFromFields)}
                            }`
                      )}
                  ]
                }`
                  )
            }
          }
          Views: {
            ${
              "/* No Support for Views */"
              //   schemaViews.length === 0
              //     ? '[_ in never]: never'
              //     : schemaViews.map(
              //         (view) => `${JSON.stringify(view.name)}: {
              //       Row: {
              //         ${columnsByTableId[view.id].map(
              //           (column) =>
              //             `${JSON.stringify(column.name)}: ${pgTypeToTsType(column.format, {
              //               types,
              //               schemas,
              //               tables,
              //               views,
              //             })} ${column.is_nullable ? '| null' : ''}`
              //         )}
              //       }
              //       ${
              //         'is_updatable' in view && view.is_updatable
              //           ? `Insert: {
              //                ${columnsByTableId[view.id].map((column) => {
              //                  let output = JSON.stringify(column.name)

              //                  if (!column.is_updatable) {
              //                    return `${output}?: never`
              //                  }

              //                  output += `?: ${pgTypeToTsType(column.format, { types, schemas, tables, views })} | null`

              //                  return output
              //                })}
              //              }
              //              Update: {
              //                ${columnsByTableId[view.id].map((column) => {
              //                  let output = JSON.stringify(column.name)

              //                  if (!column.is_updatable) {
              //                    return `${output}?: never`
              //                  }

              //                  output += `?: ${pgTypeToTsType(column.format, { types, schemas, tables, views })} | null`

              //                  return output
              //                })}
              //              }
              //             `
              //           : ''
              //       }Relationships: [
              //         ${relationships
              //           .filter(
              //             (relationship) =>
              //               relationship.schema === view.schema &&
              //               relationship.referenced_schema === view.schema &&
              //               relationship.relation === view.name
              //           )
              //           .sort(({ foreign_key_name: a }, { foreign_key_name: b }) =>
              //             a.localeCompare(b)
              //           )
              //           .map(
              //             (relationship) => `{
              //             foreignKeyName: ${JSON.stringify(relationship.foreign_key_name)}
              //             columns: ${JSON.stringify(relationship.columns)}
              //             ${
              //               detectOneToOneRelationships
              //                 ? `isOneToOne: ${relationship.is_one_to_one};`
              //                 : ''
              //             }referencedRelation: ${JSON.stringify(relationship.referenced_relation)}
              //             referencedColumns: ${JSON.stringify(relationship.referenced_columns)}
              //           }`
              //           )}
              //       ]
              //     }`
              //       )
            }
          }
          Functions: {
            ${"/* No Support for Functions */"}
          }
          Enums: {
            ${
              schemaEnums.length === 0
                ? "[_ in never]: never"
                : schemaEnums.map(
                    (enum_) =>
                      `${JSON.stringify(enum_.name)}: ${enum_.values
                        .map((variant) => JSON.stringify(variant.name))
                        .join("|")}`
                  )
            }
          }
          CompositeTypes: {
            ${
              schemaCompositeTypes.length === 0
                ? "[_ in never]: never"
                : schemaCompositeTypes.map(
                    ({ name, fields }) =>
                      `${JSON.stringify(name)}: {
                        ${fields.map(({ name, type }) => {
                          let tsType = "unknown";
                          if (type) {
                            tsType = `${prismaTypeToTsType(type)} | null`;
                          }
                          return `${JSON.stringify(name)}: ${tsType}`;
                        })}
                      }`
                  )
            }
          }
        }`;
    })}
}

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
    : never;
`;

  return output;
}

function prismaTypeToTsType(field: DMMF.Field) {
    if (field.kind === "scalar") {
      return PRISMA_TO_TS_TYPE[field.type as keyof typeof PRISMA_TO_TS_TYPE];
    }

    if (field.kind === "enum") {
      return `Database['public']['Enums']['${field.type}']`
    }
  
    return field.type;
  }

  
// BigInt, Boolean, Bytes, DateTime, Decimal, Float, Int, JSON, String
const PRISMA_TO_TS_TYPE = {
  BigInt: "number",
  Boolean: "boolean",
  Bytes: "string",
  DateTime: "Date",
  Decimal: "number",
  Float: "number",
  Int: "number",
  JSON: "JSON",
  String: "string",
} as const;
