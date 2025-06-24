import { FC } from "react";
import { Button } from 'primereact/button'
import { useLang } from "../../../providers/lang-provider";
import { useTheme } from "../../../providers/theme-provider";

const Settings: FC = () => {
  const { theme, toggleTheme } = useTheme()
  const { lang, words, toggleLang } = useLang()
  return (<div style={{
    position: 'fixed',
    top: '20px',
    right: '20px',
    minHeight: '49px',
    display: 'flex',
    minWidth: '170px',
    justifyContent: 'center'
  }}>
    <span
      className="p-buttonset"
      style={{
        boxShadow: `1px 1px 3px rgba(0,0,0,0.2)`
      }}>
      <Button
        className="btn-setting"
        onClick={toggleLang}
        label={words?.[lang][lang]}
        icon="pi pi-language"
        text
        style={{
          borderRadius: 0,
          flex: 1,
          fontWeight: '400',
          textTransform: 'uppercase',
          minHeight: '49px',
          minWidth: '90px'
        }} />
      <Button
        className="btn-setting"
        onClick={toggleTheme}
        label={words?.[theme][lang]}
        icon={`pi pi-${theme === 'light' ? 'sun' : 'moon'}`}
        text
        style={{
          borderRadius: 0,
          flex: 1,
          fontWeight: '400',
          textTransform: 'uppercase',
          minHeight: '49px',
          minWidth: '90px'
        }} />
    </span>
  </div>)
}
export default Settings