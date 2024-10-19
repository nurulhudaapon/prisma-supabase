import { createClient } from "@supabase/supabase-js";
import { Database } from "./prisma/database";

// Supabase Example
const supabase = createClient<Database>('', '');

async function supabaseExample() {
  const user = await supabase.from('User').select('*').limit(1).single();
  console.log(user.data?.role);

  const userWithPosts = await supabase.from('User').select('*, Post(*)').limit(1).single();
  console.log(userWithPosts.data?.Post[0].authorId);
}
