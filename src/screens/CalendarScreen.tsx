import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { Calendar as RNCalendar } from 'react-native-calendars';
import { useDreamContext, DreamEntry } from '../context/DreamContext';
import { format } from 'date-fns';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type CalendarNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Calendar'>;

const CalendarScreen = () => {
  const navigation = useNavigation<CalendarNavigationProp>();
  const { entries } = useDreamContext();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [entriesForSelectedDate, setEntriesForSelectedDate] = useState<DreamEntry[]>([]);

  // Prepare marked dates for the calendar
  const markedDates = entries.reduce((acc, entry) => {
    const dateStr = format(new Date(entry.date), 'yyyy-MM-dd');
    return {
      ...acc,
      [dateStr]: {
        marked: true,
        dotColor: getMoodColor(entry.mood),
        selected: dateStr === selectedDate,
        selectedColor: 'rgba(128, 128, 128, 0.3)',
      }
    };
  }, {
    [selectedDate]: {
      selected: true,
      selectedColor: 'rgba(128, 128, 128, 0.3)',
    }
  });

  // Function to get mood color
  function getMoodColor(mood: string) {
    switch (mood) {
      case 'great': return '#4CAF50';
      case 'good': return '#8BC34A';
      case 'neutral': return '#FFC107';
      case 'bad': return '#FF9800';
      case 'terrible': return '#F44336';
      default: return '#9E9E9E';
    }
  }

  // Update entries for selected date
  React.useEffect(() => {
    const filteredEntries = entries.filter(entry => 
      format(new Date(entry.date), 'yyyy-MM-dd') === selectedDate
    );
    setEntriesForSelectedDate(filteredEntries);
  }, [selectedDate, entries]);

  // Handle date selection
  const onDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
  };

  // Navigate to dream detail
  const navigateToDreamDetail = (id: string) => {
    navigation.navigate('DreamDetail', { id });
  };

  return (
    <View style={styles.container}>
      <RNCalendar
        markedDates={markedDates}
        onDayPress={onDayPress}
        theme={{
          backgroundColor: '#000',
          calendarBackground: '#000',
          textSectionTitleColor: '#fff',
          selectedDayBackgroundColor: '#333',
          selectedDayTextColor: '#fff',
          todayTextColor: '#00adf5',
          dayTextColor: '#fff',
          textDisabledColor: '#444',
          dotColor: '#00adf5',
          selectedDotColor: '#fff',
          arrowColor: '#00adf5',
          monthTextColor: '#fff',
          indicatorColor: '#fff',
          textDayFontWeight: '300',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '300'
        }}
      />
      
      <View style={styles.entriesContainer}>
        <Text style={styles.dateTitle}>
          {format(new Date(selectedDate), 'MMMM dd, yyyy')}
        </Text>
        
        {entriesForSelectedDate.length === 0 ? (
          <View style={styles.noEntries}>
            <Text style={styles.noEntriesText}>No dream entries for this date</Text>
          </View>
        ) : (
          <FlatList
            data={entriesForSelectedDate}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.entryCard}
                onPress={() => navigateToDreamDetail(item.id)}
              >
                <View style={styles.entryHeader}>
                  <View style={[styles.moodIndicator, { backgroundColor: getMoodColor(item.mood) }]} />
                  <Text style={styles.entryTime}>
                    {format(new Date(item.date), 'h:mm a')}
                  </Text>
                </View>
                <Text style={styles.entryTitle} numberOfLines={1}>
                  {item.dreamContent.substring(0, 30)}
                  {item.dreamContent.length > 30 ? '...' : ''}
                </Text>
                <View style={styles.tagContainer}>
                  {item.tags.slice(0, 3).map((tag, idx) => (
                    <View key={idx} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                  {item.tags.length > 3 && (
                    <Text style={styles.moreTagsText}>+{item.tags.length - 3} more</Text>
                  )}
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  entriesContainer: {
    flex: 1,
    padding: 15,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  noEntries: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noEntriesText: {
    color: '#777',
    fontSize: 16,
  },
  entryCard: {
    backgroundColor: '#111',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
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
  entryTime: {
    color: '#aaa',
    fontSize: 14,
  },
  entryTitle: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
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
  }
});

export default CalendarScreen;