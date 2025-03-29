import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback
} from 'react-native';
import { useDreamContext, MoodType, DreamEntry } from '../context/DreamContext';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { StarIcon, Plus, X } from 'lucide-react-native';

type EditEntryRouteProp = RouteProp<RootStackParamList, 'EditEntry'>;
type EditEntryNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditEntry'>;

// Available mood options
const moodOptions: { value: MoodType; label: string; emoji: string }[] = [
  { value: 'great', label: 'Great', emoji: '😁' },
  { value: 'good', label: 'Good', emoji: '🙂' },
  { value: 'neutral', label: 'Neutral', emoji: '😐' },
  { value: 'bad', label: 'Bad', emoji: '😕' },
  { value: 'terrible', label: 'Terrible', emoji: '😢' }
];

// Common dream tags
const suggestedTags = [
  'flying', 'falling', 'chasing', 'family', 'school', 'work', 
  'water', 'animals', 'nature', 'childhood', 'recurring'
];

const EditEntryScreen = () => {
  const { getEntryById, updateEntry } = useDreamContext();
  const route = useRoute<EditEntryRouteProp>();
  const navigation = useNavigation<EditEntryNavigationProp>();
  const { id } = route.params;
  
  // Entry state
  const [entry, setEntry] = useState<DreamEntry | null>(null);
  const [dreamContent, setDreamContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<MoodType>('neutral');
  const [sleepQuality, setSleepQuality] = useState(3);
  const [tags, setTags] = useState<string[]>([]);
  const [newTagText, setNewTagText] = useState('');
  
  // Load entry data
  useEffect(() => {
    const existingEntry = getEntryById(id);
    if (existingEntry) {
      setEntry(existingEntry);
      setDreamContent(existingEntry.dreamContent);
      setSelectedMood(existingEntry.mood);
      setSleepQuality(existingEntry.sleepQuality);
      setTags([...existingEntry.tags]);
    } else {
      Alert.alert('Error', 'Dream entry not found');
      navigation.goBack();
    }
  }, [id, getEntryById, navigation]);
  
  // Form validation
  const isValid = dreamContent.trim().length > 0;
  
  // Add a new tag
  const addTag = () => {
    const tag = newTagText.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setNewTagText('');
    }
  };
  
  // Remove a tag
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  // Add suggested tag
  const addSuggestedTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };
  
  // Save changes
  const saveChanges = () => {
    if (!isValid || !entry) {
      Alert.alert('Error', 'Please enter your dream content');
      return;
    }
    
    const updatedEntry: DreamEntry = {
      ...entry,
      dreamContent,
      mood: selectedMood,
      sleepQuality,
      tags
    };
    
    updateEntry(updatedEntry);
    navigation.navigate('DreamDetail', { id });
  };
  
  // Cancel editing
  const cancelEditing = () => {
    navigation.goBack();
  };
  
  if (!entry) return null;
  
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <Text style={styles.sectionTitle}>Dream Description</Text>
          <TextInput
            style={styles.dreamInput}
            placeholder="Describe your dream..."
            placeholderTextColor="#777"
            multiline
            value={dreamContent}
            onChangeText={setDreamContent}
            textAlignVertical="top"
          />
          
          <Text style={styles.sectionTitle}>Mood</Text>
          <View style={styles.moodContainer}>
            {moodOptions.map((mood) => (
              <TouchableOpacity
                key={mood.value}
                style={[
                  styles.moodOption,
                  selectedMood === mood.value && styles.selectedMoodOption
                ]}
                onPress={() => setSelectedMood(mood.value)}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text 
                  style={[
                    styles.moodLabel,
                    selectedMood === mood.value && styles.selectedMoodLabel
                  ]}
                >
                  {mood.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={styles.sectionTitle}>Sleep Quality</Text>
          <View style={styles.sleepQualityContainer}>
            {[1, 2, 3, 4, 5].map(rating => (
              <TouchableOpacity
                key={rating}
                style={styles.starContainer}
                onPress={() => setSleepQuality(rating)}
              >
                <StarIcon
                  size={32}
                  fill={rating <= sleepQuality ? '#FFC107' : 'transparent'}
                  stroke={rating <= sleepQuality ? '#FFC107' : '#777'}
                />
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={styles.sectionTitle}>Tags</Text>
          <View style={styles.tagsInputContainer}>
            <TextInput
              style={styles.tagInput}
              placeholder="Add a tag..."
              placeholderTextColor="#777"
              value={newTagText}
              onChangeText={setNewTagText}
              onSubmitEditing={addTag}
              blurOnSubmit={false}
            />
            <TouchableOpacity 
              style={styles.addTagButton}
              onPress={addTag}
              disabled={!newTagText.trim()}
            >
              <Plus size={20} color={newTagText.trim() ? '#00adf5' : '#777'} />
            </TouchableOpacity>
          </View>
          
          {/* Tags list */}
          {tags.length > 0 && (
            <View style={styles.selectedTagsContainer}>
              {tags.map(tag => (
                <View key={tag} style={styles.selectedTag}>
                  <Text style={styles.selectedTagText}>{tag}</Text>
                  <TouchableOpacity
                    style={styles.removeTagButton}
                    onPress={() => removeTag(tag)}
                  >
                    <X size={14} color="#ddd" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
          
          {/* Suggested tags */}
          <Text style={styles.suggestedTagsTitle}>Suggested Tags</Text>
          <View style={styles.suggestedTagsContainer}>
            {suggestedTags.map(tag => (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.suggestedTag,
                  tags.includes(tag) && styles.suggestedTagSelected
                ]}
                onPress={() => addSuggestedTag(tag)}
                disabled={tags.includes(tag)}
              >
                <Text 
                  style={[
                    styles.suggestedTagText,
                    tags.includes(tag) && styles.suggestedTagTextSelected
                  ]}
                >
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={cancelEditing}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.saveButton, !isValid && styles.saveButtonDisabled]}
              onPress={saveChanges}
              disabled={!isValid}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    marginTop: 20,
  },
  dreamInput: {
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
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
  sleepQualityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  starContainer: {
    padding: 5,
  },
  tagsInputContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tagInput: {
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    color: '#fff',
    fontSize: 16,
    marginRight: 8,
  },
  addTagButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 12,
    width: 50,
  },
  selectedTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedTagText: {
    color: '#fff',
    fontSize: 14,
    marginRight: 4,
  },
  removeTagButton: {
    padding: 2,
  },
  suggestedTagsTitle: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 8,
  },
  suggestedTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  suggestedTag: {
    backgroundColor: '#111',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  suggestedTagSelected: {
    backgroundColor: '#333',
  },
  suggestedTagText: {
    color: '#777',
    fontSize: 14,
  },
  suggestedTagTextSelected: {
    color: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelButton: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#00adf5',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    flex: 2,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditEntryScreen; 