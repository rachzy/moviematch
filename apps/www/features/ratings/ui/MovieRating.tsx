'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
import { getMyRating, saveRating } from '../api';
import { StarRating } from './StarRating';

type Alert = { ok: boolean; text: string } | null;

function errorMessage(err: unknown) {
  const status = axios.isAxiosError(err) ? err.response?.status : undefined;
  if (status === 401) return 'Faça login para avaliar este filme.';
  if (status === 400) return 'Nota inválida. Escolha de 1 a 5 estrelas.';
  return 'Não foi possível salvar sua nota. Tente novamente.';
}

export function MovieRating({ movieId }: { movieId: string }) {
  const [saved, setSaved] = useState(0); // 0 = ainda sem nota salva
  const [draft, setDraft] = useState(0); // nota escolhida, antes de enviar
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [alert, setAlert] = useState<Alert>(null);

  useEffect(() => {
    let cancelled = false;
    getMyRating(movieId)
      .then((rating) => {
        if (cancelled) return;
        setSaved(rating.value);
        setDraft(rating.value);
      })
      .catch((err) => {
        if (cancelled) return;
        // 404 = o usuário ainda não avaliou: não é erro
        if (axios.isAxiosError(err) && err.response?.status === 404) return;
        setAlert({ ok: false, text: errorMessage(err) });
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [movieId]);

  function onChange(value: number) {
    setDraft(value);
    setAlert(null);
  }

  async function onSubmit() {
    if (draft === 0) {
      setAlert({ ok: false, text: 'Escolha uma nota de 1 a 5 estrelas.' });
      return;
    }
    setSending(true);
    setAlert(null);
    try {
      const rating = await saveRating(movieId, draft);
      setSaved(rating.value);
      setAlert({ ok: true, text: 'Nota salva com sucesso!' });
    } catch (err) {
      setAlert({ ok: false, text: errorMessage(err) });
    } finally {
      setSending(false);
    }
  }

  const busy = loading || sending;

  return (
    <section className="rating-box">
      <h2>Sua avaliação</h2>
      <p className="rating-saved">
        {loading
          ? 'Carregando...'
          : saved
            ? `Sua nota atual: ${saved} de 5`
            : 'Você ainda não avaliou este filme.'}
      </p>

      <StarRating value={draft} onChange={onChange} disabled={busy} />

      <button
        type="button"
        className="rating-btn"
        onClick={onSubmit}
        disabled={busy}
      >
        {sending ? 'Enviando...' : saved ? 'Atualizar nota' : 'Enviar nota'}
      </button>

      {alert && (
        <p
          className={alert.ok ? 'rating-alert ok' : 'rating-alert error'}
          role={alert.ok ? 'status' : 'alert'}
        >
          {alert.text}
        </p>
      )}
    </section>
  );
}
