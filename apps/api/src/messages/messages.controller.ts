import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { MessagesService } from "./messages.service";
import { SendMessageDto } from "./dto/send-message.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RequestUser } from "../auth/types/request-user";

@UseGuards(JwtAuthGuard)
@Controller()
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Get("conversations")
  listMyConversations(@CurrentUser() user: RequestUser) {
    return this.messagesService.listMyConversations(user);
  }

  @Get("applications/:applicationId/messages")
  listMessages(@CurrentUser() user: RequestUser, @Param("applicationId") applicationId: string) {
    return this.messagesService.listMessages(user, applicationId);
  }

  @Post("applications/:applicationId/messages")
  sendMessage(
    @CurrentUser() user: RequestUser,
    @Param("applicationId") applicationId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.messagesService.sendMessage(user, applicationId, dto.body);
  }

  @Post("applications/:applicationId/messages/read")
  markRead(@CurrentUser() user: RequestUser, @Param("applicationId") applicationId: string) {
    return this.messagesService.markRead(user, applicationId);
  }
}
