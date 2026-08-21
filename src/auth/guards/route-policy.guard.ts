import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import {
  REQUEST_TOKEN_PAYLOAD_KEY,
  ROUTE_POLICY_KEY,
} from '../constants/auth.constants';
import { RoutePolicies } from '../enum/route-policies.enum';
import { Person } from '../../persons/entities/person.entity';

@Injectable()
export class RoutePolicyGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const routePolicyRequired = this.reflector.get<RoutePolicies | undefined>(
      ROUTE_POLICY_KEY,
      context.getHandler(),
    );

    if (!routePolicyRequired) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const tokenPayload = request[REQUEST_TOKEN_PAYLOAD_KEY];

    if (!tokenPayload) {
      throw new UnauthorizedException(
        `Route required permission ${routePolicyRequired}. User not logged`,
      );
    }

    const { person }: { person: Person } = tokenPayload;

    if (!person[0].routePolicies.includes(routePolicyRequired)) {
      throw new UnauthorizedException(
        `User not permissions ${routePolicyRequired}`,
      );
    }

    return true;
  }
}
