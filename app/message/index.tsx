import { useMessage } from "@/api/message/message.hook";
import { useEffect } from "react";
import { View } from "react-native";
import ConversationsScreen from "../../components/message/conversation";
export default function Chat() {
    const { data: conversations, refetch, isLoading } = useMessage();
    useEffect(() => {
        refetch();
    }, []);
    return (
        <View className="flex-1 bg-gray-100">
            <ConversationsScreen conversations={conversations || []} isLoading={isLoading} />
        </View>
    );
}