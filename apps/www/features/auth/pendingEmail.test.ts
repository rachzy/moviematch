import {
  clearPendingEmail,
  readPendingEmail,
  savePendingEmail,
} from './pendingEmail';

afterEach(() => {
  vi.restoreAllMocks();
  sessionStorage.clear();
});

describe('pendingEmail', () => {
  it('guarda, lê e limpa o e-mail', () => {
    savePendingEmail('a@b.co');
    expect(readPendingEmail()).toBe('a@b.co');
    clearPendingEmail();
    expect(readPendingEmail()).toBe('');
  });

  it('não quebra quando o sessionStorage está indisponível', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(() => savePendingEmail('a@b.co')).not.toThrow();
    expect(readPendingEmail()).toBe('');
  });
});
