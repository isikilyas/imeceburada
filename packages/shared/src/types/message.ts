export interface MessageDto {
  id: string;
  conversationId: string;
  senderId: string;
  /** İsteği yapan kullanıcı açısından — kendi gönderdiği mesaj mı. */
  isMine: boolean;
  body: string;
  readAt: string | null;
  createdAt: string;
}

export interface ConversationSummaryDto {
  id: string;
  applicationId: string;
  jobId: string;
  jobTitle: string;
  candidateName: string;
  companyName: string;
  lastMessageBody: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  updatedAt: string;
}

export interface SendMessageInput {
  body: string;
}
