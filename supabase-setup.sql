-- ============================================
-- BlessSoul Website Waitlist Table Setup
-- ============================================
-- Run this SQL in your Supabase SQL Editor

-- Create the waitlist table
CREATE TABLE IF NOT EXISTS public.waitlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source TEXT DEFAULT 'website',
    user_agent TEXT,
    ip_address TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist(email);

-- Create index on subscribed_at for sorting
CREATE INDEX IF NOT EXISTS idx_waitlist_subscribed_at ON public.waitlist(subscribed_at DESC);

-- Add comment to table
COMMENT ON TABLE public.waitlist IS 'Stores email addresses from the BlessSoul website waitlist form';

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on the waitlist table
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to INSERT (add their email)
CREATE POLICY "Allow public to insert waitlist emails"
ON public.waitlist
FOR INSERT
TO anon
WITH CHECK (true);

-- Policy: Prevent public from reading emails (privacy)
-- Only authenticated users (you) can read
CREATE POLICY "Only authenticated users can read waitlist"
ON public.waitlist
FOR SELECT
TO authenticated
USING (true);

-- Policy: Prevent public from updating or deleting
-- Only authenticated users can update/delete
CREATE POLICY "Only authenticated users can update waitlist"
ON public.waitlist
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Only authenticated users can delete waitlist"
ON public.waitlist
FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- Helper Functions (Optional)
-- ============================================

-- Function to get waitlist count
CREATE OR REPLACE FUNCTION get_waitlist_count()
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT COUNT(*)::INTEGER FROM public.waitlist;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_waitlist_count() TO authenticated;

-- ============================================
-- Usage Examples (for reference)
-- ============================================

-- View all waitlist emails (run as authenticated user)
-- SELECT email, subscribed_at FROM public.waitlist ORDER BY subscribed_at DESC;

-- Get waitlist count
-- SELECT get_waitlist_count();

-- Export emails for email marketing service
-- SELECT email FROM public.waitlist ORDER BY subscribed_at DESC;

-- Check for duplicate email before allowing someone to re-subscribe
-- SELECT EXISTS(SELECT 1 FROM public.waitlist WHERE email = 'test@example.com');

-- ============================================
-- Testing (Optional - remove before production)
-- ============================================

-- Insert a test email (this will work from the website)
-- INSERT INTO public.waitlist (email, source) VALUES ('test@example.com', 'website');

-- View the test email (requires authentication)
-- SELECT * FROM public.waitlist WHERE email = 'test@example.com';

-- Clean up test data
-- DELETE FROM public.waitlist WHERE email = 'test@example.com';
