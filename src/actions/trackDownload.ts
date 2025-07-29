'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function trackDownload(imageUrl: string, userData: any) {
  if (!userData) return { success: false, error: 'User not found.' };

  const supabase = createServerActionClient({ cookies });

  const currentHistory = Array.isArray(userData.downloadHistory) ? userData.downloadHistory : [];
  // Add the new URL, using a Set to ensure no duplicates
  const newHistory = [...new Set([...currentHistory, imageUrl])];

  const { error } = await supabase
    .from('userTable')
    .update({ downloadHistory: newHistory })
    .eq('id', userData.id);

  if (error) {
    console.error('Error tracking download:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard/results'); // Refresh the results page data
  return { success: true, downloadHistory: newHistory };
}