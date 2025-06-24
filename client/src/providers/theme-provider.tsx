import { FC, ReactNode, useState, useEffect, createContext, useContext } from "react"
import { themes, syncFusionThemes } from "../constants"
import { get, set } from "../utils/local-storage-util"

export type TThemeContextProps = {
  theme: 'light' | 'dark',
  toggleTheme: () => void
}

export const ThemeContext = createContext<TThemeContextProps>({
  theme: get('conical-theme') != 'dark' ? 'light' : 'dark',
  toggleTheme: () => { }
})

const link = document.getElementById('theme-link')
const syncfusionLink = document.getElementById('syncfusion-theme-link')
const ThemeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [
    theme,
    setTheme
  ] = useState<'light' | 'dark'>(get('conical-theme') != 'dark' ? 'light' : 'dark')
  const toggleTheme = () => {
    setTheme(_ => theme === 'light' ? 'dark' : 'light')
    set({
      key: 'conical-theme',
      value: theme === 'light' ? 'dark' : 'light'
    })
  }
  useEffect(() => {
    link?.setAttribute('href', theme === 'light' ? themes.light : themes.dark)
    syncfusionLink?.setAttribute('href', theme === 'light' ?
      syncFusionThemes.light : syncFusionThemes.dark)
  }, [theme])
  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme
      }}>
      {children}
    </ThemeContext.Provider>
  )
}
export default ThemeProvider
export const useTheme = () => useContext(ThemeContext)