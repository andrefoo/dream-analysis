import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Brain, Heart, Star, Zap, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react-native';

type IntroNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Intro'>;

const IntroScreen = () => {
  const navigation = useNavigation<IntroNavigationProp>();
  const [currentPage, setCurrentPage] = useState(0);
  
  const features = [
    {
      icon: <Brain size={60} color="#00adf5" />,
      title: "AI-Powered Analysis",
      description: "Advanced algorithms analyze your dream patterns and symbolism to provide personalized insights.",
    },
    {
      icon: <Heart size={60} color="#00adf5" />,
      title: "Track Your Mood",
      description: "Record your mood and sleep quality to discover patterns in your dreams and emotions.",
    },
    {
      icon: <Star size={60} color="#00adf5" />,
      title: "Dream Journal",
      description: "Keep a detailed journal of your dreams with tags, notes, and analysis all in one place.",
    },
    {
      icon: <Zap size={60} color="#00adf5" />,
      title: "Visualize Trends",
      description: "See statistics and patterns in your dream journal to gain deeper understanding of your subconscious.",
    },
  ];
  
  const nextPage = () => {
    if (currentPage < features.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      navigation.replace('MainTabs');
    }
  };
  
  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const skipToApp = () => {
    navigation.replace('MainTabs');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.appTitle}>Dream Analysis</Text>
          <Text style={styles.appSubtitle}>Understand your dreams</Text>
        </View>
        
        <View style={styles.featureContainer}>
          {features[currentPage].icon}
          <Text style={styles.featureTitle}>{features[currentPage].title}</Text>
          <Text style={styles.featureDescription}>{features[currentPage].description}</Text>
        </View>
        
        <View style={styles.paginationContainer}>
          {features.map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.paginationDot, 
                currentPage === index && styles.paginationDotActive
              ]} 
            />
          ))}
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        {currentPage > 0 ? (
          <TouchableOpacity 
            style={styles.navButton} 
            onPress={prevPage}
          >
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.skipButton} 
            onPress={skipToApp}
          >
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.nextButton}
          onPress={nextPage}
        >
          {currentPage < features.length - 1 ? (
            <ChevronRight size={24} color="#fff" />
          ) : (
            <>
              <Text style={styles.getStartedText}>Get Started</Text>
              <ArrowRight size={20} color="#fff" style={{ marginLeft: 8 }} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 18,
    color: '#aaa',
  },
  featureContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  featureTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    lineHeight: 24,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#333',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#00adf5',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  navButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButton: {
    flexDirection: 'row',
    height: 50,
    paddingHorizontal: 24,
    borderRadius: 25,
    backgroundColor: '#00adf5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  getStartedText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  skipButton: {
    height: 50,
    justifyContent: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    color: '#aaa',
  },
});

export default IntroScreen;