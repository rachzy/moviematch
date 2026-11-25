import { useId } from 'react';

export const COMMENT_MAX = 500;

type Props = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

// "Seu comentário (opcional)" com contador de caracteres.
export function CommentField({ value, onChange, disabled }: Props) {
  const id = useId();
  return (
    <div className="rating-comment">
      <div className="rating-comment-head">
        <label htmlFor={id}>
          Seu comentário <span>(opcional)</span>
        </label>
        <span aria-live="polite">
          {value.length}/{COMMENT_MAX}
        </span>
      </div>
      <textarea
        id={id}
        value={value}
        maxLength={COMMENT_MAX}
        rows={3}
        placeholder="Conte o que achou do filme..."
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
