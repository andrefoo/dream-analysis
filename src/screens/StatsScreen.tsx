import React, { useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Dimensions
} from 'react-native';
import { useDreamContext, MoodType } from '../context/DreamContext';
import { format, parseISO, subDays } from 'date-fns';

const { width } = Dimensions.get('window');

const StatsScreen = () => {
  const { entries } = useDreamContext();

  // Compute stats
  const stats = useMemo(() => {
    // Count mood occurrences
    const moodCounts: Record<MoodType, number> = {
      great: 0,
      good: 0,
      neutral: 0,
      bad: 0,
      terrible: 0
    };

    // Calculate sleep quality average
    let sleepQualityTotal = 0;
    
    // Count entries in the last 7 days
    const last7Days = Array(7).fill(0).map((_, i) => ({
      date: format(subDays(new Date(), 6 - i), 'yyyy-MM-dd'),
      count: 0
    }));
    
    // Process each entry
    entries.forEach(entry => {
      // Count moods
      if (entry.mood in moodCounts) {
        moodCounts[entry.mood as MoodType]++;
      }
      
      // Add to sleep quality total
      sleepQualityTotal += entry.sleepQuality;
      
      // Check if entry is in the last 7 days
      const entryDate = format(parseISO(entry.date), 'yyyy-MM-dd');
      const dayIndex = last7Days.findIndex(day => day.date === entryDate);
      if (dayIndex >= 0) {
        last7Days[dayIndex].count++;
      }
    });
    
    // Calculate average sleep quality (or default to 0 if no entries)
    const sleepQualityAvg = entries.length > 0 
      ? sleepQualityTotal / entries.length 
      : 0;
    
    // Collect tag statistics
    const tagCounts: Record<string, number> = {};
    entries.forEach(entry => {
      entry.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    
    // Sort tags by count (descending)
    const mostCommonTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Get top 5 tags
    
    return {
      moodCounts,
      sleepQualityAvg,
      totalEntries: entries.length,
      lastWeekEntries: last7Days,
      mostCommonTags
    };
  }, [entries]);

  // Function to get mood color
  const getMoodColor = (mood: MoodType) => {
    switch (mood) {
      case 'great': return '#4CAF50';
      case 'good': return '#8BC34A';
      case 'neutral': return '#FFC107';
      case 'bad': return '#FF9800';
      case 'terrible': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Dream Summary</Text>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{stats.totalEntries}</Text>
            <Text style={styles.summaryLabel}>Total Entries</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{stats.sleepQualityAvg.toFixed(1)}/5</Text>
            <Text style={styles.summaryLabel}>Avg. Sleep Quality</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {stats.mostCommonTags.length > 0 ? stats.mostCommonTags[0].tag : 'N/A'}
            </Text>
            <Text style={styles.summaryLabel}>Top Tag</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Mood Distribution</Text>
        <View style={styles.moodChartContainer}>
          {Object.entries(stats.moodCounts).map(([mood, count]) => {
            if (count === 0) return null;
            const moodType = mood as MoodType;
            const percentage = (count / stats.totalEntries) * 100;
            return (
              <View key={mood} style={styles.moodBar}>
                <View style={styles.moodBarLabelContainer}>
                  <View style={[styles.moodDot, { backgroundColor: getMoodColor(moodType) }]} />
                  <Text style={styles.moodBarLabel}>{mood}</Text>
                </View>
                <View style={styles.moodBarContainer}>
                  <View 
                    style={[
                      styles.moodBarFill, 
                      { 
                        width: `${percentage}%`,
                        backgroundColor: getMoodColor(moodType)
                      }
                    ]} 
                  />
                  <Text style={styles.moodBarValue}>{count}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Most Common Tags</Text>
        {stats.mostCommonTags.length === 0 ? (
          <Text style={styles.noDataText}>No tags data available</Text>
        ) : (
          <View style={styles.tagBarsContainer}>
            {stats.mostCommonTags.map((item, index) => (
              <View key={index} style={styles.tagBarItem}>
                <Text style={styles.tagBarLabel}>{item.tag}</Text>
                <View style={styles.tagBarWrapper}>
                  <View 
                    style={[
                      styles.tagBar, 
                      { width: `${Math.min(100, (item.count / stats.totalEntries) * 100)}%` }
                    ]} 
                  />
                  <Text style={styles.tagBarValue}>{item.count}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Entries Past Week</Text>
        <View style={styles.weekContainer}>
          {stats.lastWeekEntries.map((day, index) => {
            const dayName = format(parseISO(day.date), 'EEE');
            return (
              <View key={index} style={styles.dayItem}>
                <Text style={styles.dayName}>{dayName}</Text>
                <View 
                  style={[
                    styles.dayIndicator,
                    { opacity: day.count > 0 ? 1 : 0.3 }
                  ]}
                >
                  <Text style={styles.dayCount}>{day.count}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 16,
  },
  card: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00adf5',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#aaa',
  },
  moodChartContainer: {
    marginTop: 8,
  },
  moodBar: {
    marginBottom: 12,
  },
  moodBarLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  moodDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  moodBarLabel: {
    color: '#ddd',
    fontSize: 14,
  },
  moodBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
  },
  moodBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  moodBarValue: {
    marginLeft: 8,
    color: '#fff',
  },
  noDataText: {
    color: '#777',
    textAlign: 'center',
    marginVertical: 40,
  },
  tagBarsContainer: {
    marginTop: 8,
  },
  tagBarItem: {
    marginBottom: 12,
  },
  tagBarLabel: {
    color: '#ddd',
    marginBottom: 4,
  },
  tagBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 24,
  },
  tagBar: {
    height: '100%',
    backgroundColor: '#00adf5',
    borderRadius: 4,
  },
  tagBarValue: {
    color: '#fff',
    marginLeft: 8,
  },
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayItem: {
    alignItems: 'center',
  },
  dayName: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 8,
  },
  dayIndicator: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#00adf5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCount: {
    color: '#fff',
    fontWeight: 'bold',
  }
});

export default StatsScreen;