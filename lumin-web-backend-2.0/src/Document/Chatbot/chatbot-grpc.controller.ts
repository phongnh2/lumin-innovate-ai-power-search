import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import { IndividualRoles } from 'Document/enums/individual.roles.enum';
import { OrganizationDocumentRoles, OrgTeamDocumentRoles } from 'Document/enums/organization.roles.enum';
import { DocumentGuestLevelGuardRpc } from 'Document/guards/Grpc/document.guest.permission.guard';
import { User } from 'User/interfaces/user.interface';

import { ChatbotService } from './chatbot.service';

@Controller('/chatbot')
export class ChatbotGrpcController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @DocumentGuestLevelGuardRpc(
    OrganizationDocumentRoles.ALL,
    IndividualRoles.ALL,
    OrgTeamDocumentRoles.ALL,
  )
  @GrpcMethod('ChatbotService', 'ValidateRequestsLimit')
  validateRequestsLimit(data: { documentId: string, user: User }) {
    return this.chatbotService.validateRequestsLimit(data);
  }

  @DocumentGuestLevelGuardRpc(
    OrganizationDocumentRoles.ALL,
    IndividualRoles.ALL,
    OrgTeamDocumentRoles.ALL,
  )
  @GrpcMethod('ChatbotService', 'CountFreeRequestsUsage')
  countFreeRequestsUsage(data: { documentId: string, user: User }) {
    return this.chatbotService.countFreeRequestsUsage(data.user);
  }
}
