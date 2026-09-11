import { CanActivate, ExecutionContext, Injectable, BadRequestException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { User } from '../entities/user.entity';
import { META_ROLES } from '../decorators';

@Injectable()
export class UserRoleGuard implements CanActivate {

  constructor(
    private readonly reflector: Reflector 
  ){}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    const validRoles = this.reflector.get<string[]>(META_ROLES, context.getHandler());

    if(!validRoles || validRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user as User;

    if(!user) {
      throw new BadRequestException('User not found');
    }

    for(const role of validRoles) {
      if(user.role?.includes(role)) {
        return true;
      }
    }
    throw new BadRequestException(`User ${user.fullName} does not have the required role (${validRoles.join(', ')})`);  
  }
}
