const SUPABASE_URL = "https://bextbpljkchmagzhilgc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_xsEQfacMla_ELSClPCVhDQ_e368buoP";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL, 
    SUPABASE_PUBLISHABLE_KEY
);
