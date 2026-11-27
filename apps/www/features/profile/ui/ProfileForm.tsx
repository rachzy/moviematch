'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { getMyProfile, updateMyProfile } from '../api';
import type { UserProfile } from '../types';
import {
  validateProfile,
  type ProfileErrors,
  type ProfileFormValues,
} from '../validation';

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
  const [errors, setErrors] = useState<ProfileErrors>({});
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

    const validationErrors = validateProfile(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSaving(true);
    try {
      const updated = await updateMyProfile({
        nickname: form.nickname.trim() || null,
        avatarUrl: form.avatarUrl.trim() || null,
        pronouns: form.pronouns.trim() || null,
      });
      setSavedProfile(updated);
      setForm(toFormValues(updated));
      setStatusMessage('Perfil atualizado.');
    } catch {
      setStatusMessage('Não foi possível salvar as alterações.');
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    if (!savedProfile) return;
    setForm(toFormValues(savedProfile));
    setErrors({});
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

      {savedProfile.avatarUrl && (
        <img
          src={savedProfile.avatarUrl}
          alt={`Foto de ${savedProfile.nickname || savedProfile.username}`}
          width={80}
          height={80}
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
          {errors.nickname && <span role="alert">{errors.nickname}</span>}
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
          {errors.avatarUrl && <span role="alert">{errors.avatarUrl}</span>}
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
          {errors.pronouns && <span role="alert">{errors.pronouns}</span>}
        </div>

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