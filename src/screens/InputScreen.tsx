import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import GeminiApi from '../services/geminiApi';

type InputNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Input'>;

const InputScreen = () => {
  const navigation = useNavigation<InputNavigationProp>();
  const [dream, setDream] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const analyzeDream = async () => {
    if (!dream.trim()) return;
    
    try {
      setIsLoading(true);
      const analysis = await GeminiApi.query(dream);
      navigation.navigate('Analysis', { analysis });
    } catch (error) {
      console.error('Error analyzing dream:', error);
      alert('Failed to analyze your dream. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Tell us about your dream</Text>
      <Text style={styles.subtitle}>Describe your dream in as much detail as you can remember</Text>
      
      <TextInput
        style={styles.dreamInput}
        multiline
        placeholder="I dreamt that I was flying over mountains..."
        placeholderTextColor="#777"
        value={dream}
        onChangeText={setDream}
        textAlignVertical="top"
      />
      
      <TouchableOpacity
        style={[styles.analyzeButton, !dream.trim() && styles.disabledButton]}
        onPress={analyzeDream}
        disabled={!dream.trim() || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Analyze Dream</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.skipButton}
        onPress={() => navigation.navigate('MainTabs')}
      >
        <Text style={styles.skipButtonText}>Skip to Journal</Text>
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 24,
  },
  dreamInput: {
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    minHeight: 200,
    marginBottom: 24,
    textAlignVertical: 'top',
  },
  analyzeButton: {
    backgroundColor: '#00adf5',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skipButton: {
    alignItems: 'center',
    padding: 16,
  },
  skipButtonText: {
    color: '#aaa',
    fontSize: 16,
  },
});

export default InputScreen;