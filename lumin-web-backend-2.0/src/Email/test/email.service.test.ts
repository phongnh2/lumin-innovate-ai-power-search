/* eslint-disable */
import { Test } from '@nestjs/testing';
import { EmailService } from 'Email/email.service';
import { EmailLoaderService } from 'Email/email-loader.service';
import { EnvironmentService } from 'Environment/environment.service';
import { UserService } from 'User/user.service';
import { CallbackService } from 'Calback/callback.service';
import { User } from 'User/interfaces/user.interface';
import { EMAIL_TYPE } from 'Common/constants/EmailConstant';
import { RedisService } from 'Microservices/redis/redis.service';
import { LoggerService } from 'Logger/Logger.service';
import { OrganizationService } from 'Organization/organization.service';
import { EventServiceFactory } from 'Event/services/event.service.factory';
import { PaymentService } from 'Payment/payment.service';

class UserServiceMock {
  findUserByEmail() {
    return { email: 'test@email.com' };
  }
}

class RedisServiceMock {

}

class LoggerServiceMock {
  warn(message) { }
}

class OrganiationServiceMock {}
class CallbackServiceMock {
  registerCallbacks() {}
}

class EnvironmentServiceMock {
  getByKey(key) {
    return {
      API_KEY: 'key-5h1vo7sowbcy2jht0ejo50rjj49xmo65',
      DOMAIN: 'luminpdf.com',
      API_PUBLIC_KEY: 'mock-1232813183891739'
    };
  }
}

class EventServiceMock {
  createEvent() {}
}

class EmailLoaderServiceMock {
  load() {
    return function(data) {
      return '<b>html string</b>'
    }
  }
}

describe('Email service', () => {
  let emailService: EmailService;
  let userService: UserService;
  let loggerService: LoggerService;
  let eventService: EventServiceFactory;
  beforeAll(async () => {
    const UserServiceProvider = {
      provide: UserService,
      useClass: UserServiceMock,
    };
    const CallbackServiceProvider = {
      provide: 'RedisExpiredCallbackService',
      useClass: CallbackServiceMock,
    };
    const RedisServiceProvider = {
      provide: RedisService,
      useClass: RedisServiceMock,
    };
    const LoggerServiceProvider = {
      provide: LoggerService,
      useClass: LoggerServiceMock,
    };
    const OrganizationServiceProvider = {
      provide: OrganizationService,
      useClass: OrganiationServiceMock,
    }
    const EventServiceProvider = {
      provide: EventServiceFactory,
      useClass: EventServiceMock,
    };
    const EmailLoaderServiceProvider = {
      provide: EmailLoaderService,
      useClass: EmailLoaderServiceMock,
    };
    const PaymentServiceProvider = {
      provide: PaymentService,
      useValue: {
        getNewPaymentObject: jest.fn().mockResolvedValue({ subscriptionItems: [] }),
      },
    };
    const module = await Test.createTestingModule({
      providers: [
        EmailService,
        UserServiceProvider,
        {
          provide: EnvironmentService,
          useClass: EnvironmentServiceMock,
        },
        CallbackServiceProvider,
        RedisServiceProvider,
        LoggerServiceProvider,
        OrganizationServiceProvider,
        EventServiceProvider,
        EmailLoaderServiceProvider,
        PaymentServiceProvider,
      ],
    }).compile();

    emailService = module.get<EmailService>(EmailService);
    userService = module.get<UserService>(UserService);
    loggerService = module.get<LoggerService>(LoggerService)
    eventService = module.get<EventServiceFactory>(EventServiceFactory);
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('sendEmailHOF', () => {
    it('should call sendEmail function without setting in user', async () => {
      const user = <User>{ email: 'test@email.com' };
      jest
        .spyOn(userService, 'findUserByEmail')
        .mockImplementation(() => Promise.resolve(user));
      const spiedSendEmail = jest
        .spyOn(emailService, 'sendEmail')
        .mockImplementation(() => null);

      await emailService.sendEmailHOF(EMAIL_TYPE.WELCOME, ['test@email.com']);

      expect(spiedSendEmail).toHaveBeenCalledTimes(1);
    });

    it('should call sendEmail function with setting.otherEmail=true in user', async () => {
      const user = <User>{
        email: 'test@email.com',
        setting: {
          otherEmail: true,
        },
      };
      jest
        .spyOn(userService, 'findUserByEmail')
        .mockImplementation(() => Promise.resolve(user));
      const spiedSendEmail = jest
        .spyOn(emailService, 'sendEmail')
        .mockImplementation(() => null);
      emailService['canSendEmail'] = jest.fn().mockImplementation(() => Promise.resolve(true));
      await emailService.sendEmailHOF(
        EMAIL_TYPE.SHARE_DOCUMENT,
        ['test@email.com'],
        {},
      );

      expect(spiedSendEmail).toHaveBeenCalledTimes(1);
    });

    it('should call sendEmail function with setting.subscriptionEmail=true in user', async () => {
      const user = <User>{
        email: 'test@email.com',
        setting: {
          subscriptionEmail: true,
        },
      };
      jest
        .spyOn(userService, 'findUserByEmail')
        .mockImplementation(() => Promise.resolve(user));
      emailService['canSendEmail'] = jest.fn().mockImplementation(() => Promise.resolve(true));
      const spiedSendEmail = jest
        .spyOn(emailService, 'sendEmail')
        .mockImplementation(() => null);

      await emailService.sendEmailHOF(
        EMAIL_TYPE.CANCEL_PLAN,
        ['test@email.com'],
        {
          period: 'MONTHLY',
          numberDaysUsePremium: 1,
        },
      );

      expect(spiedSendEmail).toHaveBeenCalledTimes(1);
    });


    it('should call sendEmail function if type.category is anotherType', async () => {
      const user = <User>{
        email: 'test@email.com',
        setting: {
          subscriptionEmail: false,
        },
      };
      jest
        .spyOn(userService, 'findUserByEmail')
        .mockImplementation(() => Promise.resolve(user));
      const spiedSendEmail = jest
        .spyOn(emailService, 'sendEmail')
        .mockImplementation(() => null);

      await emailService.sendEmailHOF(
        EMAIL_TYPE.CONFIRM_EMAIL,
        ['test@email.com'],
        {},
      );

      expect(spiedSendEmail).toHaveBeenCalledTimes(1);
    });
  });

  describe('sendEmail', () => {
    it('should sendEmail if type is default', async () => {
      const mailgunFunctionMock = jest.spyOn(
        emailService['mailgun'].messages,
        'create',
      );
      mailgunFunctionMock.mockResolvedValue({ _id: 'mock-123123' });
      const createEventFnMock = jest
        .spyOn(eventService, 'createEvent')
        .mockImplementation(() => Promise.resolve());
      const result = await emailService.sendEmailHOF(EMAIL_TYPE.WELCOME, [
        'test@email.com',
      ]);
      expect(mailgunFunctionMock).toBeCalledTimes(1);
      expect(createEventFnMock).toBeCalledTimes(1);
    });

    it('should sendEmail if type is subscriptionEmail', async () => {
      const mailgunFunctionMock = jest.spyOn(
        emailService['mailgun'].messages,
        'create',
      );
      mailgunFunctionMock.mockResolvedValue({ _id: 'mock-123123' });
      const createEventFnMock = jest
        .spyOn(eventService, 'createEvent')
        .mockImplementation(() => Promise.resolve());
      const result = await emailService.sendEmailHOF(
        EMAIL_TYPE.CANCEL_PLAN,
        ['test@email.com'],
        {
          period: 'MONTHLY',
          numberDaysUsePremium: 1,
        },
      );
      expect(mailgunFunctionMock).toBeCalledTimes(1);
      expect(createEventFnMock).toBeCalledTimes(1);
    });
  });
});
