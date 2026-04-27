// components/assignments/SubmissionsList.tsx
import { useAssignmentSubmissions, useGradeSubmission } from '@/api/assignment/assignment.hooks';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function SubmissionsList() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const assignmentId = parseInt(id, 10);
    const { data: submissions, isLoading, error } = useAssignmentSubmissions(assignmentId);
    const { mutate: gradeSubmission } = useGradeSubmission();

    const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
    const [marks, setMarks] = useState('');
    const [feedback, setFeedback] = useState('');
    const [modalVisible, setModalVisible] = useState(false);

    const handleGrade = (submission: any) => {
        setSelectedSubmission(submission);
        setMarks(submission.marks_obtained?.toString() || '');
        setFeedback(submission.feedback || '');
        setModalVisible(true);
    };

    const handleSubmitGrade = () => {
        if (!selectedSubmission) return;

        const formData = new FormData();
        formData.append('submission', selectedSubmission.id);
        formData.append('marks_obtained', marks);
        formData.append('feedback', feedback);

        gradeSubmission(formData, {
            onSuccess: () => {
                setModalVisible(false);
                setMarks('');
                setFeedback('');

            },
        });
    };

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-100">
                <ActivityIndicator size="large" color="#667eea" />
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-100">
                <Text className="text-red-500 text-center">Failed to load submissions</Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-gray-100 p-4">
            <Text className="text-2xl font-bold text-gray-800 mb-4">Submissions</Text>

            {!submissions?.length ? (
                <Text className="text-gray-500 text-center mt-10">No submissions yet</Text>
            ) : (
                submissions.map((sub: any) => (
                    <View key={sub.id} className="bg-white rounded-xl p-4 mb-3 shadow-sm">
                        <Text className="text-lg font-semibold text-gray-800">
                            {sub.student_name || sub.student?.username}
                        </Text>
                        <Text className="text-base text-gray-600 mt-1">{sub.title}</Text>
                        <Text className="text-xs text-gray-400 mt-1">
                            Submitted: {new Date(sub.submitted_at).toLocaleString()}
                        </Text>

                        <View className="flex-row justify-between items-center mt-3">
                            <Text className="text-sm text-gray-700">
                                Marks: {sub.marks_obtained !== null ? sub.marks_obtained : 'Not graded'}
                            </Text>
                            <TouchableOpacity
                                className="bg-indigo-500 px-4 py-2 rounded-lg"
                                onPress={() => handleGrade(sub)}
                            >
                                <Text className="text-white font-medium">
                                    {sub.marks_obtained !== null ? 'Re-grade' : 'Grade'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {sub.feedback ? (
                            <Text className="text-sm text-gray-500 mt-2">Feedback: {sub.feedback}</Text>
                        ) : null}
                    </View>
                ))
            )}

            {/* Grading Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View className="flex-1 justify-center items-center bg-black/50">
                    <View className="bg-white rounded-2xl p-5 w-11/12 max-w-md">
                        <Text className="text-xl font-bold text-gray-800 mb-4">Grade Submission</Text>

                        <Text className="text-base font-semibold text-gray-700">
                            {selectedSubmission?.student_name || selectedSubmission?.student?.username}
                        </Text>
                        <Text className="text-sm text-gray-500 mb-3">{selectedSubmission?.title}</Text>

                        <Text className="text-sm font-medium text-gray-700 mb-1">Marks (0-100)</Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg p-3 mb-3 text-base"
                            keyboardType="numeric"
                            value={marks}
                            onChangeText={setMarks}
                            placeholder="e.g., 85"
                        />

                        <Text className="text-sm font-medium text-gray-700 mb-1">Feedback</Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg p-3 mb-4 text-base min-h-[80px]"
                            multiline
                            numberOfLines={3}
                            value={feedback}
                            onChangeText={setFeedback}
                            placeholder="Optional feedback"
                        />

                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                className="flex-1 bg-green-200 py-3 rounded-lg"
                                onPress={() => handleSubmitGrade()}
                            >
                                <Text className="text-gray-700 text-center font-medium">Submit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-1 bg-gray-200 py-3 rounded-lg"
                                onPress={() => setModalVisible(false)}
                            >
                                <Text className="text-gray-700 text-center font-medium">Cancel</Text>
                            </TouchableOpacity>


                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}