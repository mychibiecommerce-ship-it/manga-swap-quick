export interface Theme {
  background: string;
  surface: string;
  surfaceVariant: string;
  primary: string;
  primaryVariant: string;
  secondary: string;
  secondaryVariant: string;
  accent: string;
  text: string;
  textSecondary: string;
  textLight: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  card: string;
  shadow: string;
  overlay: string;
}

export const lightTheme: Theme = {
  background: '#FFFFFF',
  surface: '#F8F9FA',
  surfaceVariant: '#E9ECEF',
  primary: '#FF6B6B',
  primaryVariant: '#FF5252',
  secondary: '#4ECDC4',
  secondaryVariant: '#26A69A',
  accent: '#FFE66D',
  text: '#212529',
  textSecondary: '#6C757D',
  textLight: '#ADB5BD',
  border: '#DEE2E6',
  success: '#51CF66',
  warning: '#FFD43B',
  error: '#FF6B6B',
  card: '#FFFFFF',
  shadow: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const darkTheme: Theme = {
  background: '#121212',
  surface: '#1E1E1E',
  surfaceVariant: '#2D2D30',
  primary: '#FF6B6B',
  primaryVariant: '#FF5252',
  secondary: '#4ECDC4',
  secondaryVariant: '#26A69A',
  accent: '#FFE66D',
  text: '#FFFFFF',
  textSecondary: '#B3B3B3',
  textLight: '#666666',
  border: '#3D3D3D',
  success: '#51CF66',
  warning: '#FFD43B',
  error: '#FF6B6B',
  card: '#1E1E1E',
  shadow: 'rgba(0, 0, 0, 0.3)',
  overlay: 'rgba(0, 0, 0, 0.7)',
};