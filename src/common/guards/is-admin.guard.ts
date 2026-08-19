import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

export class IsAdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    console.log('Admin guard');
    const request = context.switchToHttp().getRequest();
    const role = request['user']?.role;

    return role === 'admin';
  }
}
