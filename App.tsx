import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Dimensions, Platform, StatusBar, ActivityIndicator, FlatList, ImageBackground } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Brain, Heart, Star, Zap, Moon, Send, ArrowRight, ChevronLeft, ChevronRight, Album, Plus, BarChart, Trash2, Clock, Lightbulb, BookOpen, Calendar, Sparkles } from 'lucide-react-native';
import DreamAnalysisService from './src/services/dreamAnalysisService';
import SupabaseService, { DreamData, SavedDream } from './src/services/supabaseService';
import Slider from '@react-native-community/slider';
import GradientBackground from './src/components/GradientBackground';
import GlassCard from './src/components/GlassCard';
import Button from './src/components/Button';
import theme from './src/theme';

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
  Gallery: undefined;
  Dashboard: undefined;
  Analysis: { 
    analysis: Analysis;
    dreamText?: string;
    mood?: string;
  };
  DetailedInput: { 
    dream: string; 
    mood: string; 
  };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Stack = createNativeStackNavigator();

interface AnalysisScreenParams {
  analysis: Analysis;
  dreamText?: string;
  mood?: string;
}

const IntroScreen = ({ navigation }: { navigation: NavigationProp }) => {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const features = [
    {
      icon: <Brain size={32} color="#3269ad" />,
      title: "AI-Powered Analysis",
      description:
        "Advanced algorithms analyze your dream patterns and symbolism",
    },
    {
      icon: <Heart size={32} color="#c159aa" />,
      title: "Personalized Insights",
      description:
        "Get tailored interpretations based on your unique experiences",
    },
    {
      icon: <Star size={32} color="#efc560" />,
      title: "Dream Journal",
      description: "Track and analyze your dreams over time",
    },
    {
      icon: <Zap size={32} color="#f6547b" />,
      title: "Quick Analysis",
      description: "Get instant insights into your dreams",
    },
  ];

  // Auto switch features
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Try to load background image, use gradient as fallback
  let backgroundContent: JSX.Element;
  try {
    // Replace this with your actual image path once you have the image
    const backgroundImage = require('./src/assets/images/dream_background.png');
    backgroundContent = (
      <ImageBackground 
        source={backgroundImage}
        style={styles.backgroundImage}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageLoaded(false)}
        resizeMode="cover"
      >
        {renderContent()}
      </ImageBackground>
    );
  } catch (error) {
    // Fallback to gradient if image fails to load
    backgroundContent = (
      <GradientBackground 
        colors={['#FFFFFF', '#F8F8FF']}
        style={styles.backgroundImage}
      >
        {renderContent()}
      </GradientBackground>
    );
  }

  // Extracted the content to avoid duplication
  function renderContent() {
    return (
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Platform.OS === 'ios' ? 50 : 20 }
        ]}
      >
        <View style={styles.appTitleContainer}>
          <Moon size={36} color="#000000" />
          <Text style={styles.appTitle}>Morpheus</Text>
        </View>
        
        
        <Button
          title="Get Started" 
          onPress={() => navigation.navigate("Input")}
          size="lg"
          icon={<ArrowRight size={18} color="#FFFFFF" style={{marginLeft: 8}} />}
          iconPosition="right"
          style={styles.startButton}
        />
      </ScrollView>
    );
  }

  return backgroundContent;
};

const InputScreen = ({ navigation }: { navigation: NavigationProp }) => {
  const [dream, setDream] = useState("");
  const [mood, setMood] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeDream = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Analyze the dream
      const analysis = await DreamAnalysisService.analyzeDream(dream, mood);
      
      // Save to Supabase
      const dreamData: DreamData = {
        dream_text: dream,
        mood: mood,
        analysis: analysis.emotional,
        symbols: analysis.symbolism,
        user_id: 'anonymous' // You can implement user authentication later
      };
      
      // await SupabaseService.saveDream(dreamData);
      
      // Navigate to analysis screen
      navigation.navigate('Analysis', { 
        analysis,
        dreamText: dream,
        mood: mood
      });
    } catch (error) {
      console.error("Error analyzing dream:", error);
      setError('Failed to analyze dream. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const continueToDetailed = () => {
    if (dream.trim().length === 0) {
      // You could add an alert here
      return;
    }
    navigation.navigate('DetailedInput', { dream, mood });
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
          style={styles.button}
          onPress={continueToDetailed}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

import { RouteProp } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type DetailedInputScreenProps = NativeStackScreenProps<RootStackParamList, 'DetailedInput'>;

const DetailedInputScreen = ({ route, navigation }: DetailedInputScreenProps) => {
  const { dream, mood } = route.params;
  const [emotionalIntensity, setEmotionalIntensity] = useState(3);
  const [lifeConnection, setLifeConnection] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [extractedKeywords, setExtractedKeywords] = useState<string[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

  useEffect(() => {
    // Extract keywords from dream narrative when component mounts
    const keywords = extractKeywords(dream);
    setExtractedKeywords(keywords);
  }, [dream]);

  const extractKeywords = (text: string): string[] => {
    // List of common stopwords to exclude
    const stopwords = [
      'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 
      'by', 'about', 'as', 'into', 'like', 'through', 'after', 'over', 'between', 
      'out', 'of', 'during', 'without', 'before', 'under', 'around', 'among',
      'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall', 'should',
      'can', 'could', 'may', 'might', 'must',
      'it', 'its', 'it\'s', 'they', 'them', 'their', 'theirs', 'that', 'this', 'those', 'these',
      'i', 'me', 'my', 'mine', 'you', 'your', 'yours', 'he', 'him', 'his', 'she', 'her', 'hers',
      'we', 'us', 'our', 'ours',
      'there', 'here', 'where', 'when', 'why', 'how', 'what', 'who', 'whom',
      'then', 'than', 'if', 'else', 'so'
    ];
    
    // Extract words, excluding stopwords and duplicates
    const words = text
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
      .split(/\s+/)
      .filter(word => !stopwords.includes(word))  // Filter out stopwords instead of by length
      .filter((word, index, self) => self.indexOf(word) === index);  // Remove duplicates
    
    // Return up to 10 keywords
    return words.slice(0, 10);
  };

  const toggleKeyword = (keyword: string) => {
    if (selectedKeywords.includes(keyword)) {
      setSelectedKeywords(selectedKeywords.filter(k => k !== keyword));
    } else {
      setSelectedKeywords([...selectedKeywords, keyword]);
    }
  };

  const analyzeDream = async () => {
    try {
      setIsLoading(true);
      
      const symbolsArray = selectedKeywords;
      
      const analysis = await DreamAnalysisService.analyzeDreamDetailed(
        dream, 
        mood, 
        symbolsArray, 
        emotionalIntensity, 
        lifeConnection
      );
      
      // Also save to Supabase like the InputScreen does
      const dreamData: DreamData = {
        dream_text: dream,
        mood: mood,
        analysis: analysis.emotional,
        symbols: analysis.symbolism,
        user_id: 'anonymous'
      };
      
      // await SupabaseService.saveDream(dreamData);
      
      // Include dreamText and mood in the navigation
      navigation.navigate('Analysis', { 
        analysis,
        dreamText: dream,
        mood: mood
      });
    } catch (error) {
      console.error('Error analyzing dream:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.label}>Important symbols or objects in your dream:</Text>
        <View style={styles.tagsContainer}>
          {extractedKeywords.map((keyword, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.tagButton,
                selectedKeywords.includes(keyword) && styles.tagButtonSelected
              ]}
              onPress={() => toggleKeyword(keyword)}
            >
              <Text 
                style={[
                  styles.tagButtonText,
                  selectedKeywords.includes(keyword) && styles.tagButtonTextSelected
                ]}
              >
                {keyword}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Text style={styles.label}>Emotional intensity: {emotionalIntensity.toFixed(1)}</Text>
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>Mild</Text>
          <Slider
            style={styles.slider}
            value={emotionalIntensity}
            onValueChange={setEmotionalIntensity}
            minimumValue={1}
            maximumValue={5}
            step={0.1}
            minimumTrackTintColor="#3269ad"
            maximumTrackTintColor="#00001020"
            thumbTintColor="#3269ad"
          />
          <Text style={styles.sliderLabel}>Intense</Text>
        </View>
        
        <Text style={styles.label}>How does this dream connect to your current life?</Text>
        <TextInput
          style={[styles.input, { minHeight: 80 }]}
          multiline
          value={lifeConnection}
          onChangeText={setLifeConnection}
          placeholder="Describe any connections to your waking life..."
          placeholderTextColor="#00001080"
          textAlignVertical="top"
        />
        
        <TouchableOpacity 
          style={[styles.button, (isLoading || !dream || !mood) && styles.buttonDisabled]}
          onPress={analyzeDream}
          disabled={isLoading || !dream || !mood}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Analyzing...' : 'Generate Analysis'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const AnalysisScreen = ({ route }: { route: { params: AnalysisScreenParams } }) => {
  const { analysis, dreamText, mood } = route.params;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.analysisTitle}>Dream Analysis</Text>
        
        {dreamText && (
          <View style={styles.dreamContainer}>
            <Text style={styles.dreamTitle}>Your Dream:</Text>
            <Text style={styles.dreamContent}>{dreamText}</Text>
            {mood && <Text style={styles.dreamMoodLabel}>Mood: <Text style={styles.dreamMoodText}>{mood}</Text></Text>}
          </View>
        )}
        
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

const DreamGalleryScreen = () => {
  const [dreams, setDreams] = useState<SavedDream[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    // Load dreams when the component mounts
    loadDreams();
  }, []);

  const loadDreams = async () => {
    setLoading(true);
    try {
      const fetchedDreams = await SupabaseService.getDreams();
      setDreams(fetchedDreams);
    } catch (error) {
      console.error('Error loading dreams:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteDream = async (dreamId: string) => {
    try {
      const success = await SupabaseService.deleteDream(dreamId);
      if (success) {
        // Refresh the list
        loadDreams();
      }
    } catch (error) {
      console.error('Error deleting dream:', error);
    }
  };

  const renderDreamItem = ({ item }: { item: SavedDream }) => (
    <View style={styles.dreamItem}>
      <View style={styles.dreamHeader}>
        <Text style={styles.dreamDate}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
        <Text style={styles.dreamMood}>{item.mood}</Text>
      </View>
      <Text style={styles.dreamText} numberOfLines={3}>
        {item.dream_text}
      </Text>
      <View style={styles.dreamActions}>
        <TouchableOpacity 
          style={styles.dreamAction}
          onPress={() => {
            // Convert saved dream to analysis format
            const analysis: Analysis = {
              symbolism: item.symbols || [],
              emotional: item.analysis,
              advice: "Review your dream journal regularly to identify patterns."
            };
            
            // Navigate to analysis screen with the data
            navigation.navigate('Analysis', { 
              analysis, 
              dreamText: item.dream_text,
              mood: item.mood
            });
          }}
        >
          <Text style={styles.actionText}>View Analysis</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.dreamAction, styles.deleteAction]}
          onPress={() => deleteDream(item.id)}
        >
          <Trash2 size={16} color="#f6547b" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.galleryTitle}>Dream Journal</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color="#ff6b6b" />
      ) : dreams.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No dreams saved yet</Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('Input')}
          >
            <Text style={styles.buttonText}>Record Your First Dream</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={dreams}
          renderItem={renderDreamItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.dreamList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const DashboardScreen = () => {
  const [recentDreams, setRecentDreams] = useState<SavedDream[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    // Load dreams when the component mounts
    loadDreams();
  }, []);

  const loadDreams = async () => {
    setLoading(true);
    try {
      const fetchedDreams = await SupabaseService.getDreams();
      setRecentDreams(fetchedDreams.slice(0, 3)); // Get just the 3 most recent dreams
    } catch (error) {
      console.error('Error loading dreams:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate some sample statistics
  const getDreamStats = () => {
    if (recentDreams.length === 0) return { total: 0, moods: {} };
    
    const moods: Record<string, number> = {};
    recentDreams.forEach(dream => {
      moods[dream.mood] = (moods[dream.mood] || 0) + 1;
    });
    
    return {
      total: recentDreams.length,
      moods
    };
  };

  const stats = getDreamStats();
  
  // Get most common mood
  const getMostCommonMood = () => {
    const moods = stats.moods;
    let maxMood = '';
    let maxCount = 0;
    
    for (const mood in moods) {
      if (moods[mood] > maxCount) {
        maxCount = moods[mood];
        maxMood = mood;
      }
    }
    
    return maxMood || 'None';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.dashboardTitle}>Dream Observatory</Text>
      
      <View style={styles.dashboardGrid}>
        {/* Recent Dreams */}
        <TouchableOpacity 
          style={styles.dashboardCard}
          onPress={() => navigation.navigate('Gallery')}
        >
          <View style={styles.cardHeader}>
            <Clock size={22} color="#3269ad" />
            <Text style={styles.cardTitle}>Recent Dreams</Text>
          </View>
          
          {loading ? (
            <ActivityIndicator size="small" color="#ff6b6b" />
          ) : recentDreams.length === 0 ? (
            <Text style={styles.emptyCardText}>No dreams recorded yet</Text>
          ) : (
            <View>
              {recentDreams.slice(0, 2).map((dream, index) => (
                <View key={dream.id} style={styles.recentDreamItem}>
                  <Text style={styles.recentDreamDate}>
                    {new Date(dream.created_at).toLocaleDateString()}
                  </Text>
                  <Text 
                    style={styles.recentDreamText} 
                    numberOfLines={1}
                  >
                    {dream.dream_text}
                  </Text>
                </View>
              ))}
              <Text style={styles.viewMoreText}>View all dreams →</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Dream Patterns */}
        <View style={styles.dashboardCard}>
          <View style={styles.cardHeader}>
            <Calendar size={22} color="#f6547b" />
            <Text style={styles.cardTitle}>Dream Patterns</Text>
          </View>
          
          <Text style={styles.statsLabel}>Total Dreams</Text>
          <Text style={styles.statsValue}>{stats.total}</Text>
          
          <Text style={styles.statsLabel}>Most Common Mood</Text>
          <Text style={styles.statsValue}>{getMostCommonMood()}</Text>
          
          <Text style={styles.comingSoonText}>More patterns coming soon</Text>
        </View>

        {/* Dream Insights */}
        <View style={styles.dashboardCard}>
          <View style={styles.cardHeader}>
            <Lightbulb size={22} color="#efc560" />
            <Text style={styles.cardTitle}>Dream Insights</Text>
          </View>
          
          <Text style={styles.insightText}>
            Dreams often reflect your subconscious mind processing emotions and experiences.
          </Text>
          
          <Text style={styles.insightText}>
            Regular dream journaling can help identify recurring themes and symbols.
          </Text>
          
          <Text style={styles.comingSoonText}>Personalized insights coming soon</Text>
        </View>

        {/* Dream Journal */}
        <TouchableOpacity 
          style={styles.dashboardCard}
          onPress={() => navigation.navigate('Gallery')}
        >
          <View style={styles.cardHeader}>
            <BookOpen size={22} color="#c159aa" />
            <Text style={styles.cardTitle}>Dream Journal</Text>
          </View>
          
          <Text style={styles.journalText}>
            Your dream journal helps you track and understand your dream patterns over time.
          </Text>
          
          <View style={styles.journalButtonContainer}>
            <TouchableOpacity 
              style={styles.journalButton}
              onPress={() => navigation.navigate('Input')}
            >
              <Text style={styles.journalButtonText}>Add Dream</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.journalButton, styles.viewJournalButton]}
              onPress={() => navigation.navigate('Gallery')}
            >
              <Text style={styles.journalButtonText}>View Journal</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function App() {
  // Use StatusBar.currentHeight for Android, use 44 for iOS
  const statusBarHeight =
    Platform.OS === "android" ? StatusBar.currentHeight || 0 : 44;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, paddingTop: statusBarHeight }}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <NavigationContainer
        theme={{
          dark: false,
          colors: {
            primary: theme.colors.primary,
            background: theme.colors.background,
            card: theme.colors.card,
            text: theme.colors.text.primary,
            border: 'rgba(0, 0, 16, 0.1)',
            notification: theme.colors.secondary,
          },
        }}
      >
        <Stack.Navigator
          initialRouteName="Intro"
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.colors.background,
            },
            headerTintColor: theme.colors.text.primary,
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 18,
            },
            headerBackTitle: "Back",
            contentStyle: {
              backgroundColor: theme.colors.background,
            },
            animation: "slide_from_right",
            headerShown: true,
            headerShadowVisible: false,
            headerBackVisible: true,
            headerBackTitleVisible: false,
            headerTitleAlign: "center",
            headerTitle: "",
          }}
        >
          <Stack.Screen
            name="Intro"
            component={IntroScreen}
            options={{
              headerShown: false,
              contentStyle: {
                backgroundColor: theme.colors.background,
              },
            }}
          />
          <Stack.Screen
            name="Input"
            component={InputScreen}
            options={{
              title: "Record Your Dream",
              contentStyle: {
                backgroundColor: theme.colors.background,
              },
            }}
          />
          <Stack.Screen 
            name="DetailedInput" 
            component={DetailedInputScreen as React.ComponentType<any>}
            options={{ 
              title: 'Dream Details',
              contentStyle: {
                backgroundColor: theme.colors.background,
              },
            }}
          />
          <Stack.Screen
            name="Analysis"
            component={AnalysisScreen as React.ComponentType<any>}
            options={{
              title: "Analysis Results",
              contentStyle: {
                backgroundColor: theme.colors.background,
              },
            }}
          />
          <Stack.Screen 
            name="Gallery" 
            component={DreamGalleryScreen}
            options={{ 
              title: 'Dream Journal',
              contentStyle: {
                backgroundColor: theme.colors.background,
              },
            }}
          />
          <Stack.Screen 
            name="Dashboard" 
            component={DashboardScreen}
            options={{ 
              title: 'Observatory',
              contentStyle: {
                backgroundColor: theme.colors.background,
              },
            }}
          />
        </Stack.Navigator>
        
        {/* Bottom Navigation Bar */}
        <NavigationBarWithState />
      </NavigationContainer>
    </View>
  );
}

// Separate component for the navigation bar with state access
const NavigationBarWithState = () => {
  const navigation = useNavigation<NavigationProp>();
  
  return (
    <GlassCard 
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderRadius: 0,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
      }}
      intensity={30}
    >
      <View style={{
        paddingVertical: 10,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-around',
      }}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate('Gallery')}
        >
          <Album size={24} color={theme.colors.primary} />
          <Text style={[styles.navButtonText, { color: theme.colors.text.primary }]}>Gallery</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate('Input')}
        >
          <View style={{
            position: 'relative',
            width: 48,
            height: 48,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.colors.secondary,
            borderRadius: 24,
            ...theme.shadows.md,
          }}>
            <Plus size={24} color="#FFFFFF" />
          </View>
          <Text style={[styles.navButtonText, { color: theme.colors.secondary, marginTop: 4 }]}>Add Dream</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <BarChart size={24} color={theme.colors.primaryDark} />
          <Text style={[styles.navButtonText, { color: theme.colors.text.primary }]}>Observatory</Text>
        </TouchableOpacity>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingBottom: Platform.OS === 'ios' ? 34 : 0, // Safe area bottom padding for iOS
  },
  scrollContent: {
    padding: 20,
    alignItems: "center",
    paddingBottom: Platform.OS === "ios" ? 90 : 60, // Extra padding at bottom for iOS and the nav bar
  },
  appTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    ...theme.shadows.md,
  },
  appTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    marginLeft: 12,
    color: theme.colors.text.primary,
  },
  featureCard: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
    minHeight: 220,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderWidth: 1,
    ...theme.shadows.md,
  },
  featureIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 10,
    ...theme.shadows.sm,
  },
  featureTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: "bold",
    marginBottom: 14,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: theme.fontSize.md,
    textAlign: 'center',
    color: theme.colors.text.secondary,
    maxWidth: '90%',
    lineHeight: 22,
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: theme.colors.primary,
    width: 24,
    borderRadius: 4,
    ...theme.shadows.sm,
  },
  startButton: {
    minWidth: 220,
    backgroundColor: theme.colors.primary,
    ...theme.shadows.md,
  },
  secondaryButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    width: '100%',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    maxWidth: '48%',
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: theme.radius.md,
    marginTop: 20,
    ...theme.shadows.sm,
  },
  buttonDisabled: {
    backgroundColor: 'rgba(0, 0, 16, 0.3)',
  },
  buttonText: {
    color: "#fff",
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    textAlign: 'center',
  },
  label: {
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    marginBottom: 8,
    alignSelf: 'flex-start',
    color: '#000010',
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 16, 0.2)',
    borderRadius: theme.radius.md,
    padding: 12,
    marginBottom: 20,
    minHeight: 100,
    color: '#000010',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    fontSize: theme.fontSize.md,
    lineHeight: 24,
  },
  analysisTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: '#000010',
  },
  analysisSection: {
    width: "100%",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 10,
    color: '#000010',
  },
  analysisText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#000010cc',
  },
  symbolismItem: {
    marginBottom: 15,
    backgroundColor: '#3269ad20',
    padding: 15,
    borderRadius: 8,
  },
  symbol: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 5,
    color: '#000010',
  },
  meaning: {
    fontSize: 16,
    color: '#00001080',
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  navButtonText: {
    fontSize: theme.fontSize.xs,
    marginTop: 5,
    fontWeight: '500',
  },
  galleryTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000010',
    alignSelf: 'flex-start',
  },
  dreamList: {
    paddingBottom: 100, // Extra space for the navigation bar
  },
  dreamItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#c159aa',
    shadowColor: '#000010',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dreamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dreamDate: {
    color: '#000010cc',
    fontSize: 14,
  },
  dreamMood: {
    color: '#c159aa',
    fontSize: 14,
    fontWeight: '500',
  },
  dreamText: {
    color: '#000010',
    fontSize: 16,
    marginBottom: 12,
  },
  dreamActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  dreamAction: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: '#3269ad20',
  },
  deleteAction: {
    backgroundColor: 'transparent',
  },
  actionText: {
    color: '#000010',
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyStateText: {
    color: '#000010cc',
    fontSize: 16,
    marginBottom: 20,
  },
  errorText: {
    color: '#f6547b',
    marginBottom: 15,
    fontSize: 14,
  },
  dreamContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: '#c159aa',
    shadowColor: '#000010',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dreamTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000010',
    marginBottom: 8,
  },
  dreamContent: {
    color: '#000010cc',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  dreamMoodLabel: {
    color: '#000010cc',
    fontSize: 14,
  },
  dreamMoodText: {
    color: '#c159aa',
    fontWeight: '500',
  },
  // Dashboard styles
  dashboardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000010',
    alignSelf: 'flex-start',
  },
  dashboardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  dashboardCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#c159aa',
    shadowColor: '#000010',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    color: '#000010',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  recentDreamItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff15',
    paddingBottom: 10,
    marginBottom: 10,
  },
  recentDreamDate: {
    color: '#000010aa',
    fontSize: 12,
    marginBottom: 2,
  },
  recentDreamText: {
    color: '#000010',
    fontSize: 14,
  },
  viewMoreText: {
    color: '#3269ad',
    fontSize: 14,
    marginTop: 6,
    textAlign: 'right',
  },
  statsLabel: {
    color: '#000010aa',
    fontSize: 14,
    marginBottom: 4,
  },
  statsValue: {
    color: '#000010',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  insightText: {
    color: '#000010',
    fontSize: 14,
    marginBottom: 10,
  },
  comingSoonText: {
    color: '#f6547b',
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 4,
  },
  journalText: {
    color: '#000010',
    fontSize: 14,
    marginBottom: 12,
  },
  journalButtonContainer: {
    flexDirection: 'column',
    gap: 8,
  },
  journalButton: {
    backgroundColor: '#f6547b',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  viewJournalButton: {
    backgroundColor: '#3269ad',
  },
  journalButtonText: {
    color: '#000010',
    fontSize: 13,
    fontWeight: '500',
  },
  emptyCardText: {
    color: '#00001080',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    width: '100%',
  },
  tagButton: {
    backgroundColor: '#00001010',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    margin: 4,
    borderWidth: 1,
    borderColor: '#00001020',
  },
  tagButtonSelected: {
    backgroundColor: '#3269ad',
    borderColor: '#3269ad',
  },
  tagButtonText: {
    color: '#000010cc',
    fontSize: 14,
  },
  tagButtonTextSelected: {
    color: '#fff',
    fontWeight: '500',
  },
  sliderContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 10,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#00001080',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
