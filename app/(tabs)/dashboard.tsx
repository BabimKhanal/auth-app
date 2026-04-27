// app/(tabs)/dashboard.tsx
import { useDashboard } from '@/api/dashboard/dashboard.hook';
import { useGetStudents } from '@/api/student/student.hooks';
import { useGetTeachers } from '@/api/teacher/teacher.hook';
import { AssignmentCard } from '@/components/assignments/assignment';
import { useRoleBasedAccess } from '@/hooks/use-Role-Based-Access';
import { useAuth } from '@/hooks/useAuth';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';



const ProgressBar = ({ percentage, color }: { percentage: number; color: string }) => (
  <View className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
    <View className="h-full rounded-full" style={{ width: `${Math.min(percentage, 100)}%`, backgroundColor: color }} />
  </View>
);

export default function Dashboard() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('overview');
  const { isTeacher, isStudent, isAdmin } = useRoleBasedAccess();
  const { data: dashboardData, isLoading } = useDashboard();
  const { data: students, isLoading: studentsLoading } = useGetStudents();
  const { data: teachers, isLoading: teachersLoading } = useGetTeachers();

  const { user } = useAuth();

  // ✅ Direct access – dashboardData is already the stats object
  const totalAssignments = dashboardData?.total_assignments || 0;
  const submitted = dashboardData?.submitted_count || 0;
  const pending = dashboardData?.pending_count || 0;
  const avgGrade = dashboardData?.average_grade || 0;
  const subjectsCount = dashboardData?.subjects_count || 0;
  const completionPercentage = totalAssignments ? (submitted / totalAssignments) * 100 : 0;

  const handleProfile = () => router.push('/settings');

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  const getStats = () => {
    if (isStudent) {
      return [
        { title: 'Total Assignments', value: totalAssignments, icon: '📚', color: '#4facfe' },
        { title: 'Submitted', value: submitted, icon: '✅', color: '#43e97b' },
        { title: 'Pending', value: pending, icon: '⏳', color: '#fa709a' },
        { title: 'Average Grade', value: `${avgGrade}%`, icon: '⭐', color: '#f093fb' },
        { title: 'Subjects', value: subjectsCount, icon: '📖', color: '#667eea' },
      ];
    }
    if (isTeacher) {
      // For teacher, adjust based on your backend response (might be different shape)
      return [
        { title: 'Total Students', value: dashboardData?.total_students || 0, icon: '👥', color: '#4facfe' },
        { title: 'Assignments', value: dashboardData?.total_assignments || 0, icon: '📚', color: '#43e97b' },
        { title: 'Pending Grading', value: dashboardData?.pending_grading || 0, icon: '⏳', color: '#fa709a' },
        { title: 'Avg Grade', value: `${dashboardData?.average_grade || 0}%`, icon: '📊', color: '#f093fb' },
      ];
    }
    return [];
  };

  const stats = getStats();

  const getTabs = () => {
    const tabs = [{ id: 'overview', label: 'Overview' }];
    if (isTeacher) {
      tabs.push({ id: 'students', label: 'Students' });
      tabs.push({ id: 'teachers', label: 'Teachers' });
    }
    tabs.push({ id: 'assignments', label: 'Assignments' });
    return tabs;
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-100"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
    >
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        className="pt-12 pb-6 px-5"
        style={{ paddingTop: insets.top + 16 }}
      >
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-white text-sm opacity-90">Welcome back,</Text>
            <Text className="text-white text-2xl font-bold mt-1">{user?.username}</Text>
            <Text className="text-white/80 text-sm mt-1">
              {isTeacher && '📚 Teacher'}
              {isStudent && '🎓 Student'}
              {isAdmin && '👑 Admin'}
            </Text>
          </View>
          {/* add chat button */}
          <TouchableOpacity onPress={() => router.push('/message')} className="bg-white/20 p-2 rounded-full">
            <Text className="text-white text-xl">💬</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleProfile} className="bg-white/20 p-2 rounded-full">
            {user?.profile_picture ? (
              <Image
                source={{
                  uri:
                    user?.profile_picture
                }}
                className="w-12 h-12 rounded-full" />
            ) : (
              <View className="w-12 h-12 rounded-full bg-white/30 justify-center items-center">
                <Text className="text-white text-xl font-bold">
                  {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Stats Cards */}
      <View className="flex-row flex-wrap justify-between px-4 mt-4">
        {stats.map((stat, idx) => (
          <View key={idx} className="w-[48%] mb-4">
            <LinearGradient
              colors={[stat.color, stat.color + 'cc']}
              className="rounded-2xl p-4"
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text className="text-3xl mb-1">{stat.icon}</Text>
              <Text className="text-2xl font-bold text-white">{stat.value}</Text>
              <Text className="text-xs text-white/80 mt-1">{stat.title}</Text>
            </LinearGradient>
          </View>
        ))}
      </View>

      {/* Student Progress */}
      {isStudent && (
        <View className="bg-white rounded-2xl mx-4 p-4 mt-2 shadow-sm">
          <Text className="text-gray-700 font-semibold mb-1">Assignment Progress</Text>
          <Text className="text-gray-500 text-sm mb-2">
            {submitted} of {totalAssignments} completed
          </Text>
          <ProgressBar percentage={completionPercentage} color="#667eea" />
          {pending > 0 && (
            <Text className="text-amber-600 text-sm mt-3">
              ⚠️ You have {pending} pending {pending === 1 ? 'assignment' : 'assignments'}.
            </Text>
          )}
          {avgGrade > 0 && (
            <View className="mt-3 pt-3 border-t border-gray-100">
              <Text className="text-gray-700 font-semibold">Average Grade</Text>
              <Text className="text-2xl font-bold text-indigo-600">{avgGrade}%</Text>
            </View>
          )}
        </View>
      )}

      {/* Tabs */}
      <View className="flex-row bg-white rounded-xl mx-4 p-1 mt-4 mb-4 shadow-sm">
        {getTabs().map((tab) => (
          <TouchableOpacity
            key={tab.id}
            className={`flex-1 py-2 rounded-lg ${activeTab === tab.id ? 'bg-indigo-500' : ''}`}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text className={`text-center font-medium ${activeTab === tab.id ? 'text-white' : 'text-gray-600'}`}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <View className="px-4">
        {activeTab === 'overview' && (
          <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <Text className="text-lg font-bold text-gray-800 mb-3">Recent Activity</Text>
            {isStudent ? (
              <>
                <View className="border-b border-gray-100 py-3">
                  <Text className="text-gray-700">📝 You have {pending} pending assignment(s).</Text>
                  <Text className="text-xs text-gray-400 mt-1">Submit them before the due date.</Text>
                </View>
                <View className="py-3">
                  <Text className="text-gray-700">⭐ Your average grade is {avgGrade}%.</Text>
                  <Text className="text-xs text-gray-400 mt-1">Keep up the good work!</Text>
                </View>
              </>
            ) : (
              <Text className="text-gray-500">Recent activity will appear here.</Text>
            )}
          </View>
        )}

        {activeTab === 'students' && isTeacher && (
          <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <Text className="text-lg font-bold text-gray-800 mb-3">Students</Text>
            {studentsLoading ? (
              <ActivityIndicator size="large" color="#667eea" />
            ) : students && students.length > 0 ? (
              students.map((student: any) => (
                <View key={student.id} className="flex-row items-center border-b border-gray-100 py-3 last:border-0">
                  <Image
                    source={{ uri: (student.profile_picture) }}
                    className="w-12 h-12 rounded-full mr-3"
                    resizeMode="cover"
                  />
                  <View className="flex-1">
                    <Text className="text-gray-800 font-semibold">
                      {student.first_name} {student.last_name}
                      {student.roll_number && <Text className="text-gray-500 font-normal"> ({student.roll_number})</Text>}
                    </Text>
                    <Text className="text-xs text-gray-500 mt-0.5">{student.email}</Text>
                    <TouchableOpacity onPress={() => router.push(`/message/${student.id}` as any)}>
                      <Text className="text-indigo-600">Message</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <Text className="text-gray-500 text-center py-4">No students found</Text>
            )}
          </View>
        )}

        {activeTab === 'teachers' && isTeacher && (
          <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <Text className="text-lg font-bold text-gray-800 mb-3">Teachers</Text>
            {teachersLoading ? (
              <ActivityIndicator size="large" color="#667eea" />
            ) : teachers && teachers.length > 0 ? (
              teachers.map((teacher: any) => (
                <View key={teacher.id} className="flex-row items-center border-b border-gray-100 py-3 last:border-0">
                  <Image
                    source={{ uri: (teacher.profile_picture) }}
                    className="w-12 h-12 rounded-full mr-3"
                    resizeMode="cover"
                  />
                  <View className="flex-1">
                    <Text className="text-gray-800 font-semibold">
                      {teacher.first_name} {teacher.last_name}
                      {teacher.id && <Text className="text-gray-500 font-normal"> ({teacher.id})</Text>}
                    </Text>
                    <Text className="text-xs text-gray-500 mt-0.5">{teacher.email}</Text>
                  </View>
                  <TouchableOpacity onPress={() => router.push(`/message/${teacher.id}` as any)}>
                    <Text className="text-indigo-600">Message</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text className="text-gray-500 text-center py-4">No teachers found</Text>
            )}
          </View>
        )}

        {activeTab === 'assignments' && <AssignmentCard />}
      </View>
    </ScrollView>
  );
}