import Link from 'next/link';

export function CheckEmailNotice({ email }: { email?: string }) {
  return (
    <div className="auth">
      <h1>Verifique seu e-mail</h1>
      <p>
        Enviamos um link de confirmação para{' '}
        {email ? <strong>{email}</strong> : 'o seu e-mail'}. Clique nele para
        ativar sua conta.
      </p>
      <p className="muted">Não recebeu? Confira a caixa de spam.</p>
      <Link href="/">Voltar para o login</Link>
    </div>
  );
}
