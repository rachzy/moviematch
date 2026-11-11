'tsx'
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:3333/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'E-mail ou senha incorretos.');
      }

      //Salva o token no localStorage
      localStorage.setItem('@moviematch:token', data.access_token);
      
      //Redireciona para a página principal do app de filmes
      router.push('/dashboard'); //ou a rota correta do projeto
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao fazer login.');
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <div>
        <label>E-mail</label>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
          className="border p-2 w-full"
        />
      </div>
      <div>
        <label>Senha</label>
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
          className="border p-2 w-full"
        />
      </div>
      <button type="submit" className="bg-blue-600 text-white p-2 w-full rounded">
        Entrar
      </button>
    </form>
  );
}