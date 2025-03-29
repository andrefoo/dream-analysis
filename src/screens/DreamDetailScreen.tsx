import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Platform
} from 'react-native';
import { useDreamContext } from '../context/DreamContext';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { 
  Calendar,
  Edit2,
  Trash2,
  Moon,
  Tag,
  FileText,
  ArrowLeft,
  Share,
  MessageSquare
} from 'lucide-react-native';
import { format } from 'date-fns';

type DreamDetailRouteProp = RouteProp<RootStackParamList, 'DreamDetail'>;
type DreamDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'DreamDetail'>;

const DreamDetailScreen = () => {
  const { getEntryById, deleteEntry } = useDreamContext();
  const route = useRoute<DreamDetailRouteProp>();
  const navigation = useNavigation<DreamDetailNavigationProp>();
  
  const { id } = route.params;
  const entry = getEntryById(id);

  // If entry doesn't exist, redirect back
  useEffect(() => {
    if (!entry) {
      Alert.alert('Error', 'Dream entry not found');
      navigation.goBack();
    }
  }, [entry, navigation]);

  if (!entry) return null;

  const handleDelete = () => {
    Alert.alert(
      'Delete Dream',
      'Are you sure you want to delete this dream entry? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            deleteEntry(id);
            navigation.goBack();
          } 
        }
      ]
    );
  };

  const handleEdit = () => {
    navigation.navigate('EditEntry', { id });
  };

  // Function to get mood color
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

  // Function to get mood emoji
  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case 'great': return '😁';
      case 'good': return '🙂';
      case 'neutral': return '😐';
      case 'bad': return '😕';
      case 'terrible': return '😢';
      default: return '🤔';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.dateContainer}>
            <Calendar size={16} color="#999" style={styles.icon} />
            <Text style={styles.date}>
              {format(new Date(entry.date), 'EEEE, MMMM dd, yyyy')}
            </Text>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.iconButton} onPress={handleEdit}>
              <Edit2 size={20} color="#00adf5" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={handleDelete}>
              <Trash2 size={20} color="#f44336" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.moodSection}>
          <View 
            style={[
              styles.moodIndicator, 
              { backgroundColor: getMoodColor(entry.mood) }
            ]} 
          />
          <Text style={styles.moodText}>
            {getMoodEmoji(entry.mood)} {entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}
          </Text>
        </View>

        <View style={styles.sleepSection}>
          <Moon size={16} color="#999" style={styles.icon} />
          <Text style={styles.sleepQualityText}>
            Sleep Quality: {Array(entry.sleepQuality).fill('★').join('')}
            {Array(5 - entry.sleepQuality).fill('☆').join('')}
          </Text>
        </View>

        <View style={styles.tagSection}>
          <Tag size={16} color="#999" style={styles.icon} />
          <View style={styles.tagsContainer}>
            {entry.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.contentSection}>
          <Text style={styles.contentTitle}>Dream</Text>
          <Text style={styles.contentText}>{entry.dreamContent}</Text>
        </View>

        {entry.analysis && (
          <View style={styles.analysisSection}>
            <Text style={styles.analysisTitle}>Analysis</Text>
            
            <View style={styles.analysisBlock}>
              <Text style={styles.analysisSubtitle}>Emotional Insights</Text>
              <Text style={styles.analysisText}>{entry.analysis.emotional}</Text>
            </View>
            
            <View style={styles.analysisBlock}>
              <Text style={styles.analysisSubtitle}>Dream Symbolism</Text>
              {entry.analysis.symbolism.map((item, index) => (
                <View key={index} style={styles.symbolItem}>
                  <Text style={styles.symbolName}>{item.symbol}</Text>
                  <Text style={styles.symbolMeaning}>{item.meaning}</Text>
                </View>
              ))}
            </View>
            
            <View style={styles.analysisBlock}>
              <Text style={styles.analysisSubtitle}>Advice</Text>
              <Text style={styles.analysisText}>{entry.analysis.advice}</Text>
            </View>
          </View>
        )}

        {entry.notes && (
          <View style={styles.notesSection}>
            <View style={styles.notesTitleContainer}>
              <FileText size={16} color="#999" style={styles.icon} />
              <Text style={styles.notesTitle}>Notes</Text>
            </View>
            <Text style={styles.notesText}>{entry.notes}</Text>
          </View>
        )}

        {entry.voiceMemoUrl && (
          <View style={styles.voiceSection}>
            <View style={styles.voiceTitleContainer}>
              <MessageSquare size={16} color="#999" style={styles.icon} />
              <Text style={styles.voiceTitle}>Voice Memo</Text>
            </View>
            <TouchableOpacity style={styles.voicePlayer}>
              <Text style={styles.voicePlayerText}>Play Voice Memo</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 16,
    color: '#fff',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  moodSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  moodIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  moodText: {
    fontSize: 16,
    color: '#fff',
  },
  sleepSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sleepQualityText: {
    fontSize: 16,
    color: '#fff',
  },
  tagSection: {
    flexDirection: 'row',
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  tagsContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#333',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#fff',
    fontSize: 14,
  },
  contentSection: {
    marginBottom: 24,
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 16,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  contentText: {
    fontSize: 16,
    color: '#ddd',
    lineHeight: 24,
  },
  analysisSection: {
    marginBottom: 24,
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 16,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  analysisBlock: {
    marginBottom: 16,
  },
  analysisSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#aaa',
    marginBottom: 8,
  },
  analysisText: {
    fontSize: 16,
    color: '#ddd',
    lineHeight: 24,
  },
  symbolItem: {
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  symbolName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  symbolMeaning: {
    fontSize: 14,
    color: '#bbb',
    lineHeight: 20,
  },
  notesSection: {
    marginBottom: 24,
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 16,
  },
  notesTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  notesText: {
    fontSize: 16,
    color: '#ddd',
    lineHeight: 24,
  },
  voiceSection: {
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 16,
  },
  voiceTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  voiceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  voicePlayer: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  voicePlayerText: {
    color: '#fff',
    fontSize: 16,
  },
  icon: {
    marginRight: 8,
  },
});

export default DreamDetailScreen;