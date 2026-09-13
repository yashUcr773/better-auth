import { Resend } from 'resend';

export async function sendEmail({ to, subject, html, text }: { to: string, subject: string, html: string, text: string }) {
    if (!process.env.RESEND_API_KEY) {
        throw new Error("RESEND_API_KEY is required to send email")
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    return resend.emails.send({
        from: 'Yash <help@support.yashaggarwal.com>',
        to: [to],
        subject: subject,
        html: html,
        text: text
    });
}
