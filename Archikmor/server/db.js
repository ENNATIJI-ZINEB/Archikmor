require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

let supabase = null;

// Initialize Supabase client if credentials are available
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
    supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_KEY,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    );
} else {
    console.warn('⚠️  Supabase credentials not found. Database operations will fail.');
    console.warn('   Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in your .env file');
}

function getSupabaseClient() {
    if (!supabase) {
        throw new Error('Supabase client not initialized. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in your .env file');
    }
    return supabase;
}

module.exports = {
    getSupabaseClient,
};

