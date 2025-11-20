# Supabase Setup Guide

This guide explains how to set up Supabase database for the ARCHIKMOR backend.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. A Supabase project created

## Setup Steps

### 1. Create Tables in Supabase

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Open and run the SQL script from `supabase-schema.sql`
   - This will create the `contact_submissions` and `newsletter_subscribers` tables
   - It will also set up indexes and Row Level Security policies

Alternatively, you can copy the SQL from `supabase-schema.sql` and paste it into the SQL Editor.

### 2. Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (this is your `SUPABASE_URL`)
   - **service_role** key (this is your `SUPABASE_SERVICE_KEY`)
     - ⚠️ **Important**: Use the `service_role` key, not the `anon` key
     - The service role key bypasses Row Level Security, which is needed for backend operations

### 3. Configure Environment Variables

1. Create a `.env` file in the project root (if it doesn't exist)
2. Add the following variables:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here
```

Replace the placeholder values with your actual Supabase credentials.

### 4. Install Dependencies

The Supabase client library is already included in `package.json`. Run:

```bash
npm install
```

### 5. (Optional) Migrate Existing Data

If you have existing data in the JSON files (`data/contact-submissions.json` and `data/newsletter-subscribers.json`), you can migrate it to Supabase:

```bash
node server/migrate-to-supabase.js
```

This script will:
- Read existing data from JSON files
- Insert it into Supabase tables
- Skip duplicates automatically
- Provide a migration summary

**Note**: Make sure your Supabase tables are created and your `.env` file is configured before running the migration script.

## Verification

1. Start your server:
   ```bash
   npm run dev
   ```

2. Check the console output. You should see:
   ```
   📋 Environment Configuration:
      ...
      SUPABASE_URL: ✓ Set
      SUPABASE_SERVICE_KEY: ✓ Set
   ```

3. Test the endpoints:
   - Submit a contact form at `/api/contact`
   - Subscribe to newsletter at `/api/newsletter`
   - Check your Supabase dashboard → Table Editor to verify data is being stored

## Troubleshooting

### Error: "Supabase client not initialized"

- Make sure your `.env` file exists in the project root
- Verify that `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are set correctly
- Restart your server after updating `.env`

### Error: "relation does not exist"

- Run the SQL schema script in Supabase SQL Editor
- Verify tables are created in your Supabase dashboard → Table Editor

### Error: "new row violates row-level security policy"

- Make sure you're using the `service_role` key, not the `anon` key
- Verify RLS policies are set up correctly (see `supabase-schema.sql`)

### Data not appearing in Supabase

- Check server logs for database errors
- Verify you're looking at the correct Supabase project
- Check Row Level Security policies in Supabase dashboard

## Database Schema

### contact_submissions
- `id` (UUID, Primary Key)
- `name` (TEXT, Required)
- `email` (TEXT, Required)
- `project` (TEXT, Optional)
- `message` (TEXT, Required)
- `received_at` (TIMESTAMPTZ, Required)
- `created_at` (TIMESTAMPTZ, Auto-generated)

### newsletter_subscribers
- `id` (UUID, Primary Key)
- `name` (TEXT, Optional)
- `email` (TEXT, Required, Unique)
- `subscribed_at` (TIMESTAMPTZ, Required)
- `created_at` (TIMESTAMPTZ, Auto-generated)

## Support

For issues related to Supabase setup, refer to:
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)

