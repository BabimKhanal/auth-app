import { useAuth } from "@/hooks/useAuth";
import { router } from "expo-router";
import { useState } from "react";
import { Image, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

export default function SettingsScreen() {
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [emailUpdates, setEmailUpdates] = useState(true);
    const logout = useAuth().logout;
    const { user } = useAuth();

    const handleLogout = () => {
        // Alert.alert(
        //     'Logout',
        //     'Are you sure you want to logout?',
        //     [
        //         { text: 'Cancel', style: 'cancel' },
        //         { text: 'Logout', style: 'destructive', onPress: () => router.push("/auth/login") },
        //     ]
        // );
        logout();
        router.push("/auth/login");
    };

    const SettingItem = ({ icon, title, subtitle, children }: { icon: string, title: string, subtitle: string, children: React.ReactNode }) => (
        <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>{icon}</Text>
                <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>{title}</Text>
                    {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
                </View>
            </View>
            {children}
        </View>
    );

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Settings</Text>
                <Text style={styles.headerSubtitle}>Manage your preferences</Text>
            </View>

            {/* Profile Section */}
            <View style={styles.profileSection}>
                <View style={styles.profileImage}>
                    <Image
                        source={{ uri: user?.profile_picture }}
                        style={{ width: 80, height: 80, borderRadius: 50 }} // Add dimensions!
                    />
                </View>
                <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>{user?.username}</Text>
                    <Text style={styles.profileEmail}>{user?.email}</Text>
                    <TouchableOpacity onPress={() => router.push("/profile")} style={styles.editButton}>
                        <Text style={styles.editButtonText}>Edit Profile</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Preferences Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Preferences</Text>

                <SettingItem icon="🔔" title="Push Notifications" subtitle="Receive notifications">
                    <Switch
                        value={notifications}
                        onValueChange={setNotifications}
                        trackColor={{ false: '#ccc', true: '#1D3D47' }}
                        thumbColor={notifications ? '#fff' : '#f4f3f4'}
                    />
                </SettingItem>



                <SettingItem icon="📧" title="Email Updates" subtitle="Receive newsletters">
                    <Switch
                        value={emailUpdates}
                        onValueChange={setEmailUpdates}
                        trackColor={{ false: '#ccc', true: '#1D3D47' }}
                        thumbColor={emailUpdates ? '#fff' : '#f4f3f4'}
                    />
                </SettingItem>
            </View>

            {/* Account Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account</Text>

                <TouchableOpacity style={styles.menuItem}>
                    <View style={styles.menuLeft}>
                        <Text style={styles.menuIcon}>🔐</Text>
                        <Text style={styles.menuText}>Change Password</Text>
                    </View>
                    <Text style={styles.arrow}>→</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <View style={styles.menuLeft}>
                        <Text style={styles.menuIcon}>📱</Text>
                        <Text style={styles.menuText}>Phone Number</Text>
                    </View>
                    <Text style={styles.arrow}>→</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <View style={styles.menuLeft}>
                        <Text style={styles.menuIcon}>🌐</Text>
                        <Text style={styles.menuText}>Language</Text>
                    </View>
                    <View style={styles.menuRight}>
                        <Text style={styles.menuValue}>English</Text>
                        <Text style={styles.arrow}>→</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Support Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Support</Text>

                <TouchableOpacity style={styles.menuItem}>
                    <View style={styles.menuLeft}>
                        <Text style={styles.menuIcon}>❓</Text>
                        <Text style={styles.menuText}>Help Center</Text>
                    </View>
                    <Text style={styles.arrow}>→</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <View style={styles.menuLeft}>
                        <Text style={styles.menuIcon}>💬</Text>
                        <Text style={styles.menuText}>Contact Us</Text>
                    </View>
                    <Text style={styles.arrow}>→</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <View style={styles.menuLeft}>
                        <Text style={styles.menuIcon}>⭐</Text>
                        <Text style={styles.menuText}>Rate App</Text>
                    </View>
                    <Text style={styles.arrow}>→</Text>
                </TouchableOpacity>
            </View>

            {/* About Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>About</Text>

                <View style={styles.menuItem}>
                    <View style={styles.menuLeft}>
                        <Text style={styles.menuIcon}>ℹ️</Text>
                        <Text style={styles.menuText}>Version</Text>
                    </View>
                    <Text style={styles.menuValue}>1.0.0</Text>
                </View>

                <TouchableOpacity style={styles.menuItem}>
                    <View style={styles.menuLeft}>
                        <Text style={styles.menuIcon}>📄</Text>
                        <Text style={styles.menuText}>Privacy Policy</Text>
                    </View>
                    <Text style={styles.arrow}>→</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <View style={styles.menuLeft}>
                        <Text style={styles.menuIcon}>📜</Text>
                        <Text style={styles.menuText}>Terms of Service</Text>
                    </View>
                    <Text style={styles.arrow}>→</Text>
                </TouchableOpacity>
            </View>

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>

            {/* Footer */}
            <Text style={styles.footer}>© 2024 TeacherStudent App</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#1D3D47',
        paddingTop: 60,
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.9,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        margin: 20,
        padding: 15,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#1D3D47',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    profileImageText: {
        fontSize: 30,
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 2,
    },
    profileEmail: {
        fontSize: 13,
        color: '#666',
        marginBottom: 8,
    },
    editButton: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    editButtonText: {
        fontSize: 11,
        color: '#1D3D47',
        fontWeight: '600',
    },
    section: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 15,
        paddingVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        paddingHorizontal: 15,
        paddingTop: 12,
        paddingBottom: 8,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    settingIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    settingText: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 15,
        fontWeight: '500',
        color: '#333',
        marginBottom: 2,
    },
    settingSubtitle: {
        fontSize: 12,
        color: '#999',
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    menuText: {
        fontSize: 15,
        color: '#333',
    },
    menuRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    menuValue: {
        fontSize: 14,
        color: '#999',
    },
    arrow: {
        fontSize: 16,
        color: '#ccc',
    },
    logoutButton: {
        backgroundColor: '#ff4444',
        marginHorizontal: 20,
        marginTop: 10,
        marginBottom: 20,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        textAlign: 'center',
        fontSize: 12,
        color: '#999',
        marginBottom: 30,
    },
});