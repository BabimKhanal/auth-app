// app/api/message/message.api.ts
import apiClient from "../client";

export const messageApi = {
  // List all conversations
  getConversationList: () =>
    apiClient.get("/conversations").then((res) => res.data),

  // Get messages for a specific conversation
  getConversationMessages: (conversationId: number) =>
    apiClient
      .get(`/conversations/${conversationId}/messages`)
      .then((res) => res.data),

  // Create or get a conversation (uses other_user_id)
  createConversation: (otherUserId: number) =>
    apiClient
      .post("/conversations", { other_user_id: otherUserId })
      .then((res) => res.data),

  // Send a message to an existing conversation (only content)
  sendMessage: (formData: FormData) =>
    apiClient.post(`/messages/send`, formData).then((res) => res.data),

  seenMessage: (conversationId: number) =>
    apiClient
      .patch(`/messages/seen`, { conversation_id: conversationId })
      .then((res) => res.data),
};
