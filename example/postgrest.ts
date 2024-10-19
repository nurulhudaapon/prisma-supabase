import { PostgrestClient } from "@supabase/postgrest-js";
import { type Database } from "./prisma/database";

// PostgREST Example
const postgrest = new PostgrestClient<Database>('');

postgrest.from('User').select('*').limit(1).single().then((res) => {
  console.log(res.data?.id);
});

postgrest.from('User').select('*, Post(*)').limit(1).single().then((res) => {
  console.log(res.data?.Post[0].content);
});
