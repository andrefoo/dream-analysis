import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

export type MoodType = 'great' | 'good' | 'neutral' | 'bad' | 'terrible';

export interface DreamEntry {
  id: string;
  date: string;
  mood: MoodType;
  sleepQuality: number; // 1-5
  dreamContent: string;
  tags: string[];
  analysis?: {
    symbolism: { symbol: string; meaning: string }[];
    emotional: string;
    advice: string;
  };
  notes?: string;
  voiceMemoUrl?: string;
}

interface DreamContextType {
  entries: DreamEntry[];
  addEntry: (entry: DreamEntry) => void;
  updateEntry: (entry: DreamEntry) => void;
  deleteEntry: (id: string) => void;
  getEntryById: (id: string) => DreamEntry | undefined;
  loading: boolean;
}

// Create a default empty context
const DreamContext = createContext<DreamContextType | undefined>(undefined);

const STORAGE_KEY = '@dream_entries';

// Sample mock data for testing
const generateMockEntries = (): DreamEntry[] => {
  const today = new Date();
  
  return [
    {
      id: '1',
      date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      mood: 'good',
      sleepQuality: 4,
      dreamContent: 'I was flying over a beautiful landscape with mountains and lakes.',
      tags: ['flying', 'nature'],
      analysis: {
        symbolism: [
          { symbol: 'Flying', meaning: 'Represents freedom and liberation' },
          { symbol: 'Mountains', meaning: 'Challenges you are facing or will face' }
        ],
        emotional: 'You are feeling a sense of freedom and adventure.',
        advice: 'Embrace new opportunities coming your way.'
      }
    },
    {
      id: '2',
      date: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      mood: 'neutral',
      sleepQuality: 3,
      dreamContent: 'I was in a maze trying to find my way out.',
      tags: ['maze', 'confusion'],
      analysis: {
        symbolism: [
          { symbol: 'Maze', meaning: 'Feeling lost or confused in some aspect of your life' }
        ],
        emotional: 'You may be feeling uncertain about a decision.',
        advice: 'Take your time to consider all options before making important decisions.'
      }
    },
    {
      id: '3',
      date: today.toISOString(),
      mood: 'great',
      sleepQuality: 5,
      dreamContent: 'I reunited with old friends at a beautiful beach house.',
      tags: ['friends', 'beach', 'reunion'],
      analysis: {
        symbolism: [
          { symbol: 'Friends', meaning: 'Represent aspects of yourself or emotional connections' },
          { symbol: 'Beach', meaning: 'Interface between conscious and unconscious mind' }
        ],
        emotional: 'You are feeling nostalgic and connected to your past.',
        advice: 'Reach out to old friends, it may bring you joy and closure.'
      }
    }
  ];
};

export const DreamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [entries, setEntries] = useState<DreamEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load entries from AsyncStorage on component mount
  useEffect(() => {
    const loadEntries = async () => {
      try {
        const storedEntries = await AsyncStorage.getItem(STORAGE_KEY);
        
        if (storedEntries) {
          setEntries(JSON.parse(storedEntries));
        } else {
          // Use mock data for first-time users
          const mockEntries = generateMockEntries();
          setEntries(mockEntries);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mockEntries));
        }
      } catch (error) {
        console.error('Error loading dream entries:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEntries();
  }, []);

  // Save entries to AsyncStorage whenever they change
  useEffect(() => {
    const saveEntries = async () => {
      if (!loading && entries.length > 0) {
        try {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
        } catch (error) {
          console.error('Error saving dream entries:', error);
        }
      }
    };

    saveEntries();
  }, [entries, loading]);

  const addEntry = (entry: DreamEntry) => {
    // Ensure entry has an ID
    const newEntry = entry.id ? entry : { ...entry, id: uuidv4() };
    setEntries(prev => [newEntry, ...prev]);
  };

  const updateEntry = (updatedEntry: DreamEntry) => {
    setEntries(prev => 
      prev.map(entry => 
        entry.id === updatedEntry.id ? updatedEntry : entry
      )
    );
  };

  const deleteEntry = (id: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const getEntryById = (id: string) => {
    return entries.find(entry => entry.id === id);
  };

  return (
    <DreamContext.Provider 
      value={{ 
        entries, 
        addEntry, 
        updateEntry, 
        deleteEntry,
        getEntryById,
        loading
      }}
    >
      {children}
    </DreamContext.Provider>
  );
};

export const useDreamContext = () => {
  const context = useContext(DreamContext);
  if (context === undefined) {
    throw new Error('useDreamContext must be used within a DreamProvider');
  }
  return context;
};