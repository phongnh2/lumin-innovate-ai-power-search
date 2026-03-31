import { forwardRef, Module } from '@nestjs/common';

import { AuthModule } from 'Auth/auth.module';
import { BlacklistModule } from 'Blacklist/blacklist.module';
import { DocumentModule } from 'Document/document.module';
import { EmailModule } from 'Email/email.module';
import { KratosService } from 'Kratos/kratos.service';
import { LuminContractModule } from 'LuminContract/luminContract.module';
import { OrganizationModule } from 'Organization/organization.module';
import { SocketIOModule } from 'SocketIO/socket.io.module';
import { TeamModule } from 'Team/team.module';
import { UserModule } from 'User/user.module';

import { KratosController } from './kratos.controller';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule),
    BlacklistModule,
    forwardRef(() => OrganizationModule),
    TeamModule,
    SocketIOModule,
    forwardRef(() => EmailModule),
    LuminContractModule,
    forwardRef(() => DocumentModule),
  ],
  controllers: [KratosController],
  exports: [KratosService],
  providers: [KratosService],
})

export class KratosModule {}
