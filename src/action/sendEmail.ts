'use server'

import { Resend } from 'resend';

// We use the SENDGRID_API_KEY variable name from your .env.local file, but it holds your Resend key.
const resend = new Resend(process.env.SENDGRID_API_KEY);

// Since we are not using SendGrid's templates, we define the email content here.
const emailTemplates = {
  // This template ID is from the wait/page.tsx file
  'd-d966d02f4a324abeb43a1d7045da520a': {
    subject: 'Your AI Headshots are Being Prepared!',
    html: '<div><h1>Hold tight!</h1><p>We have received your photos and our AI is hard at work. This process can take up to 2 hours. We will send you another email when your headshots are ready.</p></div>'
  },
  // This template ID is also from the wait/page.tsx file
  'd-e937e48db4b945af9279e85baa1683e4': {
    subject: 'Your AI Headshots are Ready!',
    html: '<div><h1>Your Headshots are Ready!</h1><p>Thank you for your patience. Your new professional headshots have been generated. Please log in to your dashboard to view and download them.</p></div>'
  }
};

interface EmailData {
  to: string;
  from: string;
  templateId: string;
  sendAt?: number; // Note: Resend's free tier does not support scheduled sending. This will be ignored.
}

export async function sendEmail({ to, templateId }: EmailData) {
  // @ts-ignore
  const template = emailTemplates[templateId];

  if (!template) {
    const errorMsg = `Email template with ID "${templateId}" not found.`;
    console.error(errorMsg);
    return { success: false, error: errorMsg };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev', // This is a default for testing. Resend requires a verified domain in production.
      to: to,
      subject: template.subject,
      html: template.html,
    });

    if (error) {
      console.error('Error sending email from Resend:', error);
      return { success: false, error: error.message };
    }

    console.log('Resend email sent successfully:', data);
    return { success: true, message: 'Email sent successfully' };
  } catch (error: any) {
    console.error('Error in sendEmail function:', error);
    return { success: false, error: error.message };
  }
}