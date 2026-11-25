'use client';

import { useEffect, useRef, useState } from 'react';
import { STUDIOS } from '../studios';
import { CloseIcon, StudioIcon } from './icons';

type Props = {
  value: string | null;
  studios?: readonly string[];
  onChange: (studio: string | null) => void;
};

export function StudioFilter({
  value,
  studios = STUDIOS,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const filteredStudios = studios.filter((s) =>
    s.toLowerCase().includes(query.trim().toLowerCase()),
  );

  function selectStudio(studio: string | null) {
    onChange(studio);
    setOpen(false);
    setQuery('');
  }

  return (
    <div className="studio-dropdown" ref={containerRef}>
      <button
        type="button"
        className="studio-trigger"
        aria-expanded={open}
        data-active={Boolean(value)}
        onClick={() => setOpen((prev) => !prev)}
      >
        <StudioIcon size={16} />
        <span>{value ? `Estúdio: ${value}` : 'Estúdio: Todos'}</span>
        {value ? (
          <span
            role="button"
            tabIndex={0}
            className="studio-clear"
            aria-label="Limpar filtro de estúdio"
            onClick={(e) => {
              e.stopPropagation();
              selectStudio(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation();
                selectStudio(null);
              }
            }}
          >
            <CloseIcon size={12} />
          </span>
        ) : (
          <span className="studio-chevron" aria-hidden="true">
            ▾
          </span>
        )}
      </button>

      {open && (
        <div className="studio-menu" role="listbox" aria-label="Selecionar estúdio">
          <input
            type="text"
            className="studio-search-input"
            placeholder="Filtrar estúdio..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />

          <div className="studio-options">
            <button
              type="button"
              role="option"
              aria-selected={value === null}
              className="studio-option"
              onClick={() => selectStudio(null)}
            >
              Todos os estúdios
            </button>

            {filteredStudios.map((studio) => (
              <button
                key={studio}
                type="button"
                role="option"
                aria-selected={value === studio}
                className="studio-option"
                onClick={() => selectStudio(studio)}
              >
                {studio}
              </button>
            ))}

            {filteredStudios.length === 0 && (
              <p className="studio-empty">Nenhum estúdio encontrado</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}