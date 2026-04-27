import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import ChatSection from '../../../components/message/chatSection';

export default function ChatScreen() {
    const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
    return <View className="mb-[20%] mt-[20%] ">
        <ChatSection receiverId={id} name={name} />
    </View>;
}