import { BadRequestException, ParseUUIDPipe } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { ReviewsController } from './reviews.controller';
import { updateReviewSchema } from './reviews.schemas';
import type { ReviewsService } from './reviews.service';

describe('ReviewsController', () => {
  const service = { update: jest.fn(), remove: jest.fn() };
  const controller = new ReviewsController(
    service as unknown as ReviewsService,
  );
  const user = { id: 'user-a', email: 'a@a.com' };

  beforeEach(() => jest.resetAllMocks());

  it('exige autenticação (JwtAuthGuard) em todas as rotas', () => {
    expect(Reflect.getMetadata(GUARDS_METADATA, ReviewsController)).toContain(
      JwtAuthGuard,
    );
  });

  it('PATCH repassa id, usuário do token e corpo ao service', async () => {
    service.update.mockResolvedValue({ id: 'r1' });
    await controller.update('r1', user, { rating: 4 });
    expect(service.update).toHaveBeenCalledWith('r1', 'user-a', { rating: 4 });
  });

  it('DELETE repassa id e usuário do token ao service', async () => {
    service.remove.mockResolvedValue({ deleted: true, id: 'r1' });
    await controller.remove('r1', user);
    expect(service.remove).toHaveBeenCalledWith('r1', 'user-a');
  });

  it('UUID inválido na rota gera 400', async () => {
    const pipe = new ParseUUIDPipe();
    await expect(
      pipe.transform('nao-e-uuid', { type: 'param' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('corpo vazio gera 400', () => {
    const pipe = new ZodValidationPipe(updateReviewSchema);
    expect(() => pipe.transform({})).toThrow(BadRequestException);
  });
});
