// app/auth/login.tsx (Enhanced with animations)
import { loginUser } from '@/api/auth/user.service';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useState(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();
    },);

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        try {
            setLoading(true);
            const response = await loginUser({ email: email.trim(), password });

            if (response?.success) {
                router.replace('/(tabs)/dashboard');
                return;
            }

            Alert.alert('Login failed', response?.error || 'Unable to sign in');
        } catch (error) {
            console.error('Login error:', error);
            Alert.alert('Error', 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            className="flex-1"
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View className="flex-1">
                    <LinearGradient
                        colors={['#667eea', '#764ba2']}
                        className="flex-1"
                    >
                        <View className="flex-1 justify-center px-6">
                            <Animated.View
                                style={{
                                    opacity: fadeAnim,
                                    transform: [{ translateY: slideAnim }],
                                }}
                                className="items-center mb-12"
                            >
                                <View className="w-24 h-24 rounded-3xl bg-white/20 justify-center items-center mb-4">
                                    <Text className="text-5xl">📚</Text>
                                </View>
                                <Text className="text-4xl font-extrabold text-white mb-2 text-center">
                                    TeacherStudent
                                </Text>
                                <Text className="text-base text-white/80 text-center">
                                    Connect, Learn & Grow Together
                                </Text>
                            </Animated.View>

                            <Animated.View
                                style={{
                                    opacity: fadeAnim,
                                    transform: [{ translateY: slideAnim }],
                                }}
                            >
                                <View className="bg-white rounded-3xl p-6 shadow-xl">
                                    {/* Email Field */}
                                    <View className="mb-5">
                                        <Text className="text-sm font-semibold text-gray-700 mb-2">
                                            Email Address
                                        </Text>
                                        <View className="flex-row items-center bg-gray-50 rounded-2xl border border-gray-200 px-4">
                                            <Text className="text-lg mr-2">📧</Text>
                                            <TextInput
                                                className="flex-1 py-4 text-base text-gray-900"
                                                placeholder="Enter your email"
                                                placeholderTextColor="#94A3B8"
                                                keyboardType="email-address"
                                                autoCapitalize="none"
                                                value={email}
                                                onChangeText={setEmail}
                                            />
                                        </View>
                                    </View>

                                    {/* Password Field */}
                                    <View className="mb-3">
                                        <Text className="text-sm font-semibold text-gray-700 mb-2">
                                            Password
                                        </Text>
                                        <View className="flex-row items-center bg-gray-50 rounded-2xl border border-gray-200 px-4">
                                            <Text className="text-lg mr-2">🔒</Text>
                                            <TextInput
                                                className="flex-1 py-4 text-base text-gray-900"
                                                placeholder="Enter your password"
                                                placeholderTextColor="#94A3B8"
                                                secureTextEntry={!showPassword}
                                                value={password}
                                                onChangeText={setPassword}
                                            />
                                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                                <Text className="text-sm font-medium text-indigo-600">
                                                    {showPassword ? 'Hide' : 'Show'}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {/* Options Row */}
                                    <View className="flex-row justify-between items-center mb-6">
                                        <TouchableOpacity className="flex-row items-center">
                                            <View className="w-4 h-4 border border-gray-300 rounded mr-2" />
                                            <Text className="text-xs text-gray-500">Remember me</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity>
                                            <Text className="text-sm font-medium text-indigo-600">
                                                Forgot Password?
                                            </Text>
                                        </TouchableOpacity>
                                    </View>

                                    {/* Login Button */}
                                    <TouchableOpacity
                                        className="overflow-hidden rounded-2xl mb-4"
                                        onPress={handleLogin}
                                        disabled={loading}
                                    >
                                        <LinearGradient
                                            colors={['#667eea', '#764ba2']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            className="py-4 items-center"
                                        >
                                            {loading ? (
                                                <ActivityIndicator color="#fff" />
                                            ) : (
                                                <Text className="text-base font-bold text-white">
                                                    Sign In
                                                </Text>
                                            )}
                                        </LinearGradient>
                                    </TouchableOpacity>

                                    {/* Divider */}
                                    <View className="flex-row items-center my-4">
                                        <View className="flex-1 h-px bg-gray-200" />
                                        <Text className="mx-4 text-xs text-gray-400">OR</Text>
                                        <View className="flex-1 h-px bg-gray-200" />
                                    </View>

                                    {/* Demo Account */}
                                    <View className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                                        <Text className="text-xs text-blue-600 text-center font-medium mb-1">
                                            Demo Account
                                        </Text>
                                        <Text className="text-xs text-gray-500 text-center">
                                            Email: test@admin.com / Password: admin123
                                        </Text>
                                    </View>

                                    {/* Sign Up Link */}
                                    <View className="flex-row justify-center mt-2">
                                        <Text className="text-sm text-gray-500">
                                            Don't have an account?{' '}
                                        </Text>
                                        <TouchableOpacity onPress={() => router.push('/auth/signup')}>
                                            <Text className="text-sm font-bold text-indigo-600">
                                                Create Account
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Footer */}
                                <Text className="text-center text-white/60 text-xs mt-6">
                                    By continuing, you agree to our Terms & Conditions
                                </Text>
                            </Animated.View>
                        </View>
                    </LinearGradient>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}