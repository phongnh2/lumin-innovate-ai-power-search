import { authService } from '@/lib/grpc/services/auth';
import { contractAuthService } from '@/lib/grpc/services/contract-auth';
import { kratosService } from '@/lib/grpc/services/kratos';
import { userService } from '@/lib/grpc/services/user';
import { workspaceService } from '@/lib/grpc/services/workspace';

export default {
  kratos: kratosService,
  user: userService,
  auth: authService,
  contractAuthService,
  workspace: workspaceService
};
