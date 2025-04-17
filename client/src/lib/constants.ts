// API configurations
export const TRIVIA_API_BASE_URL = 'https://opentdb.com/api.php';

// Quiz configuration defaults
export const DEFAULT_QUIZ_PARAMS = {
  amount: 10,
  difficulty: '',
  type: '', 
  category: 0
};

// Available categories from the Trivia API
export const TRIVIA_CATEGORIES = [
  { id: 9, name: 'General Knowledge' },
  { id: 10, name: 'Entertainment: Books' },
  { id: 11, name: 'Entertainment: Film' },
  { id: 12, name: 'Entertainment: Music' },
  { id: 13, name: 'Entertainment: Musicals & Theatres' },
  { id: 14, name: 'Entertainment: Television' },
  { id: 15, name: 'Entertainment: Video Games' },
  { id: 16, name: 'Entertainment: Board Games' },
  { id: 17, name: 'Science & Nature' },
  { id: 18, name: 'Science: Computers' },
  { id: 19, name: 'Science: Mathematics' },
  { id: 20, name: 'Mythology' },
  { id: 21, name: 'Sports' },
  { id: 22, name: 'Geography' },
  { id: 23, name: 'History' },
  { id: 24, name: 'Politics' },
  { id: 25, name: 'Art' },
  { id: 26, name: 'Celebrities' },
  { id: 27, name: 'Animals' },
  { id: 28, name: 'Vehicles' },
  { id: 29, name: 'Entertainment: Comics' },
  { id: 30, name: 'Science: Gadgets' },
  { id: 31, name: 'Entertainment: Japanese Anime & Manga' },
  { id: 32, name: 'Entertainment: Cartoon & Animations' },
];

// Difficulty levels
export const DIFFICULTY_LEVELS = [
  { id: '', name: 'Any Difficulty' },
  { id: 'easy', name: 'Easy' },
  { id: 'medium', name: 'Medium' },
  { id: 'hard', name: 'Hard' },
];

// Question types
export const QUESTION_TYPES = [
  { id: '', name: 'Any Type' },
  { id: 'multiple', name: 'Multiple Choice' },
  { id: 'boolean', name: 'True / False' },
];

// Local storage keys
export const LOCAL_STORAGE_KEYS = {
  PLAYER_DATA: 'trivia_player_data',
  QUIZ_HISTORY: 'trivia_quiz_history',
};

// 3D scene configuration
export const SCENE_CONFIG = {
  cameraPosition: [0, 5, 10],
  lightIntensity: 1,
  planeSize: 20,
  backgroundColor: '#1a237e',
};
