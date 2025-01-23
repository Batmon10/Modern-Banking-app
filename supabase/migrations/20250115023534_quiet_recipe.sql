/*
  # Initial Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `first_name` (text)
      - `last_name` (text)
      - `phone` (text)
      - `date_of_birth` (date)
      - `address` (text)
      - `city` (text)
      - `state` (text)
      - `zip_code` (text)
      - `ssn` (text)
      - `password` (text)
      - `is_admin` (boolean)
      - `created_at` (timestamptz)

    - `accounts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `type` (text)
      - `account_number` (text, unique)
      - `balance` (decimal)
      - `status` (text)
      - `created_at` (timestamptz)

    - `transactions`
      - `id` (uuid, primary key)
      - `account_id` (uuid, foreign key)
      - `type` (text)
      - `amount` (decimal)
      - `description` (text)
      - `category` (text)
      - `status` (text)
      - `recipient_account_number` (text)
      - `sender_account_number` (text)
      - `created_at` (timestamptz)

    - `cards`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `type` (text)
      - `card_type` (text)
      - `number` (text)
      - `expiry_date` (text)
      - `status` (text)
      - `name_on_card` (text)
      - `created_at` (timestamptz)

    - `bank_logs`
      - `id` (uuid, primary key)
      - `type` (text)
      - `action` (text)
      - `details` (text)
      - `user_email` (text)
      - `amount` (decimal)
      - `status` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text,
  date_of_birth date,
  address text,
  city text,
  state text,
  zip_code text,
  ssn text,
  password text NOT NULL,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Accounts table
CREATE TABLE accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('checking', 'savings')),
  account_number text UNIQUE NOT NULL,
  balance decimal DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'blocked')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own accounts"
  ON accounts
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own accounts"
  ON accounts
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Transactions table
CREATE TABLE transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid REFERENCES accounts(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('credit', 'debit')),
  amount decimal NOT NULL,
  description text,
  category text,
  status text DEFAULT 'completed' CHECK (status IN ('completed', 'pending')),
  recipient_account_number text,
  sender_account_number text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (
    account_id IN (
      SELECT id FROM accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    account_id IN (
      SELECT id FROM accounts WHERE user_id = auth.uid()
    )
  );

-- Cards table
CREATE TABLE cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  card_type text NOT NULL CHECK (card_type IN ('credit', 'debit')),
  number text UNIQUE NOT NULL,
  expiry_date text NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  name_on_card text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own cards"
  ON cards
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own cards"
  ON cards
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Bank logs table
CREATE TABLE bank_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  action text NOT NULL,
  details text,
  user_email text,
  amount decimal,
  status text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bank_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own logs"
  ON bank_logs
  FOR SELECT
  TO authenticated
  USING (user_email = (SELECT email FROM users WHERE id = auth.uid()));

-- Admin policies
CREATE POLICY "Admins can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can read all accounts"
  ON accounts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can update all accounts"
  ON accounts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can read all transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can read all cards"
  ON cards
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can update all cards"
  ON cards
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can read all logs"
  ON bank_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true
    )
  );