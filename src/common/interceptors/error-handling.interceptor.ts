import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { catchError, throwError } from 'rxjs';

export class ErrorHandlingInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler<any>) {
    console.log('ErrorHandlingInterceptor executado ANTES');

    await new Promise((resolve) => setTimeout(resolve, 3000));
    return next.handle().pipe(
      catchError((error) => {
        return throwError(() => error);
      }),
    );
  }
}
