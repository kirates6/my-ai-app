'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
// Import the base createClient for our admin action
import { createClient } from '@supabase/supabase-js' 
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

// This function is for regular users, so it uses the standard client
export async function handlePlanSelection(plan: { name: string; amount: number }) {
  const supabase = createServerActionClient({ cookies })
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/')
  }

  const { error } = await supabase
    .from('payments')
    .insert({
      user_id: user.id,
      plan_name: plan.name,
      amount: plan.amount,
      status: 'pending'
    })

  if (error) {
    console.error('Error inserting payment request:', error)
    return redirect('/billing?error=true')
  }

  return redirect('/billing/success')
}

// This is an ADMIN function, so we use the powerful Service Role client
export async function updatePaymentStatus(paymentId: number, userId: string) {
  console.log(`--- ADMIN ACTION: Updating paymentId ${paymentId} for userId ${userId}`);

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Step 1: Update the status in the 'payments' table
  const { error: paymentError } = await supabaseAdmin
    .from('payments')
    .update({ status: 'paid' })
    .eq('id', paymentId);

  if (paymentError) {
    console.error('--- ADMIN ERROR updating payments table:', paymentError);
    return;
  }

  // Step 2: Update the status on the main user profile table
  const { error: userError } = await supabaseAdmin
    .from('userTable')
    .update({ paymentStatus: 'paid' })
    .eq('id', userId);

  if (userError) {
    console.error('--- ADMIN ERROR updating userTable:', userError);
    return;
  }

  console.log(`--- ADMIN SUCCESS: User ${userId} and Payment ${paymentId} marked as paid.`);
  revalidatePath('/admin');
}