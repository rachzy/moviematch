const MAILPIT = process.env.E2E_MAILPIT_URL ?? 'http://mailpit:8025';

// Espera o e-mail de verificação chegar ao Mailpit e devolve o caminho `/verify-email?token=...`.
export async function getVerificationPath(email: string): Promise<string> {
  for (let i = 0; i < 30; i++) {
    const search = await fetch(
      `${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:${email}`)}`,
    );
    const { messages } = await search.json();
    if (messages?.length) {
      const res = await fetch(`${MAILPIT}/api/v1/message/${messages[0].ID}`);
      const { HTML } = await res.json();
      const match = /\/verify-email\?token=[0-9a-f]+/.exec(HTML);
      if (match) return match[0];
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`E-mail de verificação para ${email} não chegou`);
}
