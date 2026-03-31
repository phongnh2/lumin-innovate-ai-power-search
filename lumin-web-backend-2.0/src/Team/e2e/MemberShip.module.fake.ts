import { Module, forwardRef } from '@nestjs/common';

class MembershipService {}

@Module({
    providers: [MembershipService],
    exports: [MembershipService],
})
export class MembershipModule {}
