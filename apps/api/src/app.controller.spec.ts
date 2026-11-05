import { AppController } from './app.controller';

describe('AppController', () => {
  it('GET /health retorna ok', () => {
    expect(new AppController().health()).toEqual({ status: 'ok' });
  });
});
