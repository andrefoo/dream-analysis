export type RootStackParamList = {
  Intro: undefined;
  Input: undefined;
  Analysis: { 
    analysis: {
      symbolism: { symbol: string; meaning: string }[];
      emotional: string;
      advice: string;
    } 
  };
  MainTabs: undefined;
  Calendar: undefined;
  DreamDetail: { id: string };
  EditEntry: { id: string };
  Stats: undefined;
  Journal: undefined;
  NewEntry: undefined;
}; 