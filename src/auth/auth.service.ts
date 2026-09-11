import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { CreateUserDto, LoginUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const user = this.userRepository.create(createUserDto);
      user.password = await bcrypt.hash(createUserDto.password, 10);
      await this.userRepository.save(user);
      const { password, ...userWithoutPassword } = user;
      const token = this.generateJwt({ id: user.id });
      return { ...userWithoutPassword, token };
    } catch (error) {
      this.handleError(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    const user = await this.userRepository.findOne({ 
      where: { email },
      select: { email: true, password: true, id: true } 
    });
      
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      email: user.email,
      token: this.generateJwt({ id: user.id })
    };
  }

  async checkAuthStatus(user: User) {
      return {
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        token: this.generateJwt({ id: user.id })
    };  
  }


  private generateJwt(payload: JwtPayload): string {
    const token = this.jwtService.sign(payload);
    return token;
  }

  private handleError(error: any) : never {
    if (error.code === '23505') { // Unique violation
        throw new BadRequestException(error.detail);
    }
    console.error(error);
    throw new InternalServerErrorException('Unexpected error occurred');
  }
}
