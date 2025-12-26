import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  theme: 'light' | 'dark';
  soundEnabled: boolean;
  fontSize: 'small' | 'medium' | 'large';
  toggleTheme: () => void;
  toggleSound: () => void;
 setFontSize: (size: 'small' | 'medium' | 'large') => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'light',
      soundEnabled: true,
      fontSize: 'medium',
      
      toggleTheme: () => 
        set((state) => ({ 
          theme: state.theme === 'light' ? 'dark' : 'light' 
        })),
      
      toggleSound: () => 
        set((state) => ({ 
          soundEnabled: !state.soundEnabled 
        })),
      
      setFontSize: (size) => 
        set(() => ({ 
          fontSize: size 
        })),
    }),
    {
      name: 'ui-store',
    }
 )
);