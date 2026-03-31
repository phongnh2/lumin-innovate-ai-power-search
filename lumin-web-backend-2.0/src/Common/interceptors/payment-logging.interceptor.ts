import {
  Injectable, NestInterceptor, ExecutionContext, CallHandler, ContextType as NestContextType,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { cloneDeep } from 'lodash';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { IGqlRequest } from 'Auth/interfaces/IGqlRequest';
import { LoggerService } from 'Logger/Logger.service';

type ContextType = NestContextType | 'graphql';
type Context = {
  req: IGqlRequest;
  res: Response
}

@Injectable()
export class PaymentLoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly loggerService: LoggerService,
  ) { }

  getGqlContext(context: ExecutionContext) {
    const contextType = context.getType<ContextType>();
    if (contextType !== 'graphql') {
      return null;
    }
    const ctx = GqlExecutionContext.create(context);
    if (ctx.getInfo().operation.operation === 'subscription') {
      return null;
    }
    return ctx.getContext<Context>();
  }

  getRequestVariables(req: IGqlRequest) {
    const { variables } = req.body;
    const requestVariables = {
      userId: variables.userId || variables?.input?.userId,
      orgId: variables.orgId || variables?.input?.orgId,
      clientId: variables.clientId || variables?.input?.clientId,
      plan: variables.plan || variables?.input?.plan,
      currency: variables.currency || variables?.input?.currency,
      paymentType: variables.type || variables?.input?.type,
      period: variables.period || variables?.input?.period,
      stripeAccountId: variables.stripeAccountId || variables?.input?.stripeAccountId,
    };
    return requestVariables;
  }

  removeSensitiveData = (data: any, operationName: string) => {
    if (!data) {
      return null;
    }
    switch (operationName) {
      case 'retrieveOrganizationSetupIntent':
      case 'retrieveSetupIntentV2':
      case 'retrieveOrganizationSetupIntentV2':
      case 'retrieveSetupIntentV3': {
        const clientSecret = data.clientSecret as string;
        data.clientSecret = clientSecret.split('_secret_')[0].concat('_secret_***');
        return data;
      }
      case 'GetCard': {
        delete data.email;
        return data;
      }
      case 'GetInvoices': {
        return data.map((invoice: any) => invoice.id);
      }
      default:
        return data;
    }
  };

  getLogInfoResponse(req: IGqlRequest, resData: any): Record<string, any> {
    const commonAttributes = this.loggerService.getCommonAttributes(req);
    const requestVariables = this.getRequestVariables(req);
    const { operationName } : { operationName: string } = req.body;
    const logData = {
      userId: commonAttributes.userId,
      anonymousUserId: commonAttributes.anonymousUserId,
      ipAddress: commonAttributes.ipAddress,
      countryCode: req.user.countryCode,
      userAgent: req?.headers['user-agent'],
      context: operationName,
      requestVariables,
      scope: 'Payment',
      responseData: this.removeSensitiveData(resData, operationName),
    };
    return logData;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(
        map((data) => {
          try {
            const ctx = this.getGqlContext(context);
            const resLogInfo = this.getLogInfoResponse(ctx.req, cloneDeep(data));
            this.loggerService.info(resLogInfo);
          } catch (error) { /* empty */ }
          return data;
        }),
      );
  }
}
