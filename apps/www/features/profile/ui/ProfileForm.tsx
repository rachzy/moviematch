'use client';

import axios from 'axios';
import { useEffect, useState, type FormEvent } from 'react';
import { getMyProfile, updateMyProfile } from '../api';
import type { UserProfile } from '../types';

type ProfileFormValues = {
  nickname: string;
  avatarUrl: string;
  pronouns: string;
};

const toFormValues = (profile: UserProfile): ProfileFormValues => ({
  nickname: profile.nickname ?? '',
  avatarUrl: profile.avatarUrl ?? '',
  pronouns: profile.pronouns ?? '',
});

export function ProfileForm() {
  const [savedProfile, setSavedProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState<ProfileFormValues>({
    nickname: '',
    avatarUrl: '',
    pronouns: '',
  });
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getMyProfile()
      .then((data) => {
        if (!active) return;
        setSavedProfile(data);
        setForm(toFormValues(data));
      })
      .catch(() => {
        if (!active) return;
        setLoadError('Não foi possível carregar os dados do perfil.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatusMessage(null);
    setError(null);
    setSaving(true);
    try {
      const updated = await updateMyProfile({
        nickname: form.nickname.trim() || null,
        avatarUrl: form.avatarUrl.trim() || null,
        pronouns: form.pronouns.trim() || null,
      });
      setSavedProfile(updated);
      setForm(toFormValues(updated));
      setAvatarFailed(false);
      setStatusMessage('Perfil atualizado.');
    } catch (err) {
      // 400 traz as issues do zod; 404 traz { message }.
      const data = axios.isAxiosError(err) ? err.response?.data : undefined;
      setError(
        (Array.isArray(data) ? data[0]?.message : data?.message) ||
          'Não foi possível salvar as alterações.',
      );
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    if (!savedProfile) return;
    setForm(toFormValues(savedProfile));
    setError(null);
    setStatusMessage(null);
  }

  if (loading) return <p>Carregando perfil...</p>;
  if (loadError || !savedProfile) {
    return <p role="alert">{loadError ?? 'Perfil indisponível.'}</p>;
  }

  return (
    <section className="card">
      <h1>Meu perfil</h1>
      <p>
        @{savedProfile.username} · {savedProfile.email}
      </p>

      {savedProfile.avatarUrl && !avatarFailed && (
        <img
          src={savedProfile.avatarUrl}
          alt={`Foto de ${savedProfile.nickname || savedProfile.username}`}
          width={80}
          height={80}
          referrerPolicy="no-referrer"
          onError={() => setAvatarFailed(true)}
          style={{ borderRadius: '50%', objectFit: 'cover' }}
        />
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="nickname">Apelido</label>
          <input
            id="nickname"
            type="text"
            value={form.nickname}
            onChange={(e) => setForm({ ...form, nickname: e.target.value })}
          />
        </div>

        <div className="field">
          <label htmlFor="avatarUrl">Foto de perfil (URL)</label>
          <input
            id="avatarUrl"
            type="url"
            value={form.avatarUrl}
            onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
          />
          {form.avatarUrl && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setForm({ ...form, avatarUrl: '' })}
            >
              Remover foto
            </button>
          )}
        </div>

        <div className="field">
          <label htmlFor="pronouns">Pronomes</label>
          <input
            id="pronouns"
            type="text"
            placeholder="Ex.: ela/dela, ele/dele"
            value={form.pronouns}
            onChange={(e) => setForm({ ...form, pronouns: e.target.value })}
          />
          {form.pronouns && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setForm({ ...form, pronouns: '' })}
            >
              Remover pronomes
            </button>
          )}
        </div>

        {error && (
          <div className="error-banner" role="alert">
            {error}
          </div>
        )}
        {statusMessage && <p role="status">{statusMessage}</p>}

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCancel}
            disabled={saving}
          >
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </section>
  );
}
