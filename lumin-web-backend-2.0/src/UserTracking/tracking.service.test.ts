/* eslint-disable */
import { Test } from '@nestjs/testing';
import { UserService } from 'User/user.service';
import { EnvironmentService } from 'Environment/environment.service';
import { UserTrackingService } from './tracking.service';
import { LoggerService } from 'Logger/Logger.service';
import { RedisService } from 'Microservices/redis/redis.service';
import { TeamService } from 'Team/team.service';
import { PinpointService } from 'Pinpoint/pinpoint.service';
import { HubspotClientProvider } from 'Hubspot/hubspot-client.provider';

class UserServiceMock {
  findUserByEmail() {
    return { email: 'test@email.com' };
  }

  findUserById() {
    return { email: 'test@email.com' }
  }
}

class TeamServiceMock { }

class EnvironmentServiceMock {
  getByKey(key) {
    return 'pat-na1-09d0cfc7-34b4-449f-9772-1f0924f64b2c';
  }
}

class RedisServiceMock {
  getContactPool(){}
  pushToPool(contact){}
  resetContactPool(){}
}

class LoggerServiceMock {
  warn(message) { }
}

class PinpointServiceMock {}

class HubspotClientProviderMock {
  getClient() {
    return {
      crm: {
        contacts: {
          basicApi: {
            create: jest.fn(),
            getById: jest.fn(),
            update: jest.fn(),
            archive: jest.fn(),
          },
          searchApi: {
            doSearch: jest.fn(),
          },
        },
      },
    };
  }
}

describe('UserTracking service', () => {
  let userService;
  let userTrackingService;
  let loggerService;
  let pinpointService: PinpointService;
  beforeAll(async () => {
    const UserServiceProvider = {
      provide: UserService,
      useClass: UserServiceMock,
    };
    const TeamServiceProvider = {
      provide: TeamService,
      useClass: TeamServiceMock,
    };
    const RedisServiceProvider = {
      provide: RedisService,
      useClass: RedisServiceMock,
    };
    const LoggerServiceProvider = {
      provide: LoggerService,
      useClass: LoggerServiceMock,
    };
    const PinpointServiceProvider = {
      provide: PinpointService,
      useClass: PinpointServiceMock,
    };
    const HubspotClientProviderProvider = {
      provide: HubspotClientProvider,
      useClass: HubspotClientProviderMock,
    };
    const module = await Test.createTestingModule({
      providers: [
        UserTrackingService,
        UserServiceProvider,
        TeamServiceProvider,
        RedisServiceProvider,
        {
          provide: EnvironmentService,
          useClass: EnvironmentServiceMock,
        },
        LoggerServiceProvider,
        PinpointServiceProvider,
        HubspotClientProviderProvider,
      ],
    }).compile();
    userTrackingService = module.get<UserTrackingService>(UserTrackingService);
    userService = module.get<UserService>(UserService);
    loggerService = module.get<LoggerService>(LoggerService);
    pinpointService = module.get<PinpointService>(PinpointService);
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('createContact', () => {
    it('should call hubspot client create contact method', async () => {
      const hsClientCreateContactMock = jest.spyOn(
        userTrackingService['hubspotClient'].crm.contacts.basicApi,
        'create'
      );
      hsClientCreateContactMock.mockImplementation(() => Promise.resolve({ firstname: 'FirstName', email: 'test@gmail.com' }))
      const contact = {
        firstname: 'FirstName',
        email: 'test@gmail.com'
      }

      const expected = await userTrackingService.createContact(contact);

      expect(hsClientCreateContactMock).toBeCalled();
      expect(expected.firstname).toEqual(contact.firstname)
    }) 
  });

  describe('getContactByEmail', () => {
    it('should call hubspot client doSearch method', async () => {
      const hsClientDoSearchContactMock = jest.spyOn(
        userTrackingService['hubspotClient'].crm.contacts.searchApi,
        'doSearch'
      );
      hsClientDoSearchContactMock.mockImplementation(() => Promise.resolve({ results: [{id: '123'}]}));

      const expected = await userTrackingService.getContactByEmail('test@gmail.com');

      expect(hsClientDoSearchContactMock).toBeCalled();
      expect(expected.id).toEqual('123');
    })
  });

  describe('updateUserContact', () => {
    it('should call update Contact when contact found', async () => {
      const hubspotClientUpdateContactMock = jest.spyOn(
        userTrackingService,
        'updateContact',
      );
      hubspotClientUpdateContactMock.mockImplementation(() => Promise.resolve());

      const expected = await userTrackingService.updateUserContact('123', {
        stripeid: 'stripeid',
        stripeplan: 'free'
      }, { upsert: false });

      expect(hubspotClientUpdateContactMock).toBeCalled();
    });
  })


  describe('deleteContactByEmail', () => {
    it('should return null if userContact not found', async () => {
      const getContactByEmailMock = jest.spyOn(
        userTrackingService,
        'getContactByEmail'
      );
      getContactByEmailMock.mockImplementation(() => Promise.resolve(null));
      
      const expected = await userTrackingService.deleteContactByEmail('test@gmail.com');

      expect(getContactByEmailMock).toBeCalled();
      expect(expected).toBeNull();
    });

    it('should call deleteContact method when userContact found', async () => {
      const getContactByEmailMock = jest.spyOn(
        userTrackingService,
        'getContactByEmail'
      );
      getContactByEmailMock.mockImplementation(() => Promise.resolve({ id: '123' }));

      const deleteContactMock = jest.spyOn(
        userTrackingService, 'deleteContact'
      );

      await userTrackingService.deleteContactByEmail('test@gmail.com');
      
      expect(getContactByEmailMock).toBeCalled();
      expect(deleteContactMock).toBeCalled();
    });
  });
});
