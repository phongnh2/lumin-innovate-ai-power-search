import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable, map } from 'rxjs';

import { ChatRequest, WebChatbotService } from '../GrpcClient/webchatbot/webChatbot.interface';

@Injectable()
export class WebChatbotClientService implements OnModuleInit {
  constructor(
    @Inject('WEBCHATBOT_CLIENT')
    private readonly webChatbotClient: ClientGrpc,
  ) {}

  private webChatbotService: WebChatbotService;

  onModuleInit() {
    this.webChatbotService = this.webChatbotClient.getService<WebChatbotService>('WebChatbotService');
  }

  streamChat(request: ChatRequest): Observable<Uint8Array> {
    const response = this.webChatbotService.StreamChat(request);
    return response.pipe(
      map((chunk) => chunk.data),
    );
  }
}
