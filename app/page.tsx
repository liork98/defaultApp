import { LeetCodeDashboard } from "@/components/dashboard/leetcode-dashboard";
import { getQuestions } from "@/lib/actions";
import { createClient } from "@/lib/supabase-server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null; // Middleware will handle redirect to /login

  const initialQuestions = await getQuestions();

  return <LeetCodeDashboard initialQuestions={initialQuestions} />;
}
