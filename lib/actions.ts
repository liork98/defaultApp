'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { Difficulty, Question, QuestionStatus, QuestionType } from './types'
import { addDays, format, parseISO } from 'date-fns'

function toIsoFromLocalDate(d: Date) {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0); // Avoid date shifting across timezones
  return x.toISOString();
}

export async function getQuestions() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching questions:', error)
    return []
  }

  // Map database fields back to our UI types
  return data.map(q => ({
    id: q.id,
    title: q.title,
    url: q.url,
    difficulty: q.difficulty,
    type: q.type,
    status: q.status,
    dateAdded: q.scheduled_date, // For New questions, it's just the scheduled date
    nextReviewDate: q.scheduled_date // For Blitz questions, it's also the scheduled date
  })) as Question[]
}

export async function addQuestionAction(
  title: string,
  difficulty: Difficulty,
  type: QuestionType,
  url: string,
  date: Date
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Unauthorized')

  // Ensure profile exists (fallback if trigger didn't run)
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  if (!profile) {
    await supabase.from('profiles').insert([
      { 
        id: user.id, 
        username: user.email?.split('@')[0],
        avatar_url: user.user_metadata?.avatar_url 
      }
    ])
  }

  const scheduledDate = format(date, 'yyyy-MM-dd')

  const { data, error } = await supabase
    .from('questions')
    .insert([
      {
        user_id: user.id,
        title,
        difficulty,
        type,
        url,
        status: 'Pending',
        scheduled_date: scheduledDate
      }
    ])
    .select()
    .single()

  if (error) {
    console.error('Database error adding question:', error)
    throw new Error(error.message)
  }

  revalidatePath('/')
  return data
}

export async function toggleCompleteAction(id: string, currentStatus: QuestionStatus) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Unauthorized')

  const nextStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed'

  const { error } = await supabase
    .from('questions')
    .update({ status: nextStatus })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/')
}

export async function tryAgainAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Unauthorized')

  // First, get the original question
  const { data: original, error: fetchError } = await supabase
    .from('questions')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !original) throw fetchError || new Error('Question not found')

  const baseDate = parseISO(original.scheduled_date)
  const tomorrow = addDays(baseDate, 1)
  const tomorrowStr = format(tomorrow, 'yyyy-MM-dd')

  // Mark original as failed
  const { error: updateError } = await supabase
    .from('questions')
    .update({ status: 'Failed' })
    .eq('id', id)

  if (updateError) throw updateError

  // Create duplicate for tomorrow as Blitz
  const { error: insertError } = await supabase
    .from('questions')
    .insert([
      {
        user_id: user.id,
        title: original.title,
        difficulty: original.difficulty,
        type: 'Blitz',
        url: original.url,
        status: 'Pending',
        scheduled_date: tomorrowStr
      }
    ])

  if (insertError) throw insertError

  revalidatePath('/')
}
