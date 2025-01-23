/*
  # Create Admin User

  1. Changes
    - Insert admin user with email '6570' and password '6570'

  2. Security
    - Admin user has full access to all data
    - Maintains existing RLS policies
*/

INSERT INTO users (
  email,
  first_name,
  last_name,
  phone,
  password,
  is_admin
) VALUES (
  '6570',
  'Admin',
  'User',
  '1234567890',
  '6570',
  true
)
ON CONFLICT (email) DO NOTHING;