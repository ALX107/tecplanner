import React, { createContext, useState, useEffect } from 'react';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const fetchThemePreference = async () => {
      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (userDoc.exists()) {
            // Si el campo no existe, establecer valor predeterminado (falso)
            const themePreference = userDoc.data().isDarkMode ?? false;
            setIsDarkMode(themePreference);

            // Si el campo no existe en Firestore, agregarlo con el valor predeterminado
            if (!userDoc.data().hasOwnProperty('isDarkMode')) {
              await updateDoc(doc(db, 'users', auth.currentUser.uid), { isDarkMode: false });
            }
          }
        } catch (error) {
          console.error('Error al cargar la preferencia de tema:', error);
        }
      }
    };

    fetchThemePreference();
  }, [auth.currentUser]);

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      if (auth.currentUser) {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), { isDarkMode: newTheme });
      }
    } catch (error) {
      console.error('Error al actualizar la preferencia de tema:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
