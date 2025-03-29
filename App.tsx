import React from 'react';
import { StyleSheet, View, StatusBar, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DreamProvider } from './src/context/DreamContext';
import { Brain, Calendar, FileText, BarChart, PlusCircle, Home as HomeIcon } from 'lucide-react-native';

// Screens
import IntroScreen from './src/screens/IntroScreen';
import InputScreen from './src/screens/InputScreen';
import AnalysisScreen from './src/screens/AnalysisScreen';
import HomeScreen from './src/screens/HomeScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import JournalScreen from './src/screens/JournalScreen';
import StatsScreen from './src/screens/StatsScreen';
import DreamDetailScreen from './src/screens/DreamDetailScreen';
import NewEntryScreen from './src/screens/NewEntryScreen';
import EditEntryScreen from './src/screens/EditEntryScreen';

import { RootStackParamList } from './src/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();
const queryClient = new QueryClient();

// Main tab navigation
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#111',
          borderTopColor: '#222',
          height: 60,
          paddingBottom: 10,
          paddingTop: 5,
        },
        tabBarActiveTintColor: '#00adf5',
        tabBarInactiveTintColor: '#777',
        headerStyle: {
          backgroundColor: '#000',
        },
        headerTitleStyle: {
          color: '#fff',
          fontWeight: 'bold',
        },
        headerTintColor: '#fff',
        tabBarLabelStyle: {
          fontSize: 12,
        },
        headerShadowVisible: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarIcon: ({ color }) => <HomeIcon size={22} color={color} />,
          title: 'Home',
        }}
      />
      <Tab.Screen 
        name="Calendar" 
        component={CalendarScreen} 
        options={{
          tabBarIcon: ({ color }) => <Calendar size={22} color={color} />,
          title: 'Calendar',
        }}
      />
      <Tab.Screen
        name="NewEntry"
        component={NewEntryScreen}
        options={{
          tabBarIcon: ({ color }) => <PlusCircle size={22} color={color} />,
          title: 'New Dream',
        }}
      />
      <Tab.Screen 
        name="Journal" 
        component={JournalScreen} 
        options={{
          tabBarIcon: ({ color }) => <FileText size={22} color={color} />,
          title: 'Journal',
        }}
      />
      <Tab.Screen 
        name="Stats" 
        component={StatsScreen} 
        options={{
          tabBarIcon: ({ color }) => <BarChart size={22} color={color} />,
          title: 'Statistics',
        }}
      />
    </Tab.Navigator>
  );
};

export default function App() {
  // Use StatusBar.currentHeight for Android, use 44 for iOS
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 44;

  return (
    <QueryClientProvider client={queryClient}>
      <DreamProvider>
        <View style={{ flex: 1, backgroundColor: '#000', paddingTop: statusBarHeight }}>
          <StatusBar barStyle="light-content" backgroundColor="#000" />
          <NavigationContainer
            theme={{
              dark: true,
              colors: {
                primary: '#00adf5',
                background: '#000',
                card: '#000',
                text: '#fff',
                border: '#222',
                notification: '#00adf5',
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
                headerShadowVisible: false,
                headerBackTitleVisible: false,
                headerTitleAlign: 'center',
              }}
            >
              <Stack.Screen 
                name="Intro" 
                component={IntroScreen} 
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="Input" 
                component={InputScreen}
                options={{ title: 'Record Your Dream' }}
              />
              <Stack.Screen 
                name="Analysis" 
                component={AnalysisScreen}
                options={{ title: 'Analysis Results' }}
              />
              <Stack.Screen
                name="MainTabs"
                component={MainTabs}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="DreamDetail"
                component={DreamDetailScreen}
                options={{ title: 'Dream Details' }}
              />
              <Stack.Screen
                name="EditEntry"
                component={EditEntryScreen}
                options={{ title: 'Edit Dream' }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </View>
      </DreamProvider>
    </QueryClientProvider>
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