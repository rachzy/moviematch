'use client';

import { useEffect, useState } from 'react';
import { getHealth } from '../api';

export function HealthBadge() {
  const [online, setOnline] = useState<boolean | null>(null);

  useEffect(() => {
    getHealth()
      .then((health) => setOnline(health.status === 'ok'))
      .catch(() => setOnline(false));
  }, []);

  if (online === null) return <small>API: verificando…</small>;
  return <small>API: {online ? 'online' : 'offline'}</small>;
}
