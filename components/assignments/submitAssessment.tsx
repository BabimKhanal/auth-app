// app/assignment/submit.tsx
import { useAssignments, useSubmitAssignment } from '@/api/assignment/assignment.hooks';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function SubmissionForm() {
    // ✅ Hooks at top level
    const { data: assignments, isLoading: isLoadingAssignments } = useAssignments();

    const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);
    const { mutate: submit, isPending } = useSubmitAssignment(selectedAssignmentId as number);

    const [title, setTitle] = useState('');
    const [selectedImages, setSelectedImages] = useState<any[]>([]);
    const [selectedFile, setSelectedFile] = useState<any>(null);

    // Helper functions (unchanged)
    const getFileType = (uri: string) => {
        const ext = uri.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'jpg': case 'jpeg': return 'image/jpeg';
            case 'png': return 'image/png';
            case 'pdf': return 'application/pdf';
            case 'doc': return 'application/msword';
            case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            default: return 'application/octet-stream';
        }
    };

    const getFileName = (uri: string) => uri.split('/').pop() || 'file';

    const pickImages = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['image/jpeg', 'image/png', 'image/jpg'],
                copyToCacheDirectory: true,
                multiple: true,
            });
            if (!result.canceled && result.assets) {
                const newImages = result.assets.map(asset => ({
                    uri: asset.uri,
                    name: asset.name || getFileName(asset.uri),
                    type: asset.mimeType || getFileType(asset.uri),
                }));
                setSelectedImages(prev => [...prev, ...newImages]);
            }
        } catch (error) {
            console.error('Error picking images:', error);
            Alert.alert('Error', 'Failed to pick images');
        }
    };

    const pickSubmissionFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
                copyToCacheDirectory: true,
            });
            if (!result.canceled && result.assets?.[0]) {
                const asset = result.assets[0];
                setSelectedFile({
                    uri: asset.uri,
                    name: asset.name || getFileName(asset.uri),
                    type: asset.mimeType || getFileType(asset.uri),
                });
            }
        } catch (error) {
            console.error('Error picking file:', error);
            Alert.alert('Error', 'Failed to pick file');
        }
    };

    const removeImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!selectedAssignmentId) {
            Alert.alert('Error', 'Please select an assignment');
            return;
        }
        if (!title.trim()) {
            Alert.alert('Error', 'Please enter a submission title');
            return;
        }
        if (selectedImages.length === 0 && !selectedFile) {
            Alert.alert('Error', 'Please upload at least one file (image or document)');
            return;
        }

        const formData = new FormData();
        formData.append('assignment', String(selectedAssignmentId));
        formData.append('title', title);

        // Append images with blob if web
        if (Platform.OS === 'web') {
            selectedImages.forEach(async (img) => {
                const response = await fetch(img.uri);
                const blob = await response.blob();
                const file = new File([blob], img.name, {
                    type: img.type || 'image/jpeg',
                });
                formData.append('images[]', file);
            });
        } else {
            selectedImages.forEach((img) => {
                formData.append('images[]', {
                    uri: img.uri,
                    name: img.name,
                    type: img.type,
                } as any);
            });
        }

        // Append main file with blob if web
        if (selectedFile) {
            if (Platform.OS === 'web') {
                const response = await fetch(selectedFile.uri);
                const blob = await response.blob();
                const file = new File([blob], selectedFile.name, {
                    type: selectedFile.type || 'application/pdf',
                });
                formData.append('submission_file', file);
            } else {
                formData.append('submission_file', {
                    uri: selectedFile.uri,
                    name: selectedFile.name,
                    type: selectedFile.type,
                } as any);
            }

            // ✅ Use the mutation hook
            submit(formData, {
                onSuccess: () => {
                    Alert.alert('Success', 'Assignment submitted successfully!', [
                        { text: 'OK', onPress: () => router.back() }
                    ]);
                },
                onError: (error: any) => {
                    console.error('Submit error:', error);
                    Alert.alert('Error', error.response?.data?.message || 'Failed to submit assignment');
                },
            });
        }
    };

    if (isLoadingAssignments) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-100">
                <ActivityIndicator size="large" color="#667eea" />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            className="flex-1"
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <LinearGradient colors={['#667eea', '#764ba2']} className="flex-1">
                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View className="flex-row justify-between items-center pt-12 pb-5 px-5">
                        <TouchableOpacity
                            className="w-10 h-10 rounded-full bg-white/20 justify-center items-center"
                            onPress={() => router.back()}
                        >
                            <Text className="text-2xl text-white font-bold">←</Text>
                        </TouchableOpacity>
                        <Text className="text-xl font-bold text-white">Submit Assignment</Text>
                        <View className="w-10" />
                    </View>

                    {/* Form Container */}
                    <View className="bg-white rounded-t-3xl px-5 pb-10 pt-6">
                        {/* Assignment Selector */}
                        <View className="mb-5">
                            <Text className="text-sm font-semibold text-gray-800 mb-2">
                                Select Assignment <Text className="text-red-500">*</Text>
                            </Text>
                            <View className="border border-gray-200 rounded-xl bg-gray-50">
                                {assignments?.length === 0 ? (
                                    <Text className="p-3 text-gray-500">No assignments available</Text>
                                ) : (
                                    assignments?.map((assignment: any) => (
                                        <TouchableOpacity
                                            key={assignment.id}
                                            className={`p-3 border-b border-gray-200 ${selectedAssignmentId === assignment.id ? 'bg-indigo-50' : ''}`}
                                            onPress={() => setSelectedAssignmentId(assignment.id)}
                                        >
                                            <Text className={`font-medium ${selectedAssignmentId === assignment.id ? 'text-indigo-600' : 'text-gray-800'}`}>
                                                {assignment.title}
                                            </Text>
                                            <Text className="text-xs text-gray-500">
                                                Due: {new Date(assignment.due_date).toLocaleDateString()}
                                            </Text>
                                        </TouchableOpacity>
                                    ))
                                )}
                            </View>
                        </View>

                        {/* Submission Title */}
                        <View className="mb-5">
                            <Text className="text-sm font-semibold text-gray-800 mb-2">
                                Submission Title <Text className="text-red-500">*</Text>
                            </Text>
                            <View className="flex-row items-center border border-gray-200 rounded-xl bg-gray-50 px-3">
                                <Text className="text-lg mr-2">📝</Text>
                                <TextInput
                                    className="flex-1 py-3 text-base text-gray-800"
                                    placeholder="Enter submission title"
                                    value={title}
                                    onChangeText={setTitle}
                                />
                            </View>
                        </View>

                        {/* Images Picker */}
                        <View className="mb-5">
                            <Text className="text-sm font-semibold text-gray-800 mb-2">
                                Images (Optional, multiple)
                            </Text>
                            <TouchableOpacity
                                className="flex-row items-center justify-center border border-dashed border-gray-300 rounded-xl bg-gray-50 px-3 py-4 mb-2"
                                onPress={pickImages}
                            >
                                <Text className="text-2xl mr-2">🖼️</Text>
                                <Text className="text-base text-gray-600">Tap to select images</Text>
                            </TouchableOpacity>
                            {selectedImages.map((img, idx) => (
                                <View key={idx} className="flex-row justify-between items-center bg-gray-100 p-2 rounded-lg mt-1">
                                    <Text className="text-sm text-gray-700 flex-1" numberOfLines={1}>{img.name}</Text>
                                    <TouchableOpacity onPress={() => removeImage(idx)}>
                                        <Text className="text-red-500 text-xs font-bold">Remove</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>

                        {/* Submission File */}
                        <View className="mb-5">
                            <Text className="text-sm font-semibold text-gray-800 mb-2">
                                Submission File (PDF/DOC) <Text className="text-red-500">*</Text>
                            </Text>
                            <TouchableOpacity
                                className="flex-row items-center justify-center border border-dashed border-gray-300 rounded-xl bg-gray-50 px-3 py-4"
                                onPress={pickSubmissionFile}
                            >
                                <Text className="text-2xl mr-2">📎</Text>
                                <Text className="text-base text-gray-600">
                                    {selectedFile ? selectedFile.name : 'Tap to select file'}
                                </Text>
                            </TouchableOpacity>
                            {selectedFile && (
                                <View className="mt-2 flex-row justify-between items-center">
                                    <Text className="text-xs text-green-600">✓ File selected</Text>
                                    <TouchableOpacity onPress={() => setSelectedFile(null)}>
                                        <Text className="text-red-500 text-xs">Remove</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        {/* Submit Button */}
                        <TouchableOpacity
                            className="rounded-xl overflow-hidden mt-5"
                            onPress={handleSubmit}
                            disabled={isPending}
                        >
                            <LinearGradient
                                colors={['#667eea', '#764ba2']}
                                className="flex-row justify-center items-center py-4 gap-2"
                            >
                                {isPending ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text className="text-white text-lg font-bold">Submit Assignment →</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
}