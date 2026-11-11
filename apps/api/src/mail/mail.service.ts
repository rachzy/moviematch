import { Injectable } from '@nestjs/common';
import { createTransport } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly transporter = createTransport({
    host: process.env.MAIL_HOST ?? 'mailpit',
    port: Number(process.env.MAIL_PORT ?? 1025),
    // Sem usuário (ex.: Mailpit), não tenta autenticar.
    auth: process.env.MAIL_USER
      ? { user: process.env.MAIL_USER, pass: process.env.MAIL_PASSWORD }
      : undefined,
  });

  async sendVerificationEmail(email: string, token: string) {
    const wwwUrl = process.env.WWW_URL ?? 'http://localhost:3000';
    const url = `${wwwUrl}/verify-email?token=${token}`;
    await this.transporter.sendMail({
      from: process.env.MAIL_FROM ?? 'noreply@moviematch.com',
      to: email,
      subject: 'Verifique o seu e-mail - MovieMatch',
      html: `
        <h1>Bem-vindo ao MovieMatch!</h1>
        <p>Para verificar o seu e-mail, clique no link abaixo:</p>
        <a href="${url}">${url}</a>
        <p>Este link expira em 24 horas.</p>
      `,
    });
  }
}
