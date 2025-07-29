"use server"

import { createClient } from "@/utils/supabase/server"; // Using the standard server client
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// This function checks the user's plan and returns their image limit
const getAllowedPrompts = (planType: string): number => {
  switch (planType.toLowerCase()) {
    case 'professional':
      return 100;
    case 'executive':
      return 200;
    case 'basic':
    default:
      return 10;
  }
};

export async function POST(request: Request) {
  const incomingData = await request.json();
  const urlObj = new URL(request.url);
  const userId = urlObj.searchParams.get("user_id");
  const webhookSecret = urlObj.searchParams.get("webhook_secret");

  // Security Checks
  if (!webhookSecret || webhookSecret !== process.env.APP_WEBHOOK_SECRET) {
    return NextResponse.json({ message: "Unauthorized!" }, { status: 401 });
  }
  if (!userId) {
    return NextResponse.json({ message: "Malformed URL, no user_id detected!" }, { status: 400 });
  }

  try {
    const supabase = createClient();
    
    // Fetch the user's current profile
    const { data: userProfile, error: userError } = await supabase
      .from('userTable')
      .select('promptsResult, planType, workStatus')
      .eq('id', userId)
      .single();

    if (userError || !userProfile) {
      console.error('Webhook Error: User not found or error fetching user.', userError);
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Append the new AI result to the existing array
    const currentPrompts = Array.isArray(userProfile.promptsResult) ? userProfile.promptsResult : [];
    const updatedPrompts = [...currentPrompts, { timestamp: new Date().toISOString(), data: incomingData }];
    
    // Check if the user has reached their plan limit
    const allowedPrompts = getAllowedPrompts(userProfile.planType || 'basic');
    const isLimitReached = updatedPrompts.length >= allowedPrompts;

    // Prepare the database update
    const updatePayload: { promptsResult: any[]; workStatus?: string } = {
      promptsResult: updatedPrompts
    };

    // If the limit is reached, mark the work as 'completed'
    if (isLimitReached) {
      updatePayload.workStatus = 'completed';
    }

    // Update the user's record in the database
    const { error: updateError } = await supabase
      .from('userTable')
      .update(updatePayload)
      .eq('id', userId);

    if (updateError) {
      console.error('Webhook Error: Failed to update user table.', updateError);
      throw new Error(updateError.message);
    }
    
    console.log(`Webhook Success: Results saved for user ${userId}. Limit reached: ${isLimitReached}`);
    return NextResponse.json({ message: "Webhook processed successfully." }, { status: 200 });

  } catch (e) {
    console.error('Webhook Error: Unhandled exception.', e);
    return NextResponse.json({ message: "Something went wrong!" }, { status: 500 });
  }
}