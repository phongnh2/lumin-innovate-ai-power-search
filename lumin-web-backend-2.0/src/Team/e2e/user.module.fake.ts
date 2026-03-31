import { Module, forwardRef } from '@nestjs/common';
import { TeamModule } from '../team.module';

class UserService {}

@Module({
    providers: [UserService],
    exports: [UserService],
})
export class UserModule {}
