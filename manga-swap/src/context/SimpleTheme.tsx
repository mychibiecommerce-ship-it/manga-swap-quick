import React, { createContext, useContext } from 'react';

// Theme clair uniquement
export const COLORS = {
  primary: '#FF6B6B',
  secondary: '#4ECDC4',
  background: '#FFFFFF',
  surface: '#F8F9FA',
  text: '#212529',
  textSecondary: '#6C757D',
  textLight: '#ADB5BD',
  border: '#DEE2E6',
  success: '#51CF66',
  error: '#FF6B6B',
  warning: '#FFA500',
  card: '#FFFFFF',
};

interface SimpleThemeContextType {
  colors: typeof COLORS;
}

const SimpleThemeContext = createContext<SimpleThemeContextType>({
  colors: COLORS,
});

export const SimpleThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SimpleThemeContext.Provider value={{ colors: COLORS }}>
      {children}
    </SimpleThemeContext.Provider>
  );
};

export const useSimpleTheme = () => useContext(SimpleThemeContext);