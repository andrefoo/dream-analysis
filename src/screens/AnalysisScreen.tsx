import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { v4 as uuidv4 } from 'uuid';
import { useDreamContext } from '../context/DreamContext';

type AnalysisRouteProp = RouteProp<RootStackParamList, 'Analysis'>;
type AnalysisNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AnalysisScreen = () => {
  const route = useRoute<AnalysisRouteProp>();
  const navigation = useNavigation<AnalysisNavigationProp>();
  const { addEntry } = useDreamContext();
  const { analysis } = route.params;
  
  const [mood, setMood] = useState<'great' | 'good' | 'neutral' | 'bad' | 'terrible'>('neutral');
  
  // Suggested tags from the analysis
  const suggestedTags = analysis.symbolism
    .map((item: {symbol: string}) => item.symbol.toLowerCase())
    .filter((tag: string) => tag.length > 2);
  
  // Save dream entry and go to journal
  const saveDreamEntry = () => {
    // Create new entry
    const newEntry = {
      id: uuidv4(),
      date: new Date().toISOString(),
      mood,
      sleepQuality: 3, // Default
      dreamContent: '', // Will be filled in by the user later
      tags: suggestedTags.slice(0, 5), // Take up to 5 tags
      analysis
    };
    
    // Add to context
    addEntry(newEntry);
    
    // Navigate to the main tabs/journal
    navigation.navigate('MainTabs');
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Dream Analysis</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emotional Insights</Text>
        <Text style={styles.analysisText}>{analysis.emotional}</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Symbolism</Text>
        {analysis.symbolism.map((item: {symbol: string, meaning: string}, index: number) => (
          <View key={index} style={styles.symbolItem}>
            <Text style={styles.symbolName}>{item.symbol}</Text>
            <Text style={styles.symbolMeaning}>{item.meaning}</Text>
          </View>
        ))}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Advice</Text>
        <Text style={styles.analysisText}>{analysis.advice}</Text>
      </View>
      
      <View style={styles.moodSection}>
        <Text style={styles.moodTitle}>How did this dream make you feel?</Text>
        <View style={styles.moodOptions}>
          {[
            { value: 'great', label: 'Great', emoji: '😁' },
            { value: 'good', label: 'Good', emoji: '🙂' },
            { value: 'neutral', label: 'Neutral', emoji: '😐' },
            { value: 'bad', label: 'Bad', emoji: '😕' },
            { value: 'terrible', label: 'Terrible', emoji: '😢' }
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.moodOption,
                mood === option.value && styles.selectedMoodOption
              ]}
              onPress={() => setMood(option.value as any)}
            >
              <Text style={styles.moodEmoji}>{option.emoji}</Text>
              <Text 
                style={[
                  styles.moodLabel,
                  mood === option.value && styles.selectedMoodLabel
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <TouchableOpacity style={styles.saveButton} onPress={saveDreamEntry}>
        <Text style={styles.saveButtonText}>Save to Journal</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  analysisText: {
    fontSize: 16,
    color: '#ccc',
    lineHeight: 24,
  },
  symbolItem: {
    marginBottom: 12,
    paddingBottom: 12,
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
    color: '#ccc',
    lineHeight: 22,
  },
  moodSection: {
    marginBottom: 24,
  },
  moodTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  moodOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodOption: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#111',
    width: '18%',
  },
  selectedMoodOption: {
    backgroundColor: '#1a1a1a',
    borderColor: '#00adf5',
    borderWidth: 1,
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  moodLabel: {
    color: '#aaa',
    fontSize: 12,
  },
  selectedMoodLabel: {
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#00adf5',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AnalysisScreen;