import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReviewsController } from './reviews.controller';

describe('ReviewsController', () => {
  it('exige autenticação (JwtAuthGuard) em todas as rotas', () => {
    expect(Reflect.getMetadata('__guards__', ReviewsController)).toContain(
      JwtAuthGuard,
    );
  });
});