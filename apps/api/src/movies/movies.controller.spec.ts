import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MoviesController } from './movies.controller';

describe('MoviesController', () => {
  it('exige login (JwtAuthGuard) em todas as rotas', () => {
    expect(Reflect.getMetadata('__guards__', MoviesController)).toContain(
      JwtAuthGuard,
    );
  });
});
