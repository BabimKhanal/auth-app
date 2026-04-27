// app/assignment/details.tsx
import { useAssignment } from "@/api/assignment/assignment.hooks";
import { API_URL } from "@/config/api";
import { useRoleBasedAccess } from "@/hooks/use-Role-Based-Access";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SubmissionsList from "../../../components/assignments/submissionList";



const getFullImageUrl = (path: string) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${API_URL}${path}`;
};

export default function AssignmentDetails() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { data: assignment, isLoading, error } = useAssignment(id);
    const { isTeacher } = useRoleBasedAccess();
    const insets = useSafeAreaInsets();

    const formatDate = (dateString: string) => {
        if (!dateString) return "Not set";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const isPastDue = assignment?.due_date && new Date(assignment.due_date) < new Date();

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-100">
                <ActivityIndicator size="large" color="#667eea" />
                <Text className="text-gray-500 mt-4">Loading assignment…</Text>
            </View>
        );
    }

    if (error || !assignment) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-100 px-5">
                <Text className="text-red-500 text-lg text-center">Failed to load assignment</Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mt-6 bg-indigo-500 py-3 px-6 rounded-full"
                    activeOpacity={0.8}
                >
                    <Text className="text-white font-semibold">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const teacherName = assignment.teacher || "Teacher";
    const teacherAvatar = getFullImageUrl(assignment.teacher_profile);
    const teacherId = assignment.teacher_id;

    const subject = assignment.subject || "No subject";

    return (
        <ScrollView
            className="flex-1 bg-gray-100"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        >
            {/* Gradient Header */}
            <LinearGradient
                colors={["#667eea", "#764ba2"]}
                className="pt-12 pb-6 px-5"
                style={{ paddingTop: insets.top + 16 }}
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mb-5 self-start p-2 -ml-2"
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Text className="text-white text-lg font-medium">← Back</Text>
                </TouchableOpacity>
                <Text className="text-2xl font-bold text-white leading-8">{assignment.title}</Text>
                <View className="flex-row items-center mt-2">
                    <Text className="text-white/80">Due: </Text>
                    <Text className={`font-semibold ${isPastDue ? "text-red-300" : "text-white"}`}>
                        {formatDate(assignment.due_date)}
                    </Text>
                </View>
            </LinearGradient>

            {/* Content Card */}
            <View className="bg-white rounded-t-3xl px-5 py-6 shadow-sm">
                {/* Description */}
                <View className="mb-6">
                    <Text className="text-lg font-bold text-gray-800 mb-2">📄 Description</Text>
                    <Text className="text-gray-600 leading-6">
                        {assignment.description?.trim() || "No description provided."}
                    </Text>
                </View>

                {/* Teacher Info Card */}
                <View className="mb-6">
                    <Text className="text-lg font-bold text-gray-800 mb-3">👨‍🏫 Teacher</Text>
                    <View className="bg-gray-50 rounded-2xl p-4 flex-row items-center">
                        {teacherAvatar ? (
                            <Image
                                source={{
                                    uri: teacherAvatar,
                                }}
                                className="w-12 h-12 rounded-full mr-4"
                                resizeMode="cover"
                            />
                        ) : (
                            <View className="w-10 h-10 rounded-full bg-indigo-100 items-center justify-center mr-3">
                                <Text className="text-indigo-600 font-bold text-lg">
                                    {assignment.teacher?.charAt(0) || "T"}
                                </Text>
                            </View>
                        )}
                        <View className="flex-1">
                            <Text className="font-semibold text-gray-800 text-base">{teacherName}</Text>
                            <Text className="text-gray-500 text-sm">Subject: {subject}</Text>
                        </View>
                        {/* add message and button */}
                        <TouchableOpacity
                            onPress={() => router.push(`/message/${teacherId}`)}
                            className="ml-3 p-2 bg-indigo-500 border border-gray-200 rounded-full"
                        >
                            <Text className="text-white font-bold">💬 Message</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Details Grid */}
                <View className="mb-6">
                    <Text className="text-lg font-bold text-gray-800 mb-3">📋 Details</Text>
                    <View className="bg-gray-50 rounded-2xl p-4">
                        <View className="flex-row justify-between items-center mb-3">
                            <Text className="text-gray-500">Grade Level</Text>
                            <Text className="font-semibold text-gray-800">{assignment.grade_level || "—"}</Text>
                        </View>
                        <View className="flex-row justify-between items-center mb-3">
                            <Text className="text-gray-500">Section</Text>
                            <Text className="font-semibold text-gray-800">{assignment.section || "—"}</Text>
                        </View>
                        <View className="flex-row justify-between items-center">
                            <Text className="text-gray-500">Created</Text>
                            <Text className="font-semibold text-gray-800">{formatDate(assignment.created_at)}</Text>
                        </View>
                    </View>
                </View>

                {/* Attachments */}
                {(assignment.assignment_file || assignment.images) && (
                    <View className="mb-6">
                        <Text className="text-lg font-bold text-gray-800 mb-3">📎 Attachments</Text>
                        {assignment.assignment_file && (
                            <TouchableOpacity
                                className="flex-row items-center bg-gray-100 p-4 rounded-2xl mb-3 active:bg-gray-200"
                                activeOpacity={0.7}
                                onPress={() => {
                                    // TODO: implement download / preview
                                    console.log("Download file", assignment.assignment_file);
                                }}
                            >
                                <Text className="text-indigo-500 text-xl mr-3">📄</Text>
                                <Text className="text-indigo-600 flex-1 font-medium" numberOfLines={1}>
                                    {assignment.assignment_file.split("/").pop()}
                                </Text>
                                <Text className="text-gray-400 text-sm">Download</Text>
                            </TouchableOpacity>
                        )}
                        {assignment.images && (
                            <TouchableOpacity
                                className="flex-row items-center bg-gray-100 p-4 rounded-2xl active:bg-gray-200"
                                activeOpacity={0.7}
                                onPress={() => {
                                    // TODO: implement preview
                                    console.log("View image", assignment.images);
                                }}
                            >
                                <Text className="text-indigo-500 text-xl mr-3">🖼️</Text>
                                <Text className="text-indigo-600 flex-1 font-medium" numberOfLines={1}>
                                    {assignment.images.split("/").pop()}
                                </Text>
                                <Text className="text-gray-400 text-sm">View</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {/* Action Button */}
                <View className="mt-2">
                    {isTeacher ? (
                        <TouchableOpacity
                            className="bg-indigo-500 py-4 rounded-2xl items-center active:bg-indigo-600"
                            activeOpacity={0.8}
                            onPress={() => router.push(`/assignment/submissions/${assignment.id}`)}
                        >
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            className={`py-4 rounded-2xl items-center ${isPastDue ? "bg-gray-400" : "bg-indigo-500 active:bg-indigo-600"
                                }`}
                            activeOpacity={0.8}
                            onPress={() => router.push(`/assignment/submit?assignmentId=${assignment.id}`)}
                            disabled={isPastDue}
                        >
                            <Text className="text-white font-bold text-base">
                                {isPastDue ? "Submission Closed" : "Submit Assignment →"}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Past due warning for students */}
                {!isTeacher && isPastDue && (
                    <Text className="text-red-500 text-center text-sm mt-4">
                        ⚠️ The due date has passed. Submissions are no longer accepted.
                    </Text>
                )}
                <View>
                    {isTeacher && (
                        <SubmissionsList />
                    )}
                </View>
            </View>
        </ScrollView>
    );
}