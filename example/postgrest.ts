import { PostgrestClient } from "@supabase/postgrest-js";
import { type Database } from "./prisma/database";

// PostgREST Example
const postgrest = new PostgrestClient<Database>('');

async function postgrestExample() {
  const user = await postgrest.from('User').select('*').limit(1).single();
  console.log(user.data?.role);

  const userWithPosts = await postgrest.from('User').select('*, Post(*)').limit(1).single();
  console.log(userWithPosts.data?.Post[0].authorId);
}
