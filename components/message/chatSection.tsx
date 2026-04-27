// app/chat/[userId].tsx
import { messageApi } from "@/api/message/message.api";
import { API_URL, } from "@/config/api";
import { useAuth } from "@/hooks/useAuth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Linking,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface Message {
    id: number;
    content: string;
    conversation: number;
    sender_id: number;
    receiver_id: number;
    sender_name: string;
    sender_profile: string;
    created_at: string;
    is_read: boolean;
    message_file: string | null;
}

export default function ChatDetail({ receiverId, name: propName }: { receiverId: string; name?: string }) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversationId, setConversationId] = useState<number | null>(null);
    const [otherParticipant, setOtherParticipant] = useState<{ id: number; name: string; avatar: string } | null>(null);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [selectedFile, setSelectedFile] = useState<{
        uri: string;
        name: string;
        mimeType?: string;
        size?: number;
    } | null>(null);
    const getFileExtension = (url?: string | null) => {
        if (!url) return "";
        const cleanUrl = url.split("?")[0];
        return cleanUrl.split(".").pop()?.toLowerCase() || "";
    };

    const isImageFile = (url?: string | null) => {
        const ext = getFileExtension(url);
        return ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(ext);
    };

    const isAudioFile = (url?: string | null) => {
        const ext = getFileExtension(url);
        return ["mp3", "wav", "m4a", "aac", "ogg", "flac"].includes(ext);
    };

    const isDocFile = (url?: string | null) => {
        const ext = getFileExtension(url);
        return ["pdf", "doc", "docx", "txt", "ppt", "pptx", "xls", "xlsx"].includes(ext);
    };

    const getFileName = (url?: string | null) => {
        if (!url) return "attachment";
        return url.split("/").pop()?.split("?")[0] || "attachment";
    };
    const ws = useRef<WebSocket | null>(null);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        const initChat = async () => {
            try {
                setLoading(true);
                const conv = await messageApi.createConversation(parseInt(receiverId));
                setConversationId(conv.id);

                if (conv.participants && Array.isArray(conv.participants)) {
                    const other = conv.participants.find((p: any) => p.id !== user?.id);
                    if (other) {
                        setOtherParticipant({
                            id: other.id,
                            name: other.username || other.name || `User ${other.id}`,
                            avatar: other.profile_picture,
                        });
                    }
                }

                const msgs = await messageApi.getConversationMessages(conv.id);
                setMessages(msgs);
            } catch (error) {
                console.error("Failed to load conversation", error);
            } finally {
                setLoading(false);
            }
        };
        initChat();
    }, [receiverId]);
    useEffect(() => {
        let socket: WebSocket | null = null;

        const connectWebSocket = async () => {
            const access_token = await AsyncStorage.getItem("access_token");

            console.log("conversationId", conversationId, access_token);

            if (!access_token || !conversationId) return;

            const wsBase = API_URL.startsWith("https")
                ? API_URL.replace("https", "wss")
                : API_URL.replace("http", "ws");

            const wsUrl = `${wsBase}/ws/chat/?token=${access_token}`;
            console.log("Connecting to:", wsUrl);

            socket = new WebSocket(wsUrl);
            ws.current = socket;

            socket.onopen = () => {
                console.log("WebSocket connected");
            };

            socket.onmessage = (event) => {
                console.log("WebSocket message:", event.data);

                const data = JSON.parse(event.data);
                if (data.type !== "private_message") return;

                const toAbsoluteUrl = (url?: string | null) => {
                    if (!url) return null;
                    if (url.startsWith("http://") || url.startsWith("https://")) return url;
                    return `${API_URL}${url}`;
                };

                const incomingMessage = {
                    id: data.message.id,
                    conversation: data.message.conversation ?? data.message.conversation_id,
                    sender_id: data.message.sender_id,
                    sender_name: data.message.sender_name,
                    sender_profile: toAbsoluteUrl(data.message.sender_profile),
                    content: data.message.content || "",
                    message_file: toAbsoluteUrl(data.message.message_file),
                    created_at: data.message.created_at,
                    is_read: data.message.is_read,
                };

                if (Number(incomingMessage.conversation) !== Number(conversationId)) {
                    return;
                }

                setMessages((prev: any) => {
                    if (prev.some((msg: any) => msg.id === incomingMessage.id)) return prev;
                    return [...prev, incomingMessage];
                });
            };

            socket.onerror = (error) => {
                console.log("WebSocket error:", error);
            };

            socket.onclose = (event) => {
                console.log("WebSocket closed:", event.code, event.reason);
            };
        };

        connectWebSocket();

        return () => {
            socket?.close();
        };
    }, [conversationId]);
    const pickFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: "*/*",
                copyToCacheDirectory: true,
                multiple: false,
            });

            if (result.canceled) return;

            const file = result.assets[0];
            setSelectedFile(file);
        } catch (error) {
            console.error("File pick failed", error);
            Alert.alert("Error", "Could not pick file");
        }
    };
    const sendMessage = async () => {
        if ((!inputText.trim() && !selectedFile) || !conversationId) return;

        try {
            setSending(true);

            const formData = new FormData();
            formData.append("recipient_id", String(parseInt(receiverId)));
            formData.append("content", inputText.trim());

            if (selectedFile) {
                if (Platform.OS === "web") {
                    const webFile = (selectedFile as any).file;

                    if (webFile) {
                        formData.append("file", webFile);
                    } else {
                        const response = await fetch(selectedFile.uri);
                        const blob = await response.blob();
                        formData.append("file", blob, selectedFile.name || "upload");
                    }
                } else {
                    formData.append("file", {
                        uri: selectedFile.uri,
                        name: selectedFile.name || "upload",
                        type: selectedFile.mimeType || "application/octet-stream",
                    } as any);
                }
            }

            const createdMessage = await messageApi.sendMessage(formData);

            setMessages((prev) => {
                if (prev.some((msg) => msg.id === createdMessage.id)) return prev;
                return [...prev, createdMessage];
            });

            setInputText("");
            setSelectedFile(null);

            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        } catch (error) {
            console.error("Send failed", error);
            Alert.alert("Error", "Failed to send message");
        } finally {
            setSending(false);
        }
    };
    const renderMessage = ({ item }: { item: Message }) => {
        const isMe = item.sender_name === user?.username;
        const isImage =
            item.message_file &&
            /\.(jpg|jpeg|png|gif|webp)$/i.test(item.message_file);

        return (
            <View className={`flex-row mb-3 ${isMe ? "justify-end" : "justify-start"}`}>
                {!isMe && (
                    <Image
                        source={{ uri: item.sender_profile }}
                        className="w-8 h-8 rounded-full mr-2 self-end"
                    />
                )}

                <View
                    className={`max-w-[80%] rounded-2xl p-4 ${isMe ? "bg-indigo-500" : "bg-gray-200"
                        }`}
                >
                    {!isMe && (
                        <Text className="text-xs text-gray-600 mb-1">
                            {item.sender_name}
                        </Text>
                    )}

                    {!!item.content && (
                        <Text className={`text-base ${isMe ? "text-white" : "text-gray-800"}`}>
                            {item.content}
                        </Text>
                    )}

                    {
                        item.message_file ? (
                            isImageFile(item.message_file) ? (
                                <TouchableOpacity onPress={() => Linking.openURL(item.message_file!)}>
                                    <Image
                                        source={{ uri: item.message_file }}
                                        className="w-56 h-56 rounded-xl mt-2"
                                        resizeMode="cover"
                                    />

                                </TouchableOpacity>
                            ) : isAudioFile(item.message_file) ? (
                                <TouchableOpacity
                                    className={`mt-2 rounded-xl px-3 py-3 ${isMe ? "bg-indigo-400" : "bg-gray-300"
                                        }`}
                                    onPress={() => Linking.openURL(item.message_file!)}
                                >
                                    <Text className={isMe ? "text-white" : "text-gray-800"}>
                                        🎵 {getFileName(item.message_file)}
                                    </Text>
                                    <Text className={`text-xs mt-1 ${isMe ? "text-indigo-100" : "text-gray-600"}`}>
                                        Tap to play
                                    </Text>
                                </TouchableOpacity>
                            ) : isDocFile(item.message_file) ? (
                                <TouchableOpacity
                                    className={`mt-2 rounded-xl px-3 py-2 ${isMe ? "bg-indigo-400" : "bg-gray-300"
                                        }`}
                                    onPress={() => Linking.openURL(item.message_file!)}
                                >
                                    <Text className={isMe ? "text-white" : "text-gray-800"}>
                                        📁 {getFileName(item.message_file)}
                                    </Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    className={`mt-2 rounded-xl px-3 py-2 ${isMe ? "bg-indigo-400" : "bg-gray-300"
                                        }`}
                                    onPress={() => Linking.openURL(item.message_file!)}
                                >
                                    <Text className={isMe ? "text-white" : "text-gray-800"}>
                                        📎 {getFileName(item.message_file)}
                                    </Text>
                                </TouchableOpacity>
                            )
                        ) : null
                    }

                    <Text className={`text-xs mt-1 ${isMe ? "text-indigo-200" : "text-gray-500"}`}>
                        {new Date(item.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </Text>
                </View>

                {
                    isMe && (
                        <Image
                            source={{ uri: user?.profile_picture }}
                            className="w-8 h-8 rounded-full ml-2 self-end"
                        />
                    )
                }
            </View >
        );
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#667eea" />
            </View>
        );
    }

    const headerName = propName || otherParticipant?.name || `User ${receiverId}`;
    const headerAvatar = otherParticipant?.avatar;
    const isRead = messages[messages.length - 1]?.is_read;

    return (
        <KeyboardAvoidingView
            className="flex-1 bg-gray-100"
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
            <View className="bg-white px-4 py-3 border-b border-gray-200 flex-row items-center">
                {headerAvatar ? (
                    <Image source={{ uri: (headerAvatar) }} className="w-10 h-10 rounded-full mr-3" />
                ) : (
                    <View className="w-10 h-10 rounded-full bg-gray-300 mr-3" />
                )}
                <Text className="text-lg font-semibold text-gray-800">{headerName}</Text>
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderMessage}
                contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 12, paddingBottom: 8 }}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            />

            {isRead && (
                <View className="flex-row justify-end px-4 py-2">
                    <Image source={{ uri: headerAvatar }} className="w-4 h-4 mr-1 rounded-full" />
                    <Text className="text-xs text-gray-500">✓ Seen</Text>
                </View>
            )}

            {selectedFile && (
                <View className="px-3 py-2 bg-white border-t border-gray-100">
                    <View className="flex-row items-center justify-between bg-gray-100 rounded-xl px-3 py-2">


                        {isImageFile(selectedFile.name) ? (
                            <View className="relative">
                                <Image source={{ uri: selectedFile.uri }} className="w-60 h-60 mt-4 rounded-lg border border-gray-200" />
                                <TouchableOpacity className="absolute -top-2 -right-2" onPress={() => setSelectedFile(null)}>
                                    <Text className="text-red-500 bg-white p-2 rounded-full">❌</Text>
                                </TouchableOpacity>
                            </View>
                        ) : null}

                        {isDocFile(selectedFile.name) ? (
                            <View className="w-60 h-60 mt-4 rounded-lg bg-gray-200 flex items-center justify-center">
                                <Text className="text-sm text-gray-500">{selectedFile.name}</Text>
                                <Text className="text-sm text-gray-500">{selectedFile?.size?.toFixed(2)} KB</Text>
                                <TouchableOpacity className="absolute -top-2 -right-2" onPress={() => setSelectedFile(null)}>
                                    <Text className="text-red-500 bg-white p-2 rounded-full">❌</Text>
                                </TouchableOpacity>
                            </View>
                        ) : null}
                    </View>
                </View>
            )}

            <View className="flex-row items-center bg-white border-t border-gray-200 px-3 py-2">
                {user?.profile_picture ? (
                    <Image source={{ uri: user?.profile_picture }} className="w-10 h-10 rounded-full mr-2" />
                ) : (
                    <View className="w-10 h-10 rounded-full bg-gray-300 mr-2" />
                )}

                <TouchableOpacity onPress={pickFile} className="mr-2">
                    <Text className="text-base text-white bg-indigo-500 rounded-full px-2 py-1">
                        📂
                    </Text>
                </TouchableOpacity>

                <TextInput
                    className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-base"
                    placeholder="Type a message..."
                    value={inputText}
                    onChangeText={setInputText}
                    multiline
                    style={{ maxHeight: 100 }}
                />

                <TouchableOpacity
                    className="ml-2 bg-indigo-500 rounded-full w-10 h-10 justify-center items-center"
                    onPress={sendMessage}
                    disabled={sending || (!inputText.trim() && !selectedFile)}
                >
                    {sending ? <ActivityIndicator size="small" color="#fff" /> : <Text className="text-white text-lg">➤</Text>}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}