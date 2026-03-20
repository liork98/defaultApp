-- 1. Create Profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Enums for Questions
CREATE TYPE question_difficulty AS ENUM ('Easy', 'Medium', 'Hard');
CREATE TYPE question_type AS ENUM ('Blitz', 'New');
CREATE TYPE question_status AS ENUM ('Pending', 'Completed', 'Failed');

-- 3. Create Questions table
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  url TEXT,
  difficulty question_difficulty NOT NULL DEFAULT 'Easy',
  type question_type NOT NULL DEFAULT 'New',
  status question_status NOT NULL DEFAULT 'Pending',
  scheduled_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- 5. Profiles Policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- 6. Questions Policies
-- Users can read their own questions
CREATE POLICY "Users can read own questions" 
ON questions FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own questions
CREATE POLICY "Users can insert own questions" 
ON questions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own questions
CREATE POLICY "Users can update own questions" 
ON questions FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can delete their own questions
CREATE POLICY "Users can delete own questions" 
ON questions FOR DELETE 
USING (auth.uid() = user_id);

-- 7. Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
