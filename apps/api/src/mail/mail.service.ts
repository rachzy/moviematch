import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST', 'mailpit'),
      port: this.configService.get<number>('MAIL_PORT', 1025),
      secure: false, // true para 465, false para outras portas como 1025 do Mailpit
      auth: {
        user: this.configService.get<string>('MAIL_USER', ''),
        pass: this.configService.get<string>('MAIL_PASSWORD', ''),
      },
    });
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const from = this.configService.get<string>('MAIL_FROM', 'noreply@moviematch.com');
    const verificationUrl = `http://localhost:3001/auth/verify-email?token=${token}`;
    await this.transporter.sendMail({
      from,
      to: email,
      subject: 'Verifique o seu e-mail - MovieMatch',
      html: `
        <h1>Bem-vindo ao MovieMatch!</h1>
        <p>Para verificar o seu e-mail, clique no link abaixo:</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
        <p>Este token expira em breve.</p>
      `,
    });
  }
}