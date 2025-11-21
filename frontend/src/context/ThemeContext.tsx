import { createContext, useState, useEffect, useContext } from "react";

type Theme = 'light' | 'dark';

interface ThemeContextProps {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>(()=>{
        return (localStorage.getItem('theme') as Theme || 'light');
    });

    useEffect(() =>{
     document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
    },[theme]);

    const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () =>{
    const context = useContext(ThemeContext);
    if(!context){
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}