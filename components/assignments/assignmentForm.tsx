// app/assignment/create.tsx (WEB + MOBILE COMPATIBLE)
import { useTeacherSubjects, useCreateAssignment } from '@/api/assignment/assignment.hooks';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
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
    View
} from 'react-native';

export default function AssignmentForm() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [gradeLevel, setGradeLevel] = useState('');
    const [section, setSection] = useState('');
    const [dueDate, setDueDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [loading, setLoading] = useState(false);
    const [subject, setSubject] = useState('');
    const { data: teacherSubjects } = useTeacherSubjects()
    const { mutate: createAssignment, isPending: isCreating } = useCreateAssignment();

    // File states
    const [selectedImage, setSelectedImage] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
    const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

    // Pick image
    const pickImage = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
                copyToCacheDirectory: true,
            });

            if (result.canceled === false && result.assets?.[0]) {
                setSelectedImage(result.assets[0]);
                console.log('✅ Selected image:', result.assets[0].name);
            }
        } catch (error) {
            console.error('❌ Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    // Pick assignment file
    const pickFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
                copyToCacheDirectory: true,
            });

            if (result.canceled === false && result.assets?.[0]) {
                setSelectedFile(result.assets[0]);
                console.log('✅ Selected file:', result.assets[0].name);
            }
        } catch (error) {
            console.error('❌ Error picking file:', error);
            Alert.alert('Error', 'Failed to pick file');
        }
    };

    // ✅ Create FormData based on platform
    const createFormData = async () => {
        const formData = new FormData();

        // Text fields
        formData.append('title', title.trim());
        formData.append('description', description.trim());
        formData.append('grade_level', gradeLevel);
        formData.append('subject', subject);

        if (section) {
            formData.append('section', section);
        }

        formData.append('due_date', dueDate.toISOString());

        if (Platform.OS === 'web') {
            if (selectedImage) {
                const response = await fetch(selectedImage.uri);
                const blob = await response.blob();
                const file = new File([blob], selectedImage.name, { type: selectedImage.mimeType || 'image/jpeg' });
                formData.append('images', file);
                console.log('📸 [WEB] Appending image:', selectedImage.name);
            }

            if (selectedFile) {
                const response = await fetch(selectedFile.uri);
                const blob = await response.blob();
                const file = new File([blob], selectedFile.name, { type: selectedFile.mimeType || 'application/pdf' });
                formData.append('assignment_file', file);
                console.log('📄 [WEB] Appending file:', selectedFile.name);
            }
        } else {
            // MOBILE: Use the React Native format
            if (selectedImage) {
                const imageExtension = selectedImage.name.split('.').pop() || 'jpg';
                const imageMimeType = selectedImage.mimeType || `image/${imageExtension}`;

                formData.append('images', {
                    uri: selectedImage.uri,
                    name: selectedImage.name || `image.${imageExtension}`,
                    type: imageMimeType,
                } as any);

                console.log('📸 [MOBILE] Appending image:', selectedImage.name);
            }

            if (selectedFile) {
                const fileExtension = selectedFile.name.split('.').pop() || 'pdf';
                let fileMimeType = selectedFile.mimeType;

                if (!fileMimeType) {
                    if (fileExtension === 'pdf') fileMimeType = 'application/pdf';
                    else if (fileExtension === 'doc') fileMimeType = 'application/msword';
                    else if (fileExtension === 'docx') fileMimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                    else fileMimeType = 'application/octet-stream';
                }

                formData.append('assignment_file', {
                    uri: selectedFile.uri,
                    name: selectedFile.name || `document.${fileExtension}`,
                    type: fileMimeType,
                } as any);

                console.log('📄 [MOBILE] Appending file:', selectedFile.name);
            }
        }

        return formData;
    };

    const handleSubmit = async () => {
        // Validation
        if (!title.trim() || !description.trim() || !gradeLevel) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        setLoading(true);
        try {
            const formData = await createFormData();

            // Debug logging (platform-safe)
            console.log('\n' + '='.repeat(50));
            console.log('📤 Sending to Django:');
            console.log(`  Platform: ${Platform.OS}`);
            console.log(`  Title: ${title}`);
            console.log(`  Grade: ${gradeLevel}`);
            console.log(`  Has image: ${selectedImage ? 'Yes (' + selectedImage.name + ')' : 'No'}`);
            console.log(`  Has file: ${selectedFile ? 'Yes (' + selectedFile.name + ')' : 'No'}`);
            console.log('='.repeat(50) + '\n');

            // Send to backend
            createAssignment(formData, {
                onSuccess: () => {
                    Alert.alert('Success', 'Assignment created successfully!', [
                        { text: 'OK', onPress: () => router.back() }
                    ]);
                },
                onError: (error: any) => {
                    console.error('Error creating assignment:', error);
                    Alert.alert('Error', error.response?.data?.message || 'Failed to create assignment');
                },
            });

            // console.log('✅ Success:', response.data);

            Alert.alert(
                'Success',
                'Assignment created successfully!',
                [{ text: 'OK', onPress: () => router.back() }]
            );

        } catch (error: any) {
            console.error('❌ Error:', error.response?.data || error.message);

            // Better error display
            let errorMessage = 'Failed to create assignment';

            if (error.response?.data) {
                const data = error.response.data;
                if (data.errors) {
                    errorMessage = JSON.stringify(data.errors, null, 2);
                } else if (data.message) {
                    errorMessage = data.message;
                } else if (data.error) {
                    errorMessage = data.error;
                }
            }

            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDueDate(selectedDate);
        }
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    const sections = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

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
                        <Text className="text-xl font-bold text-white">Create Assignment</Text>
                        <View className="w-10" />
                    </View>

                    {/* Form Container */}
                    <View className="bg-white rounded-t-3xl px-5 pb-10 pt-6">
                        {/* Platform Info (Debug) */}
                        {__DEV__ && (
                            <View className="mb-4 p-2 bg-blue-50 rounded-lg">
                                <Text className="text-xs text-blue-600">
                                    Platform: {Platform.OS} | Version: {Platform.Version}
                                </Text>
                            </View>
                        )}

                        {/* Title Input */}
                        <View className="mb-5">
                            <Text className="text-sm font-semibold text-gray-800 mb-2">
                                Assignment Title <Text className="text-red-500">*</Text>
                            </Text>
                            <View className="flex-row items-center border border-gray-200 rounded-xl bg-gray-50 px-3">
                                <Text className="text-lg mr-2">📝</Text>
                                <TextInput
                                    className="flex-1 py-3 text-base text-gray-800"
                                    placeholder="Enter assignment title"
                                    placeholderTextColor="#999"
                                    value={title}
                                    onChangeText={setTitle}
                                />
                            </View>
                        </View>

                        {/* Description Input */}
                        <View className="mb-5">
                            <Text className="text-sm font-semibold text-gray-800 mb-2">
                                Description <Text className="text-red-500">*</Text>
                            </Text>
                            <View className="border border-gray-200 rounded-xl bg-gray-50 px-3">
                                <TextInput
                                    className="py-3 text-base text-gray-800 min-h-[100px]"
                                    placeholder="Enter assignment description"
                                    placeholderTextColor="#999"
                                    value={description}
                                    onChangeText={setDescription}
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                />
                            </View>
                        </View>

                        <View className="mb-5">
                            <Text className="text-sm font-semibold text-gray-800 mb-2">
                                Subject <Text className="text-red-500">*</Text>
                            </Text>
                            <View className="border border-gray-200 rounded-xl bg-gray-50 px-3">
                                <Picker
                                    selectedValue={subject}
                                    onValueChange={(val) => setSubject(val)}
                                    className="h-12"
                                >
                                    <Picker.Item label="Select Subject" value="" />
                                    {teacherSubjects?.map((subject: any) => {
                                        return (
                                            <Picker.Item key={subject.id} label={subject.subject} value={subject.id} />
                                        )
                                    })}
                                </Picker>
                            </View>
                        </View>

                        {/* Image Picker */}
                        <View className="mb-5">
                            <Text className="text-sm font-semibold text-gray-800 mb-2">
                                Assignment Image (Optional)
                            </Text>
                            <TouchableOpacity
                                className="flex-row items-center justify-center border border-dashed border-gray-300 rounded-xl bg-gray-50 px-3 py-4"
                                onPress={pickImage}
                                activeOpacity={0.7}
                            >
                                <Text className="text-2xl mr-2">🖼️</Text>
                                <Text className="text-base text-gray-600 flex-1" numberOfLines={1}>
                                    {selectedImage ? selectedImage.name : 'Tap to select image'}
                                </Text>
                            </TouchableOpacity>
                            {selectedImage && (
                                <View className="mt-2 flex-row justify-between items-center bg-green-50 px-3 py-2 rounded-lg">
                                    <Text className="text-xs text-green-700 flex-1">
                                        ✓ {selectedImage.name}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => setSelectedImage(null)}
                                        className="ml-2"
                                    >
                                        <Text className="text-red-500 text-xs font-semibold">Remove</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        {/* File Picker */}
                        <View className="mb-5">
                            <Text className="text-sm font-semibold text-gray-800 mb-2">
                                Assignment File (PDF, DOC) - Optional
                            </Text>
                            <TouchableOpacity
                                className="flex-row items-center justify-center border border-dashed border-gray-300 rounded-xl bg-gray-50 px-3 py-4"
                                onPress={pickFile}
                                activeOpacity={0.7}
                            >
                                <Text className="text-2xl mr-2">📎</Text>
                                <Text className="text-base text-gray-600 flex-1" numberOfLines={1}>
                                    {selectedFile ? selectedFile.name : 'Tap to select file'}
                                </Text>
                            </TouchableOpacity>
                            {selectedFile && (
                                <View className="mt-2 flex-row justify-between items-center bg-green-50 px-3 py-2 rounded-lg">
                                    <Text className="text-xs text-green-700 flex-1">
                                        ✓ {selectedFile.name}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => setSelectedFile(null)}
                                        className="ml-2"
                                    >
                                        <Text className="text-red-500 text-xs font-semibold">Remove</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        {/* Grade Level */}
                        <View className="mb-5">
                            <Text className="text-sm font-semibold text-gray-800 mb-2">
                                Grade Level <Text className="text-red-500">*</Text>
                            </Text>
                            <View className="flex-row flex-wrap gap-2">
                                {grades.map((grade) => (
                                    <TouchableOpacity
                                        key={grade}
                                        className={`px-4 py-2 rounded-full ${gradeLevel === grade
                                            ? 'bg-indigo-500'
                                            : 'bg-gray-100'
                                            }`}
                                        onPress={() => setGradeLevel(grade)}
                                        activeOpacity={0.7}
                                    >
                                        <Text
                                            className={`text-sm font-medium ${gradeLevel === grade
                                                ? 'text-white'
                                                : 'text-gray-600'
                                                }`}
                                        >
                                            {grade}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Section */}
                        <View className="mb-5">
                            <Text className="text-sm font-semibold text-gray-800 mb-2">
                                Section (Optional)
                            </Text>
                            <View className="flex-row flex-wrap gap-3">
                                {sections.map((sec) => (
                                    <TouchableOpacity
                                        key={sec}
                                        className={`w-12 h-12 rounded-full justify-center items-center ${section === sec
                                            ? 'bg-indigo-500'
                                            : 'bg-gray-100'
                                            }`}
                                        onPress={() => setSection(sec)}
                                        activeOpacity={0.7}
                                    >
                                        <Text
                                            className={`text-lg font-semibold ${section === sec
                                                ? 'text-white'
                                                : 'text-gray-600'
                                                }`}
                                        >
                                            {sec}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Due Date */}
                        <View className="mb-5">
                            <Text className="text-sm font-semibold text-gray-800 mb-2">
                                Due Date <Text className="text-red-500">*</Text>
                            </Text>

                            {Platform.OS === 'web' ? (
                                <input
                                    type="date"
                                    value={dueDate.toISOString().split('T')[0]}
                                    onChange={(e) => setDueDate(new Date(e.target.value))}
                                    className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-800"
                                />
                            ) : (
                                <>
                                    <TouchableOpacity
                                        className="flex-row items-center border border-gray-200 rounded-xl bg-gray-50 px-3 py-3"
                                        onPress={() => setShowDatePicker(true)}
                                        activeOpacity={0.7}
                                    >
                                        <Text className="text-lg mr-2">📅</Text>
                                        <Text className="text-base text-gray-800">
                                            {formatDate(dueDate)}
                                        </Text>
                                    </TouchableOpacity>

                                    {showDatePicker && (
                                        <DateTimePicker
                                            value={dueDate}
                                            mode="date"
                                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                            onChange={onDateChange}
                                            minimumDate={new Date()}
                                        />
                                    )}
                                </>
                            )}
                        </View>

                        {/* Submit Button */}
                        <TouchableOpacity
                            className="rounded-xl overflow-hidden mt-5"
                            onPress={handleSubmit}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={loading ? ['#9ca3af', '#6b7280'] : ['#667eea', '#764ba2']}
                                className="flex-row justify-center items-center py-4 gap-2"
                            >
                                {loading ? (
                                    <>
                                        <ActivityIndicator color="#fff" />
                                        <Text className="text-white text-base font-semibold ml-2">
                                            Creating...
                                        </Text>
                                    </>
                                ) : (
                                    <>
                                        <Text className="text-white text-lg font-bold">
                                            Create Assignment
                                        </Text>
                                        <Text className="text-white text-lg font-bold">→</Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
}