import { ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { RequestUser } from "../auth/types/request-user";
import { EMAIL_SERVICE, EmailService } from "../email/email.service";

interface ConversationContext {
  conversationId: string;
  candidateUserId: string;
  companyUserId: string;
  jobTitle: string;
  candidateNotifyByEmail: boolean;
  companyNotifyByEmail: boolean;
}

@Injectable()
export class MessagesService {
  constructor(
    private prisma: PrismaService,
    @Inject(EMAIL_SERVICE) private emailService: EmailService,
  ) {}

  /**
   * Çağıranın bu başvurunun tarafı (adayı ya da ilanı açan firma) olduğunu
   * doğrular, konuşma kaydı yoksa ilk mesajda kendiliğinden oluşturur —
   * ayrı bir "sohbet başlat" adımı yoktur.
   */
  private async getOrCreateConversation(user: RequestUser, applicationId: string): Promise<ConversationContext> {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        candidate: true,
        job: { include: { company: true } },
      },
    });
    if (!application) throw new NotFoundException("Başvuru bulunamadı");

    const isCandidate = application.candidate.userId === user.id;
    const isCompany = application.job.company.userId === user.id;
    if (!isCandidate && !isCompany) throw new ForbiddenException("Bu başvurunun mesajlarına erişemezsiniz");

    const conversation = await this.prisma.conversation.upsert({
      where: { applicationId },
      update: {},
      create: {
        applicationId,
        candidateId: application.candidateId,
        companyId: application.job.companyId,
      },
    });

    return {
      conversationId: conversation.id,
      candidateUserId: application.candidate.userId,
      companyUserId: application.job.company.userId,
      jobTitle: application.job.title,
      candidateNotifyByEmail: application.candidate.notifyByEmail,
      companyNotifyByEmail: application.job.company.notifyByEmail,
    };
  }

  async sendMessage(user: RequestUser, applicationId: string, body: string) {
    const context = await this.getOrCreateConversation(user, applicationId);

    const message = await this.prisma.message.create({
      data: { conversationId: context.conversationId, senderId: user.id, body },
    });
    await this.prisma.conversation.update({
      where: { id: context.conversationId },
      data: { updatedAt: new Date() },
    });

    const recipientIsCandidate = user.id !== context.candidateUserId;
    const recipientUserId = recipientIsCandidate ? context.candidateUserId : context.companyUserId;
    const recipientNotifyByEmail = recipientIsCandidate ? context.candidateNotifyByEmail : context.companyNotifyByEmail;
    if (recipientNotifyByEmail) {
      const recipient = await this.prisma.user.findUnique({ where: { id: recipientUserId } });
      if (recipient) {
        await this.emailService.sendNewMessageNotification(recipient.email, context.jobTitle).catch(() => undefined);
      }
    }

    return this.toMessageDto(message, user.id);
  }

  async listMessages(user: RequestUser, applicationId: string) {
    const context = await this.getOrCreateConversation(user, applicationId);
    const messages = await this.prisma.message.findMany({
      where: { conversationId: context.conversationId },
      orderBy: { createdAt: "asc" },
    });
    return messages.map((m) => this.toMessageDto(m, user.id));
  }

  async markRead(user: RequestUser, applicationId: string): Promise<{ success: true }> {
    const context = await this.getOrCreateConversation(user, applicationId);
    await this.prisma.message.updateMany({
      where: { conversationId: context.conversationId, senderId: { not: user.id }, readAt: null },
      data: { readAt: new Date() },
    });
    return { success: true };
  }

  async listMyConversations(user: RequestUser) {
    if (user.role !== "CANDIDATE" && user.role !== "COMPANY") return [];

    const candidateProfile =
      user.role === "CANDIDATE"
        ? await this.prisma.candidateProfile.findUnique({ where: { userId: user.id } })
        : null;
    const companyProfile =
      user.role === "COMPANY" ? await this.prisma.companyProfile.findUnique({ where: { userId: user.id } }) : null;
    if (!candidateProfile && !companyProfile) return [];

    const conversations = await this.prisma.conversation.findMany({
      where: candidateProfile ? { candidateId: candidateProfile.id } : { companyId: companyProfile!.id },
      include: {
        application: { include: { job: true } },
        candidate: true,
        company: true,
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { updatedAt: "desc" },
    });
    if (conversations.length === 0) return [];

    const unreadCounts = await this.prisma.message.groupBy({
      by: ["conversationId"],
      where: {
        conversationId: { in: conversations.map((c) => c.id) },
        senderId: { not: user.id },
        readAt: null,
      },
      _count: true,
    });
    const unreadByConversation = new Map(unreadCounts.map((u) => [u.conversationId, u._count]));

    return conversations.map((c) => ({
      id: c.id,
      applicationId: c.applicationId,
      jobId: c.application.jobId,
      jobTitle: c.application.job.title,
      candidateName: c.candidate.fullName,
      companyName: c.company.companyName,
      lastMessageBody: c.messages[0]?.body ?? null,
      lastMessageAt: c.messages[0]?.createdAt.toISOString() ?? null,
      unreadCount: unreadByConversation.get(c.id) ?? 0,
      updatedAt: c.updatedAt.toISOString(),
    }));
  }

  private toMessageDto(
    message: { id: string; conversationId: string; senderId: string; body: string; readAt: Date | null; createdAt: Date },
    currentUserId: string,
  ) {
    return {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      isMine: message.senderId === currentUserId,
      body: message.body,
      readAt: message.readAt?.toISOString() ?? null,
      createdAt: message.createdAt.toISOString(),
    };
  }
}
