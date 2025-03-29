import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Dimensions, Platform, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Brain, Heart, Star, Zap, Moon, Send, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react-native';
import DreamAnalysisService from './src/services/dreamAnalysisService';

interface SymbolismItem {
  symbol: string;
  meaning: string;
}

interface Analysis {
  symbolism: SymbolismItem[];
  emotional: string;
  advice: string;
}

type RootStackParamList = {
  Intro: undefined;
  Input: undefined;
  Analysis: { analysis: Analysis };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Stack = createNativeStackNavigator();

const IntroScreen = ({ navigation }: { navigation: NavigationProp }) => {
  const [currentFeature, setCurrentFeature] = useState(0);
  const features = [
    {
      icon: <Brain size={32} color="#fff" />,
      title: "AI-Powered Analysis",
      description: "Advanced algorithms analyze your dream patterns and symbolism",
    },
    {
      icon: <Heart size={32} color="#fff" />,
      title: "Personalized Insights",
      description: "Get tailored interpretations based on your unique experiences",
    },
    {
      icon: <Star size={32} color="#fff" />,
      title: "Dream Journal",
      description: "Track and analyze your dreams over time",
    },
    {
      icon: <Zap size={32} color="#fff" />,
      title: "Quick Analysis",
      description: "Get instant insights into your dreams",
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.featureContainer}>
          {features[currentFeature].icon}
          <Text style={styles.featureTitle}>{features[currentFeature].title}</Text>
          <Text style={styles.featureDescription}>{features[currentFeature].description}</Text>
        </View>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Input')}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const InputScreen = ({ navigation }: { navigation: NavigationProp }) => {
  const [dream, setDream] = useState('');
  const [mood, setMood] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const analyzeDream = async () => {
    try {
      setIsLoading(true);
      const analysis = await DreamAnalysisService.analyzeDream(dream, mood);
      navigation.navigate('Analysis', { analysis });
    } catch (error) {
      console.error('Error analyzing dream:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.label}>Describe your dream:</Text>
        <TextInput
          style={styles.input}
          multiline
          numberOfLines={4}
          value={dream}
          onChangeText={setDream}
          placeholder="Enter your dream here..."
          placeholderTextColor="#ffffff80"
          textAlignVertical="top"
        />
        <Text style={styles.label}>How did you feel when you woke up?</Text>
        <TextInput
          style={[styles.input, { minHeight: 50 }]}
          value={mood}
          onChangeText={setMood}
          placeholder="Enter your mood..."
          placeholderTextColor="#ffffff80"
        />
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={analyzeDream}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Analyzing...' : 'Analyze Dream'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const AnalysisScreen = ({ route }: { route: { params: { analysis: Analysis } } }) => {
  const { analysis } = route.params;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.analysisTitle}>Dream Analysis</Text>
        <View style={styles.analysisSection}>
          <Text style={styles.sectionTitle}>Emotional State</Text>
          <Text style={styles.analysisText}>{analysis.emotional}</Text>
        </View>
        <View style={styles.analysisSection}>
          <Text style={styles.sectionTitle}>Symbolism</Text>
          {analysis.symbolism.map((item, index) => (
            <View key={index} style={styles.symbolismItem}>
              <Text style={styles.symbol}>{item.symbol}</Text>
              <Text style={styles.meaning}>{item.meaning}</Text>
            </View>
          ))}
        </View>
        <View style={styles.analysisSection}>
          <Text style={styles.sectionTitle}>Advice</Text>
          <Text style={styles.analysisText}>{analysis.advice}</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default function App() {
  // Use StatusBar.currentHeight for Android, use 44 for iOS
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 44;

  return (
    <View style={{ flex: 1, backgroundColor: '#000', paddingTop: statusBarHeight }}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <NavigationContainer
        theme={{
          dark: true,
          colors: {
            primary: '#007AFF',
            background: '#000',
            card: '#000',
            text: '#fff',
            border: '#ffffff40',
            notification: '#007AFF',
          },
        }}
      >
        <Stack.Navigator 
          initialRouteName="Intro"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#000',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 18,
            },
            headerBackTitle: 'Back',
            contentStyle: {
              backgroundColor: '#000',
            },
            animation: 'slide_from_right',
            headerShown: true,
            headerShadowVisible: false,
            headerBackVisible: true,
            headerBackTitleVisible: false,
            headerTitleAlign: 'center',
            headerTitle: '',
          }}
        >
          <Stack.Screen 
            name="Intro" 
            component={IntroScreen} 
            options={{ 
              headerShown: false,
              contentStyle: {
                backgroundColor: '#000',
              },
            }}
          />
          <Stack.Screen 
            name="Input" 
            component={InputScreen}
            options={{ 
              title: 'Record Your Dream',
              contentStyle: {
                backgroundColor: '#000',
              },
            }}
          />
          <Stack.Screen 
            name="Analysis" 
            component={AnalysisScreen as React.ComponentType<any>}
            options={{ 
              title: 'Analysis Results',
              contentStyle: {
                backgroundColor: '#000',
              },
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingBottom: Platform.OS === 'ios' ? 34 : 0, // Safe area bottom padding for iOS
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 50 : 20, // Extra padding at bottom for iOS
  },
  featureContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  featureTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#fff',
  },
  featureDescription: {
    fontSize: 16,
    textAlign: 'center',
    color: '#ffffff80',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    alignSelf: 'flex-start',
    color: '#fff',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ffffff40',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    minHeight: 100,
    color: '#fff',
    backgroundColor: '#ffffff10',
    fontSize: 16,
    lineHeight: 24,
  },
  analysisTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
  },
  analysisSection: {
    width: '100%',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    color: '#fff',
  },
  analysisText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#ffffffcc',
  },
  symbolismItem: {
    marginBottom: 15,
    backgroundColor: '#ffffff10',
    padding: 15,
    borderRadius: 8,
  },
  symbol: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
    color: '#fff',
  },
  meaning: {
    fontSize: 16,
    color: '#ffffff80',
  },
}); 