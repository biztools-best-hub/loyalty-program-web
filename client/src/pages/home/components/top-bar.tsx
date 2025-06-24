import { FC, SyntheticEvent, useEffect, useRef, useState } from "react";
import camboFlag from '../../../assets/images/cambodia_flag.png'
import britFlag from '../../../assets/images/british_flag.png'
import { Menu } from 'primereact/menu'
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Avatar } from 'primereact/avatar'
import { extractAvatarText, firstUpper } from "../../../utils/text-util";
import { MenuItem } from "primereact/menuitem";
import avatar from '../../../assets/images/avatar.png'
import { useLang } from "../../../providers/lang-provider";
import { useSidebar } from "../../../providers/side-bar-provider";
import { useTheme } from "../../../providers/theme-provider";
import { useUser } from "../../../providers/user-provider";
import { useLogout } from "../../../utils/hooks";
import NotificationBell from "./notification-bell";
import { useSearchBox } from "../../../providers/search-box-provider";
import '../../../assets/css/home.css'
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
const TopBar: FC = () => {
  const logout = useLogout();
  const { search, value, onChange, visibility, replacement } = useSearchBox()
  const { toggle, isOpen, trigger: sideBarTrigger } = useSidebar()
  const { theme } = useTheme()
  const { user } = useUser()
  const { lang, words, toggleLang } = useLang()
  const menu = useRef<Menu>(null)
  const langMenu = useRef<Menu>(null)
  const searchBox = useRef<HTMLInputElement>(null)
  const openMenu = (e: SyntheticEvent<Element, Event>) => menu.current?.toggle(e)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const langCodes: (MenuItem & { code: string, flag: string })[] = [
    {
      code: "english",
      flag: britFlag,
      label: firstUpper(words["english"]),
      style: { whiteSpace: 'nowrap' },
      id: 'english',
      template: (itm, opt) => {
        return (<div
          onClick={e => opt.onClick(e)}
          className="hoverable" style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: 10,
            cursor: 'pointer'
          }}>
          <span>{itm.label}</span>
          <span>
            <img src={britFlag} style={{ width: 16, height: 12 }} />
          </span>
        </div>)
      },
      command() {
        toggleLang()
      }
    },
    {
      code: 'khmer',
      flag: camboFlag,
      label: firstUpper(words["khmer"]),
      style: { whiteSpace: 'nowrap' },
      id: 'khmer',
      template: (itm, opt) => {
        return (<div className="hoverable"
          onClick={(e) => opt.onClick(e)}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: 10,
            cursor: 'pointer'
          }}>
          <span>{itm.label}</span>
          <span>
            <img src={camboFlag} style={{ width: 16, height: 12 }} />
          </span>
        </div>)
      },
      command() {
        toggleLang()
      }
    }]
  function genMenuItems() {
    setMenuItems(() => [
      // {
      //   label: firstUpper(words[lang]),
      //   icon: `pi pi-language`,
      //   style: { whiteSpace: 'nowrap' },
      //   id: 'language-setting',
      //   command() { toggleLang() }
      // },
      // {
      //   label: firstUpper(words?.[`${theme}-theme`][lang]),
      //   icon: `pi pi-${theme === 'dark' ? 'moon' : 'sun'}`,
      //   style: { whiteSpace: 'nowrap' },
      //   id: 'theme-setting',
      //   command() { toggleTheme() }
      // },
      {
        label: firstUpper(words["setting"]),
        icon: 'pi pi-cog',
        style: { whiteSpace: 'nowrap' },
        id: 'setting',
        command() { sideBarTrigger('user-account', true) },
      }, {
        label: firstUpper(words["logout"]),
        icon: 'pi pi-sign-out',
        style: { whiteSpace: 'nowrap' },
        id: 'sign-out',
        command() { logout() }
      }])
  }
  // const menuItems = (): MenuItem[] => 
  const toggleIconClass = () => {
    return `e-round e-flat e-small btn-open-sidebar ${isOpen ? 'open' : 'close'}`
  }
  useEffect(() => {
    genMenuItems();
  }, [words])
  return <div className={`top-bar ${theme}`}>
    <div className="top-bar-left">
      {/* <Button
        onClick={toggle}
        size='small'
        className={`btn-open-sidebar ${isOpen ? 'open' : 'close'}`}
        icon="pi pi-caret-left"
        rounded
        text /> */}
      <ButtonComponent
        onClick={toggle}
        cssClass={toggleIconClass()}
        iconCss="ri-arrow-left-s-fill" />
      {/* <div className="logo-wrap" >
        <Button
          onClick={trigger}
          size="small"
          className="btn-drawer"
          text >
          <div className='hbg-menu-bar'></div>
          <div className='hbg-menu-bar'></div>
          <div className='hbg-menu-bar'></div>
        </Button>
        <BiztoolsLogo />
      </div> */}
      {visibility === 'show' || !replacement ?
        <span className="p-input-icon-left full-search">
          <i className="pi pi-search" />
          <InputText
            onBlur={() => search(value)}
            onKeyDown={e => {
              if (e.key.toLowerCase() === 'enter') {
                searchBox.current?.blur()
              }
            }}
            ref={searchBox}
            value={value}
            onChange={e => onChange(e.target.value)}
            type="text"
            className="p-inputtext-sm search-box" />
        </span> : <span>{replacement.toUpperCase()}</span>
      }
      <Button
        size='small'
        className="sm-search"
        icon="pi pi-search"
        severity='secondary' />
      <NotificationBell />
    </div>
    <div className="top-bar-right">
      {/* <NotificationBell /> */}
      <div className="profile-username">
        {user?.displayName?.toUpperCase() ?? user?.username.toUpperCase()}
      </div>
      <Menu
        model={langCodes}
        popup
        ref={langMenu}
      />
      <div onClick={(e) => {
        langMenu.current?.toggle(e)
      }}
        style={{
          background: 'transparent',
          outline: 'none',
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer'
        }}>
        <img src={lang == 'english' ? britFlag : camboFlag}
          style={{ width: 30, height: 20, borderRadius: 2, boxShadow: '1px 1px 3px rgba(0,0,0,0.3)', border: 'solid .5px #ddd' }} />
      </div>
      <Menu
        model={menuItems}
        popup
        ref={menu} />
      <Button
        onClick={openMenu}
        text
        className="btn-profile"
        rounded
        size="small"
        style={{
          padding: 0,
          maxWidth: '50px',
          maxHeight: '50px',
          border: 'none'
        }}>
        <Avatar
          className="user-profile"
          label={extractAvatarText(user?.username)}
          image={user?.profileImage ?? avatar}
          shape="circle"
          size="large" />
      </Button >
    </div>
  </div>
}
export default TopBar