import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All', icon: '📚' },
    { id: 'math', name: 'Mathematics', icon: '📐' },
    { id: 'science', name: 'Science', icon: '🔬' },
    { id: 'languages', name: 'Languages', icon: '📖' },
    { id: 'arts', name: 'Arts', icon: '🎨' },
  ];

  const courses = [
    {
      id: 1,
      title: 'Advanced Mathematics',
      teacher: 'Prof. Anderson',
      students: 45,
      rating: 4.8,
      duration: '8 weeks',
      level: 'Advanced',
      category: 'math',
      image: '📐',
      color: ['#4facfe', '#00f2fe']
    },
    {
      id: 2,
      title: 'Physics Fundamentals',
      teacher: 'Dr. Martinez',
      students: 38,
      rating: 4.9,
      duration: '10 weeks',
      level: 'Intermediate',
      category: 'science',
      image: '⚛️',
      color: ['#43e97b', '#38f9d7']
    },
    {
      id: 3,
      title: 'English Literature',
      teacher: 'Ms. Thompson',
      students: 52,
      rating: 4.7,
      duration: '6 weeks',
      level: 'Beginner',
      category: 'languages',
      image: '📖',
      color: ['#fa709a', '#fee140']
    },
    {
      id: 4,
      title: 'Digital Art',
      teacher: 'Mr. Wilson',
      students: 29,
      rating: 4.9,
      duration: '4 weeks',
      level: 'Beginner',
      category: 'arts',
      image: '🎨',
      color: ['#f093fb', '#f5576c']
    },
    {
      id: 5,
      title: 'Chemistry Basics',
      teacher: 'Dr. Lee',
      students: 41,
      rating: 4.6,
      duration: '8 weeks',
      level: 'Intermediate',
      category: 'science',
      image: '🧪',
      color: ['#4facfe', '#00f2fe']
    },
    {
      id: 6,
      title: 'Creative Writing',
      teacher: 'Prof. Brown',
      students: 33,
      rating: 4.8,
      duration: '6 weeks',
      level: 'Advanced',
      category: 'languages',
      image: '✍️',
      color: ['#43e97b', '#38f9d7']
    },
  ];

  const filteredCourses = selectedCategory === 'all'
    ? courses
    : courses.filter(course => course.category === selectedCategory);

  const CourseCard = ({ course }: { course: any }) => (
    <TouchableOpacity style={styles.courseCard}>
      <LinearGradient colors={course.color} style={styles.courseGradient}>
        <Text style={styles.courseIcon}>{course.image}</Text>
      </LinearGradient>
      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle}>{course.title}</Text>
        <Text style={styles.courseTeacher}>👨‍🏫 {course.teacher}</Text>
        <View style={styles.courseStats}>
          <View style={styles.statBadge}>
            <Text style={styles.statText}>👥 {course.students}</Text>
          </View>
          <View style={styles.statBadge}>
            <Text style={styles.statText}>⭐ {course.rating}</Text>
          </View>
          <View style={styles.statBadge}>
            <Text style={styles.statText}>⏱️ {course.duration}</Text>
          </View>
        </View>
        <View style={styles.levelBadge}>
          <Text style={[
            styles.levelText,
            course.level === 'Advanced' && styles.advancedLevel,
            course.level === 'Intermediate' && styles.intermediateLevel,
            course.level === 'Beginner' && styles.beginnerLevel
          ]}>
            {course.level}
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.enrollButton}>
        <Text style={styles.enrollButtonText}>Enroll Now →</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#1D3D47', '#2a5f6e']} style={styles.header}>
        <Text style={styles.headerTitle}>Explore Courses</Text>
        <Text style={styles.headerSubtitle}>Discover new skills and knowledge</Text>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search courses, teachers..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✖️</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  selectedCategory === category.id && styles.selectedCategory
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={[
                  styles.categoryName,
                  selectedCategory === category.id && styles.selectedCategoryName
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Section */}
        <View style={styles.featuredContainer}>
          <Text style={styles.sectionTitle}>🔥 Featured This Week</Text>
          <LinearGradient colors={['#667eea', '#764ba2']} style={styles.featuredCard}>
            <View style={styles.featuredContent}>
              <Text style={styles.featuredBadge}>HOT 🔥</Text>
              <Text style={styles.featuredTitle}>Web Development Bootcamp</Text>
              <Text style={styles.featuredDesc}>Learn React Native & Expo in 8 weeks</Text>
              <View style={styles.featuredStats}>
                <Text style={styles.featuredStat}>👥 120+ students</Text>
                <Text style={styles.featuredStat}>⭐ 4.9 rating</Text>
              </View>
              <TouchableOpacity style={styles.featuredButton}>
                <Text style={styles.featuredButtonText}>Enroll Now →</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.featuredEmoji}>🚀</Text>
          </LinearGradient>
        </View>

        {/* All Courses */}
        <View style={styles.coursesContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Courses</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All →</Text>
            </TouchableOpacity>
          </View>
          {filteredCourses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
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
  searchContainer: {
    paddingHorizontal: 20,
    marginTop: -20,
    marginBottom: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearIcon: {
    fontSize: 14,
    color: '#999',
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  categoriesScroll: {
    paddingHorizontal: 15,
  },
  categoryCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedCategory: {
    backgroundColor: '#1D3D47',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  categoryName: {
    fontSize: 12,
    color: '#666',
  },
  selectedCategoryName: {
    color: '#fff',
    fontWeight: '600',
  },
  featuredContainer: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  featuredCard: {
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
  },
  featuredContent: {
    flex: 1,
  },
  featuredBadge: {
    backgroundColor: '#ff6b6b',
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 10,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  featuredTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  featuredDesc: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 10,
  },
  featuredStats: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 15,
  },
  featuredStat: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
  },
  featuredButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  featuredButtonText: {
    color: '#667eea',
    fontWeight: 'bold',
    fontSize: 14,
  },
  featuredEmoji: {
    fontSize: 60,
    opacity: 0.3,
  },
  coursesContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  seeAllText: {
    color: '#1D3D47',
    fontSize: 14,
    fontWeight: '600',
  },
  courseCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  courseGradient: {
    padding: 20,
    alignItems: 'center',
  },
  courseIcon: {
    fontSize: 40,
  },
  courseInfo: {
    padding: 15,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  courseTeacher: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  courseStats: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  statBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statText: {
    fontSize: 11,
    color: '#666',
  },
  levelBadge: {
    alignSelf: 'flex-start',
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  beginnerLevel: {
    backgroundColor: '#4caf50',
    color: '#fff',
  },
  intermediateLevel: {
    backgroundColor: '#ff9800',
    color: '#fff',
  },
  advancedLevel: {
    backgroundColor: '#f44336',
    color: '#fff',
  },
  enrollButton: {
    backgroundColor: '#1D3D47',
    paddingVertical: 12,
    alignItems: 'center',
  },
  enrollButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});