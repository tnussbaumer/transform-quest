-- ============================================================
-- Transform Quest — Profiles Public Read
-- Allow authenticated users to read any profile row.
-- Required for: invite code lookup, friend streaks display,
-- friend activity feed, and any future social features.
-- Run this AFTER 004_onboarding_flag.sql
-- ============================================================

CREATE POLICY "profiles_select_authenticated"
  ON public.profiles
  FOR SELECT
  USING (auth.role() = 'authenticated');
