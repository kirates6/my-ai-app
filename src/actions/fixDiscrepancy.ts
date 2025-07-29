'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function fixDiscrepancy(userData: any) {
  // Ensure there is an API status ID to check
  if (!userData?.apiStatus?.id) return null;

  // Re-fetch the tune details directly from the Astria AI
  const response = await fetch(`https://api.astria.ai/tunes/${userData.apiStatus.id}`, {
    headers: { 'Authorization': 'Bearer ' + process.env.ASTRIA_API_KEY }
  });

  if (!response.ok) {
      console.error("Failed to fix discrepancy from Astria");
      return null;
  }

  const tuneDetails = await response.json();
  const newPrompts = tuneDetails.prompts;

  // Update the user's record in Supabase with the latest results
  const supabase = createServerActionClient({ cookies });
  const { error } = await supabase
    .from('userTable')
    .update({ promptsResult: newPrompts })
    .eq('id', userData.id);

  if (error) {
    console.error("Error updating discrepancy:", error);
    return null;
  }

  revalidatePath('/dashboard/results');
  return newPrompts;
}