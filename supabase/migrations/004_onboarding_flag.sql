-- ============================================================
-- Transform Quest — Onboarding Flag Migration
-- Run this AFTER 003_phase2_social.sql
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
