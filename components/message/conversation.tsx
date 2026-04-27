// app/chat/conversations.tsx
import { useSeenMessage } from "@/api/message/message.hook";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from "react-native";

export default function ConversationsScreen({ conversations, isLoading }: { conversations: any[]; isLoading: boolean }) {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { mutate: markAsSeen, isPending: isMarkingSeen } = useSeenMessage();

    const getOtherParticipant = (conv: any) => {
        return conv.participants?.find((p: any) => p.id !== user?.id);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m`;
        if (diffHours < 24) return `${diffHours}h`;
        if (diffDays === 1) return "Yesterday";
        return date.toLocaleDateString([], { month: "short", day: "numeric" });
    };

    const getLastMessage = (conv: any) => {
        const messages = conv.messages;
        if (!messages || messages.length === 0) return "No messages yet";
        const last = messages[messages.length - 1];
        return last.content;
    };

    const getUnreadCount = (conv: any) => {
        const messages = conv.messages;
        if (!messages) return 0;
        return messages.filter((m: any) => !m.is_read && m.sender_id !== user?.id).length;
    };

    const handlePressConversation = (conversationId: number, otherId: number, otherName: string) => {
        markAsSeen(conversationId, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["conversations"] });
            },
            onError: (error) => console.error("Failed to mark as seen", error),
        });
        router.push({
            pathname: "message/[id]" as any,
            params: { id: otherId, name: otherName },
        });
    };

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-100">
                <ActivityIndicator size="large" color="#667eea" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-100">
            {/* Fixed Header */}
            <View className="bg-white px-5 pt-12 pb-3 border-b border-gray-200">
                <Text className="text-2xl font-bold text-gray-800">Messages</Text>
            </View>

            <FlatList
                data={conversations}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => {
                    const other = getOtherParticipant(item);
                    if (!other) return null;
                    const lastMessage = getLastMessage(item);
                    const lastMessageDate = item.messages?.[item.messages.length - 1]?.created_at;
                    const unreadCount = getUnreadCount(item);

                    return (
                        <TouchableOpacity
                            className="bg-white rounded-2xl p-4 mb-3 mx-4 shadow-sm active:opacity-80"
                            onPress={() => handlePressConversation(item.id, other.id, other.username)}
                            disabled={isMarkingSeen}
                        >
                            <View className="flex-row items-center">
                                <Image
                                    source={{ uri: other.profile_picture || "https://via.placeholder.com/48" }}
                                    className="w-12 h-12 rounded-full mr-3"
                                />
                                <View className="flex-1">
                                    <View className="flex-row justify-between items-center">
                                        <Text className="text-base font-semibold text-gray-800">{other.username}</Text>
                                        {lastMessageDate && (
                                            <Text className="text-xs text-gray-400">{formatDate(lastMessageDate)}</Text>
                                        )}
                                    </View>
                                    <Text className="text-sm text-gray-500 mt-0.5" numberOfLines={1}>
                                        {lastMessage}
                                    </Text>
                                </View>
                                {unreadCount > 0 && (
                                    <View className="ml-3 bg-indigo-500 rounded-full min-w-[24px] h-6 justify-center items-center px-2">
                                        <Text className="text-white text-xs font-bold">{unreadCount}</Text>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    );
                }}
                contentContainerStyle={{ paddingVertical: 12 }}
                ListEmptyComponent={
                    <View className="flex-1 justify-center items-center py-20">
                        <Text className="text-gray-400 text-base">No conversations yet</Text>
                        <Text className="text-gray-300 text-sm mt-1">Start a chat from a user profile</Text>
                    </View>
                }
            />
        </View>
    );
}