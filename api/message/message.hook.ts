import { useMutation, useQuery } from "@tanstack/react-query";
import { messageApi } from "./message.api";

export const useMessage = () => {
  return useQuery({
    queryKey: ["message"],
    queryFn: () => messageApi.getConversationList(),
  });
};

export const useSeenMessage = () => {
  return useMutation({
    mutationFn: (conversationId: number) => {
      return messageApi.seenMessage(conversationId);
    },
  });
};
