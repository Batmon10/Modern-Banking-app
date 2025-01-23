/*
  # Delete All Accounts Data

  1. Changes
    - Delete all data from accounts table
    - Delete all related transactions
    - Delete all related cards
    - Preserve table structure and policies

  2. Security
    - Maintains existing RLS policies
    - No structural changes to tables
*/

-- Delete all transactions first (due to foreign key constraints)
DELETE FROM transactions;

-- Delete all cards
DELETE FROM cards;

-- Delete all accounts
DELETE FROM accounts;