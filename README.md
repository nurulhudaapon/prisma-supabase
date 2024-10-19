# Prisma Supabase Generator

A Prisma generator that creates types for the @supabase/supabase-js or @supabase/postgrest-js client without the need for an online or dockerized database, resulting in faster generation times. This is particularly useful for projects that only use PostgREST.

## Installation

To use this generator, add it to your Prisma project. First, install the package:

```sh
# NPM
npm i -D prisma-supabase

# Yarn
yarn add -D prisma-supabase

# PNPM
pnpm add -D prisma-supabase

# Deno 2.x
deno add -D prisma-supabase

# Bun
bun add -D prisma-supabase
```

## Usage

1. Add the generator to your `schema.prisma` file:

```prisma
generator supabase {
  provider = "prisma-supabase"
  output   = "./database.ts" // Optional: Defaults to ./database.ts which would store in ./prisma/database.ts
  enableDocumentation = true // Optional: Defaults to true
}
```

2. Run Prisma generate to create the Supabase types:

```bash
npx prisma generate
```

This will generate a `database.ts` file (or whatever you specified in the `output` option) in your Prisma output directory (usually `prisma/`).

### Configuration Options

- `output`: Specifies the output file for the generated types. Defaults to `./prisma/database.ts`.
- `enableDocumentation`: Enables or disables the generation of JSDoc comments from Prisma schema comments. Defaults to `true`.

## Example

Here's an example of how to use the generated types with Supabase:

```typescript
import { createClient } from "@supabase/supabase-js";
import { Database } from "./prisma/database";

const supabase = createClient<Database>('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_ANON_KEY');

async function main() {
  // Query a single user
  const user = await supabase.from('User').select('*').limit(1).single();
  console.log(user.data?.role);

  // Query a user with related posts
  const userWithPosts = await supabase.from('User').select('*, Post(*)').limit(1).single();
  console.log(userWithPosts.data?.Post[0].authorId);
}
```

Or using PostgREST:

```typescript
import { PostgrestClient } from "@supabase/postgrest-js";
import { Database } from "./prisma/database";

const postgrest = new PostgrestClient<Database>('YOUR_POSTGREST_URL');

async function postgrestExample() {
  const user = await postgrest.from('User').select('*').limit(1).single();
  console.log(user.data?.role);

  const userWithPosts = await postgrest.from('User').select('*, Post(*)').limit(1).single();
  console.log(userWithPosts.data?.Post[0].authorId);
}
```

In these examples, the `Database` type is imported from the generated `database.ts` file, providing type safety for your Supabase or PostgREST queries based on your Prisma schema.

## Features

- [x] Table Types
- [x] Table Relationships
- [x] Enum Types
- [x] Composite Types
- [x] JSDoc from Prisma schema comments
- [ ] View Types (in progress)
- [ ] Multiple Schemas (in progress)
- [ ] Function Types (not supported by Prisma yet)

## Benefits

- Generate Supabase types from your Prisma schema without an online or dockerized database
- Useful for projects that only use PostgREST
- Faster type generation process
- Optional JSDoc comments for better code documentation

## Requirements

- Prisma 2.x or higher

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an Issue.

## License

This project is licensed under the MIT License.
