import { Injectable, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '@electra/types';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}

@Injectable()
export class RolesGuard {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles?.length) return true;

    const { user } = context.switchToHttp().getRequest();
    const ROLE_HIERARCHY: Record<UserRole, number> = {
      CITIZEN: 0, CIVIC_EDITOR: 1, LEGAL_VALIDATOR: 2, ADMIN: 3, SUPER_ADMIN: 4,
    };

    const userLevel = ROLE_HIERARCHY[user?.role as UserRole] ?? -1;
    const requiredLevel = Math.min(...requiredRoles.map((r) => ROLE_HIERARCHY[r]));

    if (userLevel < requiredLevel) {
      throw new ForbiddenException('Insufficient permissions for this action.');
    }
    return true;
  }
}
