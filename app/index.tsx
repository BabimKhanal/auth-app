import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

export default function Index() {
    return (
        <LinearGradient
            colors={['#667eea', '#764ba2']}
            className="flex-1"
        >
            <View className="flex-1 items-center justify-center px-8">
                <Text className="mb-2 text-4xl font-bold text-white">
                    Welcome to MyApp
                </Text>

                <Text className="mb-10 text-lg text-white/80">
                    The best app for you
                </Text>

                <TouchableOpacity
                    className="mb-4 w-full rounded-xl bg-white px-6 py-4"
                    onPress={() => router.push('/auth/login')}
                >
                    <Text className="text-center text-base font-semibold text-[#667eea]">
                        Login
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="w-full rounded-xl border border-white px-6 py-4"
                    onPress={() => router.push('/auth/signup')}
                >
                    <Text className="text-center text-base font-semibold text-white">
                        Sign Up
                    </Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
}