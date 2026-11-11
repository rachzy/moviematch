const sendMail = jest.fn();
const createTransport = jest.fn(() => ({ sendMail }));
jest.mock('nodemailer', () => ({ createTransport }));

import { MailService } from './mail.service';

describe('MailService', () => {
  const env = { ...process.env };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...env };
    delete process.env.MAIL_HOST;
    delete process.env.MAIL_PORT;
    delete process.env.MAIL_USER;
    delete process.env.MAIL_PASSWORD;
    delete process.env.MAIL_FROM;
    delete process.env.WWW_URL;
  });
  afterAll(() => {
    process.env = env;
  });

  it('usa os padrões do Mailpit, sem autenticação', () => {
    new MailService();
    expect(createTransport).toHaveBeenCalledWith({
      host: 'mailpit',
      port: 1025,
      auth: undefined,
    });
  });

  it('autentica quando MAIL_USER está definido', () => {
    process.env.MAIL_HOST = 'smtp.exemplo.com';
    process.env.MAIL_PORT = '587';
    process.env.MAIL_USER = 'user';
    process.env.MAIL_PASSWORD = 'pass';
    new MailService();
    expect(createTransport).toHaveBeenCalledWith({
      host: 'smtp.exemplo.com',
      port: 587,
      auth: { user: 'user', pass: 'pass' },
    });
  });

  it('envia o link de verificação para o destinatário', async () => {
    process.env.WWW_URL = 'https://moviematch.com';
    process.env.MAIL_FROM = 'no@mm.com';

    await new MailService().sendVerificationEmail('a@a.com', 'tok123');

    const mail = sendMail.mock.calls[0][0];
    expect(mail.to).toBe('a@a.com');
    expect(mail.from).toBe('no@mm.com');
    expect(mail.html).toContain(
      'https://moviematch.com/verify-email?token=tok123',
    );
  });

  it('propaga erro do SMTP', async () => {
    sendMail.mockRejectedValue(new Error('smtp fora'));
    await expect(
      new MailService().sendVerificationEmail('a@a.com', 't'),
    ).rejects.toThrow('smtp fora');
  });
});
