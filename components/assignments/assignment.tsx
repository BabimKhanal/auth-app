// components/assignments/assignment.tsx
import { useAssignments, useTeacherSubjects } from "@/api/assignment/assignment.hooks";
import { useRoleBasedAccess } from "@/hooks/use-Role-Based-Access";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Image,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// Helper to build full image URL (adjust baseURL to your Django server)

export function AssignmentCard() {
    const { isTeacher, isAdmin } = useRoleBasedAccess();

    // Filter state
    const [gradeFilter, setGradeFilter] = useState("");
    const [sectionFilter, setSectionFilter] = useState("");
    const [subjectFilter, setSubjectFilter] = useState("");
    const { data: teacherSubjects } = useTeacherSubjects();

    // Fetch assignments with filters
    const { data: assignments, isLoading, error } = useAssignments({
        grade: gradeFilter ? Number(gradeFilter) : undefined,
        section: sectionFilter,
        subject: subjectFilter,
    });

    const formatDate = (dateString: string) => {
        if (!dateString) return "No date";
        const date = new Date(dateString);
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    };

    const isPastDue = (dueDate: string) => {
        return new Date(dueDate) < new Date();
    };

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center py-10">
                <ActivityIndicator size="large" color="#667eea" />
            </View>
        );
    }

    if (error) {
        return (
            <View className="py-10 items-center">
                <Text className="text-gray-500">Error fetching assignments</Text>
            </View>
        );
    }

    return (
        <View className="flex-1">
            {/* Create Button */}
            {(isTeacher || isAdmin) && (
                <TouchableOpacity
                    className="bg-indigo-500 py-3 rounded-xl items-center mb-4 shadow-sm active:opacity-80"
                    onPress={() => router.push("../assignment/create")}
                >
                    <Text className="text-white font-semibold text-base">+ Create New Assignment</Text>
                </TouchableOpacity>
            )}

            {/* Filter Bar – only for teachers/admins */}
            {(isTeacher || isAdmin) && (
                <View className="flex-row flex-wrap gap-2 mb-4 items-center">
                    <View className="flex-1 bg-gray-100 rounded-lg overflow-hidden min-w-[100px]">
                        <Picker
                            selectedValue={gradeFilter}
                            onValueChange={(val) => setGradeFilter(val)}
                            className="h-10 w-full"
                        >
                            <Picker.Item label="All Grades" value="" />
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                                <Picker.Item key={g} label={`Grade ${g}`} value={String(g)} />
                            ))}
                        </Picker>
                    </View>

                    <View className="flex-1 bg-gray-100 rounded-lg overflow-hidden min-w-[100px]">
                        <Picker
                            selectedValue={sectionFilter}
                            onValueChange={(val) => setSectionFilter(val)}
                            className="h-10 w-full"
                        >
                            <Picker.Item label="All Sections" value="" />
                            {["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"].map((s) => (
                                <Picker.Item key={s} label={`Section ${s}`} value={s} />
                            ))}
                        </Picker>
                    </View>

                    <View className="flex-1 bg-gray-100 rounded-lg overflow-hidden min-w-[100px]">
                        <Picker
                            selectedValue={subjectFilter}
                            onValueChange={(id) => setSubjectFilter(id)}
                            className="h-10 w-full"
                        >
                            <Picker.Item label="All Subjects" value="" />
                            {teacherSubjects?.map((subject: any) => (
                                <Picker.Item key={subject.id} label={subject.subject} value={subject.id} />
                            ))}
                        </Picker>
                    </View>

                    <TouchableOpacity
                        className="bg-gray-300 px-3 py-2 rounded-lg active:opacity-70"
                        onPress={() => {
                            setGradeFilter("");
                            setSectionFilter("");
                            setSubjectFilter("");
                        }}
                    >
                        <Text className="text-gray-700 font-medium">Clear</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Assignment List */}
            {assignments?.length === 0 ? (
                <View className="py-10 items-center bg-white rounded-xl">
                    <Text className="text-gray-400">No assignments yet</Text>
                </View>
            ) : (
                assignments?.map((assignment: any) => {
                    const overdue = isPastDue(assignment.due_date);
                    const submissionPercent = assignment?.submission_percentage;
                    return (
                        <View
                            key={assignment.id}
                            className="bg-white rounded-2xl p-4 mb-4 shadow-md active:opacity-95"
                        >
                            {/* Teacher Row */}
                            <View className="flex-row items-center mb-3">
                                {assignment.teacher_profile ? (
                                    <Image
                                        source={{
                                            uri:
                                                assignment.teacher_profile.startsWith("http")
                                                    ? assignment.teacher_profile
                                                    : `http://[IP_ADDRESS]${assignment.teacher_profile}`,
                                        }}
                                        className="w-10 h-10 rounded-full mr-3"
                                    />
                                ) : (
                                    <View className="w-10 h-10 rounded-full bg-indigo-100 items-center justify-center mr-3">
                                        <Text className="text-indigo-600 font-bold text-lg">
                                            {assignment.teacher?.charAt(0) || "T"}
                                        </Text>
                                    </View>
                                )}
                                <View className="flex-1">
                                    <Text className="text-sm font-semibold text-gray-800">
                                        {assignment.teacher || "Unknown Teacher"}
                                    </Text>
                                    <Text className="text-xs text-gray-500">Teacher</Text>
                                </View>
                                <View className="flex-row gap-1">
                                    <View className="bg-indigo-100 px-2 py-1 rounded-full">
                                        <Text className="text-indigo-700 text-xs font-medium">
                                            Gr. {assignment.grade_level}
                                        </Text>
                                    </View>
                                    <View className="bg-purple-100 px-2 py-1 rounded-full">
                                        <Text className="text-purple-700 text-xs font-medium">
                                            Sec. {assignment.section}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Title & Subject */}
                            <Text className="text-lg font-bold text-gray-800 mb-1">
                                {assignment.title}
                            </Text>
                            {assignment.subject && (
                                <Text className="text-sm text-gray-500 mb-2">
                                    📚 {assignment.subject}
                                </Text>
                            )}
                            <Text className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {assignment.description}
                            </Text>

                            {/* Due Date & Submission Progress */}
                            <View className="flex-row justify-between items-center mb-2">
                                <View className="flex-row items-center">
                                    <Text className="text-sm text-gray-500 mr-1">📅 Due:</Text>
                                    <Text className={`text-sm font-medium ${overdue ? "text-red-500" : "text-gray-700"}`}>
                                        {formatDate(assignment.due_date)}
                                    </Text>
                                </View>
                                <Text className="text-sm text-gray-500">
                                    {assignment.submission_count}/{assignment.total_students} submitted
                                </Text>
                            </View>

                            {/* Progress Bar */}
                            <View className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-4">
                                <View
                                    className="h-full bg-indigo-500 rounded-full"
                                    style={{ width: `${Math.min(submissionPercent, 100)}%` }}
                                />
                            </View>

                            {/* Action Button */}
                            <TouchableOpacity
                                className="py-3 rounded-xl items-center bg-gray-100 active:bg-gray-200"
                                onPress={() => router.push(`/assignment/${assignment.id}`)}
                            >
                                <Text className="text-indigo-600 font-semibold">
                                    {isTeacher || isAdmin ? "View Submissions →" : "View & Submit →"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    );
                })
            )}
        </View>
    );
}