import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView 
} from 'react-native';
import { useDreamContext, DreamEntry } from '../context/DreamContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { format, parseISO } from 'date-fns';
import { Plus, Brain } from 'lucide-react-native';

type HomeNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const { entries, loading } = useDreamContext();
  const navigation = useNavigation<HomeNavigationProp>();

  // Get mood color
  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'great': return '#4CAF50';
      case 'good': return '#8BC34A';
      case 'neutral': return '#FFC107';
      case 'bad': return '#FF9800';
      case 'terrible': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  // Navigate to dream detail
  const navigateToDreamDetail = (id: string) => {
    navigation.navigate('DreamDetail', { id });
  };

  // Add new dream entry
  const addNewDream = () => {
    navigation.navigate('NewEntry');
  };

  // Render dream entry item
  const renderDreamItem = ({ item }: { item: DreamEntry }) => (
    <TouchableOpacity 
      style={styles.dreamCard}
      onPress={() => navigateToDreamDetail(item.id)}
    >
      <View style={styles.dreamCardHeader}>
        <View style={[styles.moodIndicator, { backgroundColor: getMoodColor(item.mood) }]} />
        <Text style={styles.dateText}>{format(parseISO(item.date), 'MMM dd, yyyy')}</Text>
      </View>
      
      <Text style={styles.dreamText} numberOfLines={2}>
        {item.dreamContent}
      </Text>
      
      {item.tags.length > 0 && (
        <View style={styles.tagContainer}>
          {item.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
          {item.tags.length > 3 && (
            <Text style={styles.moreTagsText}>+{item.tags.length - 3} more</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>Dream Journal</Text>
          <Text style={styles.welcomeSubtitle}>Record and analyze your dreams</Text>
        </View>
      </View>
      
      <View style={styles.recentContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Dreams</Text>
          <TouchableOpacity onPress={addNewDream}>
            <Plus size={20} color="#00adf5" />
          </TouchableOpacity>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading dreams...</Text>
          </View>
        ) : entries.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Brain size={40} color="#444" />
            <Text style={styles.emptyText}>No dream entries yet</Text>
            <Text style={styles.emptySubtext}>Start by recording your first dream</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={addNewDream}
            >
              <Text style={styles.addButtonText}>Record Dream</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={entries.slice(0, 10)}
            renderItem={renderDreamItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  headerContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  welcomeContainer: {
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#aaa',
    marginTop: 4,
  },
  recentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#aaa',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtext: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 8,
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#00adf5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingBottom: 20,
  },
  dreamCard: {
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  dreamCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  moodIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  dateText: {
    color: '#aaa',
    fontSize: 14,
  },
  dreamText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
    lineHeight: 22,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#333',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    color: '#ddd',
    fontSize: 12,
  },
  moreTagsText: {
    color: '#777',
    fontSize: 12,
    alignSelf: 'center',
    marginLeft: 4,
  },
});

export default HomeScreen;