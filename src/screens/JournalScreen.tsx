import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  SafeAreaView
} from 'react-native';
import { useDreamContext, DreamEntry, MoodType } from '../context/DreamContext';
import { format, parseISO } from 'date-fns';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Search, Filter, X } from 'lucide-react-native';

type JournalNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Journal'>;

const JournalScreen = () => {
  const { entries } = useDreamContext();
  const navigation = useNavigation<JournalNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEntries, setFilteredEntries] = useState<DreamEntry[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<MoodType[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // All possible moods
  const moods: MoodType[] = ['great', 'good', 'neutral', 'bad', 'terrible'];

  // Update filtered entries whenever search query or selected moods change
  useEffect(() => {
    let result = [...entries];
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(entry => 
        entry.dreamContent.toLowerCase().includes(query) ||
        entry.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Filter by selected moods
    if (selectedMoods.length > 0) {
      result = result.filter(entry => selectedMoods.includes(entry.mood));
    }
    
    setFilteredEntries(result);
  }, [entries, searchQuery, selectedMoods]);

  // Toggle mood filter
  const toggleMood = (mood: MoodType) => {
    if (selectedMoods.includes(mood)) {
      setSelectedMoods(selectedMoods.filter(m => m !== mood));
    } else {
      setSelectedMoods([...selectedMoods, mood]);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedMoods([]);
  };

  // Get mood color
  const getMoodColor = (mood: MoodType) => {
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

  // Group entries by month and year
  const groupedEntries = filteredEntries.reduce((groups, entry) => {
    const date = parseISO(entry.date);
    const monthYear = format(date, 'MMMM yyyy');
    
    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }
    
    groups[monthYear].push(entry);
    return groups;
  }, {} as Record<string, DreamEntry[]>);

  // Convert grouped entries to sections for rendering
  const sections = Object.entries(groupedEntries).map(([monthYear, entries]) => ({
    title: monthYear,
    data: entries
  })).sort((a, b) => {
    // Sort sections by date (most recent first)
    const dateA = parseISO(a.data[0].date);
    const dateB = parseISO(b.data[0].date);
    return dateB.getTime() - dateA.getTime();
  });

  // Render entry item
  const renderEntry = (entry: DreamEntry) => (
    <TouchableOpacity 
      style={styles.entryCard}
      onPress={() => navigateToDreamDetail(entry.id)}
    >
      <View style={styles.entryHeader}>
        <View style={[styles.moodIndicator, { backgroundColor: getMoodColor(entry.mood) }]} />
        <Text style={styles.entryDate}>
          {format(parseISO(entry.date), 'EEEE, MMMM d')}
        </Text>
      </View>
      <Text style={styles.entryContent} numberOfLines={2}>
        {entry.dreamContent}
      </Text>
      {entry.tags.length > 0 && (
        <View style={styles.tagContainer}>
          {entry.tags.slice(0, 3).map((tag, idx) => (
            <View key={idx} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
          {entry.tags.length > 3 && (
            <Text style={styles.moreTagsText}>+{entry.tags.length - 3} more</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  // Render month section
  const renderSection = ({ item: section }: { item: typeof sections[0] }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      {section.data.map(entry => (
        <View key={entry.id}>
          {renderEntry(entry)}
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={18} color="#aaa" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search dreams or tags..."
            placeholderTextColor="#777"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={18} color="#aaa" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color={selectedMoods.length > 0 ? '#00adf5' : '#aaa'} />
        </TouchableOpacity>
      </View>
      
      {showFilters && (
        <View style={styles.filtersContainer}>
          <View style={styles.moodFilters}>
            {moods.map(mood => (
              <TouchableOpacity
                key={mood}
                style={[
                  styles.moodFilter,
                  selectedMoods.includes(mood) && { backgroundColor: getMoodColor(mood) }
                ]}
                onPress={() => toggleMood(mood)}
              >
                <Text 
                  style={[
                    styles.moodFilterText,
                    selectedMoods.includes(mood) && { color: '#000' }
                  ]}
                >
                  {mood}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
            <Text style={styles.clearButtonText}>Clear Filters</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {filteredEntries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No dream entries found</Text>
          {(searchQuery.length > 0 || selectedMoods.length > 0) && (
            <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
          )}
        </View>
      ) : (
        <FlatList
          data={sections}
          renderItem={renderSection}
          keyExtractor={(item) => item.title}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    padding: 0,
  },
  filterButton: {
    marginLeft: 12,
    padding: 8,
  },
  filtersContainer: {
    backgroundColor: '#111',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  moodFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  moodFilter: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#222',
  },
  moodFilterText: {
    color: '#fff',
    fontSize: 14,
  },
  clearButton: {
    alignSelf: 'flex-end',
  },
  clearButtonText: {
    color: '#00adf5',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#aaa',
    fontSize: 18,
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#777',
    fontSize: 14,
  },
  listContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  entryCard: {
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  entryHeader: {
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
  entryDate: {
    color: '#aaa',
    fontSize: 14,
  },
  entryContent: {
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

export default JournalScreen; 