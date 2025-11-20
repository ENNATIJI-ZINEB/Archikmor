-- ARCHIKMOR Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor to create the required tables

-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    project TEXT,
    message TEXT NOT NULL,
    received_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email for contact_submissions
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);

-- Create index on received_at for sorting/filtering
CREATE INDEX IF NOT EXISTS idx_contact_submissions_received_at ON contact_submissions(received_at DESC);

-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    email TEXT NOT NULL UNIQUE,
    subscribed_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email for newsletter_subscribers (already indexed via UNIQUE constraint, but explicit index for performance)
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);

-- Create index on subscribed_at for sorting/filtering
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_subscribed_at ON newsletter_subscribers(subscribed_at DESC);

-- Enable Row Level Security (RLS) - adjust policies based on your needs
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Create policies to allow service role to insert/select (needed for backend)
-- Note: Service role key bypasses RLS, but these policies are good practice
CREATE POLICY "Service role can insert contact submissions"
    ON contact_submissions FOR INSERT
    TO service_role
    WITH CHECK (true);

CREATE POLICY "Service role can select contact submissions"
    ON contact_submissions FOR SELECT
    TO service_role
    USING (true);

CREATE POLICY "Service role can insert newsletter subscribers"
    ON newsletter_subscribers FOR INSERT
    TO service_role
    WITH CHECK (true);

CREATE POLICY "Service role can select newsletter subscribers"
    ON newsletter_subscribers FOR SELECT
    TO service_role
    USING (true);

