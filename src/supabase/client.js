import { createClient } from "@supabase/supabase-js";

const supabase_client = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default supabase_client;