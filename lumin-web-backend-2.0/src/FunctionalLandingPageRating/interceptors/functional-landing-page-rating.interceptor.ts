import {
  Injectable, NestInterceptor, ExecutionContext, CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { FunctionalLandingPageRatingResponseDto } from '../dtos';
import { IFunctionalLandingPageRatingModel } from '../interfaces/functional-landing-page-rating.interface';

@Injectable()
export class FunctionalLandingPageRatingInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<FunctionalLandingPageRatingResponseDto> {
    return next.handle().pipe(
      map(({ action, stars, totalVotes }: IFunctionalLandingPageRatingModel) => ({
        action,
        stars,
        totalVotes,
      })),
    );
  }
}
