import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { ReviewsRepository } from './reviews.repository';
import { ReviewsService } from './reviews.service';

describe('ReviewsService', () => {
  const repo = {
    updateOwned: jest.fn(),
    deleteOwned: jest.fn(),
    exists: jest.fn(),
  };
  const service = new ReviewsService(repo as unknown as ReviewsRepository);

  beforeEach(() => jest.resetAllMocks());

  describe('update', () => {
    it('atualiza e devolve a review', async () => {
      repo.updateOwned.mockResolvedValue({ id: 'rev-1', rating: 5 });
      const res = await service.update('rev-1', 'user-a', { rating: 5 });
      expect(res).toEqual({ id: 'rev-1', rating: 5 });
      expect(repo.updateOwned).toHaveBeenCalledWith('rev-1', 'user-a', {
        rating: 5,
      });
    });

    it('comentário vazio vira null', async () => {
      repo.updateOwned.mockResolvedValue({ id: 'rev-1' });
      await service.update('rev-1', 'user-a', { comment: '' });
      expect(repo.updateOwned).toHaveBeenCalledWith('rev-1', 'user-a', {
        comment: null,
      });
    });

    it('404 quando a avaliação não existe', async () => {
      repo.updateOwned.mockResolvedValue(null);
      repo.exists.mockResolvedValue(false);
      await expect(
        service.update('x', 'user-a', { rating: 4 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('403 quando a avaliação é de outro usuário', async () => {
      repo.updateOwned.mockResolvedValue(null);
      repo.exists.mockResolvedValue(true);
      await expect(
        service.update('rev-1', 'intruso', { rating: 1 }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('remove a avaliação do autor', async () => {
      repo.deleteOwned.mockResolvedValue(true);
      await expect(service.remove('rev-1', 'user-a')).resolves.toEqual({
        deleted: true,
        id: 'rev-1',
      });
    });

    it('404 quando não existe', async () => {
      repo.deleteOwned.mockResolvedValue(false);
      repo.exists.mockResolvedValue(false);
      await expect(service.remove('x', 'user-a')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('403 quando é de outro usuário', async () => {
      repo.deleteOwned.mockResolvedValue(false);
      repo.exists.mockResolvedValue(true);
      await expect(service.remove('rev-1', 'intruso')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
