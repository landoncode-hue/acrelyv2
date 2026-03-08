
-- Verify Seeded Users
SELECT id, email, role, last_sign_in_at FROM auth.users WHERE email LIKE '%@pinnaclegroups.ng';

-- Verify Profiles
SELECT id, email, full_name, role, is_staff, created_at, updated_at FROM public.profiles WHERE email LIKE '%@pinnaclegroups.ng';
