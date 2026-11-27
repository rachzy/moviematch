import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository, type UpdateProfileData } from './user.repository';

@Injectable()
export class UsersService {
  constructor(private readonly users: UserRepository) {}

  async getProfile(userId: string) {
    const user = await this.users.findById(userId);
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user.toPublic();
  }

  async updateProfile(userId: string, data: UpdateProfileData) {
    const existing = await this.users.findById(userId);
    if (!existing) throw new NotFoundException('Usuário não encontrado');
    const updated = await this.users.updateProfile(userId, data);
    return updated.toPublic();
  }
}