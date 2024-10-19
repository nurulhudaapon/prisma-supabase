import { createClient } from "@supabase/supabase-js";
import { type Database } from "./prisma/database";

// Supabase Example
const supabase = createClient<Database>('', '');

supabase.from('User').select('*').limit(1).single().then((res) => {
  console.log(res.data?.id);
});

supabase.from('User').select('*, Post(*)').limit(1).single().then((res) => {
  console.log(res.data?.Post[0].content);
});
