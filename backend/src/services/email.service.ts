interface EmailPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const isResendReal = process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.startsWith('re_12345');

export const sendNotificationEmail = async (payload: EmailPayload): Promise<void> => {
  if (!isResendReal) {
    console.log('[Email] Resend not configured — skipping email notification for:', payload.name);
    return;
  }
  try {
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'Portfolio <onboarding@resend.dev>',
      to: process.env.ADMIN_EMAIL || 'kshitijarenuke@gmail.com',
      subject: `[Portfolio Contact] ${payload.subject}`,
      html: `
        <h2>New message from ${payload.name}</h2>
        <p><strong>From:</strong> ${payload.email}</p>
        <p><strong>Subject:</strong> ${payload.subject}</p>
        <hr/>
        <p>${payload.message.replace(/\n/g, '<br/>')}</p>
      `,
    });
    console.log('[Email] Notification sent to admin for contact from:', payload.name);
  } catch (error) {
    console.error('[Email Error]', error);
    // Do NOT re-throw — email failure must not affect the contact form response
  }
};
