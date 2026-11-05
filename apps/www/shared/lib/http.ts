import axios from 'axios';

// Única instância do axios; toda feature faz suas requisições por aqui.
export const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
});
