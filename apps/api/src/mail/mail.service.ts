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

  async sendVerificationEmail(email: string, token: string, code: string) {
    const wwwUrl = process.env.WWW_URL ?? 'http://localhost:3000';
    const url = `${wwwUrl}/verify-email?token=${token}`;
    
    await this.transporter.sendMail({
      from: process.env.MAIL_FROM ?? 'noreply@moviematch.com',
      to: email,
      subject: 'Verifique o seu e-mail - MovieMatch',
      html: `
        <h1>Bem-vindo ao MovieMatch!</h1>
        <p>Seu código de verificação de 6 dígitos é:</p>
        <h2 style="color: #4f46e5; font-size: 24px; letter-spacing: 2px;">${code}</h2>
        <p>Ou, se preferir, clique no link abaixo para verificar diretamente:</p>
        <a href="${url}">${url}</a>
        <p>Este código e link expiram em 24 horas.</p>
      `,
    });
  }
}