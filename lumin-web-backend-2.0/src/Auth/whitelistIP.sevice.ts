import { Injectable } from '@nestjs/common';
import * as ipRangeCheck from 'ip-range-check';

import { EnvConstants } from 'Common/constants/EnvConstants';
import { ErrorCode } from 'Common/constants/ErrorCode';
import { GraphqlException } from 'Common/errors/graphql/GraphException';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { CustomHttpException } from 'Common/errors/http/CustomHttpException';
import { HttpErrorException } from 'Common/errors/HttpErrorException';
import { Utils } from 'Common/utils/Utils';

import { EnvironmentService } from 'Environment/environment.service';
import { LoggerService } from 'Logger/Logger.service';

@Injectable()
export class WhitelistIPService {
  constructor(
    private readonly environment: EnvironmentService,
    private readonly loggerService: LoggerService,
  ) {}

  cryptoKey = this.environment.getByKey(EnvConstants.ENCRYPT_KEY);

  validateIPRequest({
    isGraphqlRequest = true,
    email,
    ipAddress,
  }: {
    isGraphqlRequest?: boolean,
    email: string,
    ipAddress: string,
  }): {
    isAccept?: boolean,
    error?: GraphqlException | CustomHttpException,
  } {
    const userDomain = Utils.getEmailDomain(email);
    const whiteListIp = this.environment.getWhiteIPsByDomain(userDomain);
    if (!whiteListIp.length) {
      // Does not exist prevent ip with this domain
      return {
        isAccept: true,
      };
    }
    const enableAccess = ipRangeCheck(ipAddress, whiteListIp);
    this.loggerService.info({
      context: 'Validate IP request',
      extraInfo: {
        whiteListIp,
        email,
        enableAccess,
        ipAddress,
      },
    });
    if (!enableAccess) {
      return {
        error: (
          isGraphqlRequest
            ? GraphErrorException.NotAcceptable(
              'This ip is not acceptable, please try another email or move to another ip',
              ErrorCode.Common.INVALID_IP_ADDRESS,
              { email },
            )
            : HttpErrorException.NotAcceptable(
              'This ip is not acceptable, please try another email or move to another ip',
              ErrorCode.Common.INVALID_IP_ADDRESS,
            )
        ),
      };
    }
    return {
      isAccept: true,
    };
  }
}
