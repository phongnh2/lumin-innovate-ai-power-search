import { IOptions } from 'Common/utils/Options/Option.interface';
import { MongooseModuleOptions } from '@nestjs/mongoose';

export class Production implements IOptions {
  public mongoDB(): MongooseModuleOptions {
    const certPath = '/certs/mongo.pem';
    return {
      authMechanism: 'MONGODB-X509',
      authSource: '$external',
      sslKey: certPath,
      sslCert: certPath,
      ssl: true,
    };
  }
}
