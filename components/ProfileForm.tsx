// app/profile/form.tsx
import { getProfile, updateProfile } from '@/api/auth/user.service';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type FormFields = {
    username: string;
    email: string;
    phone: string;
    address: string;
    gender: string;
    date_of_birth: string;
};

type InputFieldProps = {
    label: string;
    icon: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    keyboardType?: 'default' | 'email-address' | 'phone-pad';
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
};

const INITIAL_FORM: FormFields = {
    username: '',
    email: '',
    phone: '',
    address: '',
    gender: '',
    date_of_birth: '',
};

const GENDER_OPTIONS = ['male', 'female', 'other'] as const;

const getMimeTypeFromUri = (uri: string) => {
    const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
    const mimeTypes: Record<string, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        webp: 'image/webp',
    };
    return mimeTypes[ext] || 'image/jpeg';
};

const buildFormData = async (
    fields: FormFields,
    imageAsset: ImagePicker.ImagePickerAsset | null
) => {
    const formData = new FormData();

    formData.append('username', fields.username.trim());
    formData.append('email', fields.email.trim());
    formData.append('phone', fields.phone.trim());
    formData.append('address', fields.address.trim());
    formData.append('gender', fields.gender.trim());
    formData.append('date_of_birth', fields.date_of_birth.trim());

    if (imageAsset?.uri) {
        const filename = imageAsset.fileName || `profile_${Date.now()}.${imageAsset.uri.split('.').pop() || 'jpg'}`;
        const mimeType = imageAsset.mimeType || getMimeTypeFromUri(imageAsset.uri);

        if (Platform.OS === 'web') {
            // Web: convert URI to Blob
            try {
                const response = await fetch(imageAsset.uri);
                const blob = await response.blob();
                formData.append('profile_picture', blob, filename);
            } catch (error) {
                console.error('Failed to convert image to Blob', error);
                // Fallback: try to use the original file if available
                if (imageAsset.file) {
                    formData.append('profile_picture', imageAsset.file);
                } else {
                    console.warn('No file object available for web upload');
                }
            }
        } else {
            // Mobile: use the object format React Native understands
            formData.append('profile_picture', {
                uri: imageAsset.uri,
                name: filename,
                type: mimeType,
            } as any);
        }
    }

    return formData;
};

function InputField({
    label,
    icon,
    value,
    onChangeText,
    placeholder,
    keyboardType = 'default',
    autoCapitalize = 'sentences',
}: InputFieldProps) {
    return (
        <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-800 mb-2">{label}</Text>
            <View className="flex-row items-center border border-gray-200 rounded-xl bg-gray-50 px-3">
                <Text className="text-lg mr-2">{icon}</Text>
                <TextInput
                    className="flex-1 py-3 text-base text-gray-800"
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder || `Enter ${label.replace(' *', '').toLowerCase()}`}
                    placeholderTextColor="#999"
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                />
            </View>
        </View>
    );
}

export default function ProfileForm() {
    const [userId, setUserId] = useState<number | null>(null);
    const [fields, setFields] = useState<FormFields>(INITIAL_FORM);
    const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
    const [selectedImageAsset, setSelectedImageAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
    const [fetching, setFetching] = useState(true);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        try {
            setFetching(true);
            const userData = await getProfile();
            if (!userData) return;

            setUserId(userData.id);
            setFields({
                username: userData.username || '',
                email: userData.email || '',
                phone: userData.phone || '',
                address: userData.address || '',
                gender: userData.gender || '',
                date_of_birth: userData.date_of_birth || '',
            });
            setProfileImageUri(userData.profile_picture || null);
        } catch (error) {
            console.error('Error loading profile:', error);
            Alert.alert('Error', 'Failed to load profile');
        } finally {
            setFetching(false);
        }
    };

    const setField = (key: keyof FormFields, value: string) => {
        setFields((prev) => ({ ...prev, [key]: value }));
    };

    const handleImagePick = async () => {
        try {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (permission.status !== 'granted') {
                Alert.alert('Permission needed', 'Please grant access to your photos');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (result.canceled || !result.assets?.length) return;

            const asset = result.assets[0];
            setSelectedImageAsset(asset);
            setProfileImageUri(asset.uri);
        } catch (error) {
            console.error('Image picker error:', error);
            Alert.alert('Error', 'Failed to select image');
        }
    };

    const handleUpdate = async () => {
        if (!fields.username.trim() || !fields.email.trim()) {
            Alert.alert('Error', 'Username and email are required');
            return;
        }

        if (!userId) {
            Alert.alert('Error', 'User ID not found');
            return;
        }

        try {
            setLoading(true);
            const formData = await buildFormData(fields, selectedImageAsset);
            const result = await updateProfile(formData);

            if (result?.success) {
                Alert.alert('Success', 'Profile updated successfully');
                router.navigate('/(tabs)/settings');
                return;
            }

            Alert.alert('Error', result?.error || 'Update failed');
        } catch (error) {
            console.error('Update error:', error);
            Alert.alert('Error', 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
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

                        <Text className="text-xl font-bold text-white">Edit Profile</Text>

                        <View className="w-10" />
                    </View>

                    {/* Profile Image Section */}
                    <View className="items-center mb-8">
                        <TouchableOpacity className="relative" onPress={handleImagePick}>
                            {profileImageUri ? (
                                <Image
                                    source={{ uri: profileImageUri }}
                                    className="w-32 h-32 rounded-full border-3 border-white"
                                    resizeMode="cover"
                                />
                            ) : (
                                <View className="w-32 h-32 rounded-full bg-white/30 justify-center items-center border-3 border-white">
                                    <Text className="text-5xl text-white font-bold">
                                        {fields.username?.charAt(0)?.toUpperCase() || 'U'}
                                    </Text>
                                </View>
                            )}

                            <View className="absolute bottom-1 right-1 bg-white rounded-full w-9 h-9 justify-center items-center shadow-lg">
                                <Text className="text-lg">📷</Text>
                            </View>
                        </TouchableOpacity>

                        <Text className="text-xs text-white/80 mt-2">Tap to change profile photo</Text>
                    </View>

                    {/* Form Container */}
                    <View className="bg-white rounded-t-3xl px-5 pb-10 pt-6">
                        <InputField
                            label="Username *"
                            icon="👤"
                            value={fields.username}
                            onChangeText={(value) => setField('username', value)}
                        />

                        <InputField
                            label="Email *"
                            icon="📧"
                            value={fields.email}
                            onChangeText={(value) => setField('email', value)}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <InputField
                            label="Phone"
                            icon="📱"
                            value={fields.phone}
                            onChangeText={(value) => setField('phone', value)}
                            keyboardType="phone-pad"
                        />

                        <InputField
                            label="Address"
                            icon="📍"
                            value={fields.address}
                            onChangeText={(value) => setField('address', value)}
                        />

                        <InputField
                            label="Date of Birth"
                            icon="🎂"
                            value={fields.date_of_birth}
                            onChangeText={(value) => setField('date_of_birth', value)}
                            placeholder="YYYY-MM-DD"
                        />

                        {/* Gender Selection */}
                        <View className="mb-5">
                            <Text className="text-sm font-semibold text-gray-800 mb-2">Gender</Text>
                            <View className="flex-row gap-3">
                                {GENDER_OPTIONS.map((gender) => {
                                    const isActive = fields.gender === gender;
                                    return (
                                        <TouchableOpacity
                                            key={gender}
                                            className={`flex-1 py-3 rounded-lg items-center ${isActive ? 'bg-[#667eea]' : 'bg-gray-100'}`}
                                            onPress={() => setField('gender', gender)}
                                        >
                                            <Text className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-600'}`}>
                                                {gender.charAt(0).toUpperCase() + gender.slice(1)}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        {/* Update Button */}
                        <TouchableOpacity
                            className="rounded-xl overflow-hidden mt-5"
                            onPress={handleUpdate}
                            disabled={loading}
                        >
                            <LinearGradient
                                colors={['#667eea', '#764ba2']}
                                className="py-4 items-center"
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text className="text-white text-lg font-bold">Update Profile</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
}