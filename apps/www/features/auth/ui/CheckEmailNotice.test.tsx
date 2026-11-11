import { render, screen } from '@testing-library/react';
import { CheckEmailNotice } from './CheckEmailNotice';

describe('CheckEmailNotice', () => {
  it('mostra o e-mail informado', () => {
    render(<CheckEmailNotice email="a@b.co" />);
    expect(screen.getByText('a@b.co')).toBeInTheDocument();
  });

  it('usa texto genérico sem e-mail', () => {
    render(<CheckEmailNotice />);
    expect(screen.getByText(/o seu e-mail/)).toBeInTheDocument();
  });

  it('tem link de volta ao login', () => {
    render(<CheckEmailNotice />);
    expect(screen.getByRole('link', { name: /login/i })).toHaveAttribute(
      'href',
      '/',
    );
  });
});
