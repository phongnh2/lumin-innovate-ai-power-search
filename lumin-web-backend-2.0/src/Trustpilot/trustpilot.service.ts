import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

import { CommonConstants } from 'Common/constants/CommonConstants';
import { EnvConstants } from 'Common/constants/EnvConstants';
import { HttpErrorException } from 'Common/errors/HttpErrorException';

import { EnvironmentService } from 'Environment/environment.service';
import { GetReviewsInputDto } from 'Trustpilot/dtos/trustpilot.dto';
import { ITrustpilotReview } from 'Trustpilot/interfaces/trustpilot.interface';

@Injectable()
export class TrustpilotService {
  constructor(
    private readonly httpService: HttpService,
    private readonly environmentService: EnvironmentService,
  ) { }

  async getReviews(data: GetReviewsInputDto): Promise<ITrustpilotReview[]> {
    const { tag, limit } = data;
    const businessUnit = this.environmentService.getByKey(EnvConstants.TRUSTPILOT_BUSINESS_UNIT);
    const apiKey = this.environmentService.getByKey(EnvConstants.TRUSTPILOT_API_KEY);
    const filterStars = [4, 5];

    return this.httpService.axiosRef.get(
      `${CommonConstants.TRUSTPILOT_API_ENDPOINT}/business-units/${businessUnit}/reviews`,
      {
        params: {
          apikey: apiKey,
          perPage: limit,
          stars: filterStars,
          tagValue: tag,
        },
      },
    ).then(({ data: response }) => response.reviews.map(({
      consumer, title, text, stars, id, createdAt,
    }) => ({
      consumerName: consumer.displayName,
      title,
      text,
      stars,
      href: `https://www.trustpilot.com/reviews/${id}`,
      createdAt,
    })))
      .catch((error) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        throw HttpErrorException.InternalServerError(error.message);
      });
  }
}
