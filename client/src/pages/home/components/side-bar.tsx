import { FC } from "react";
import { TMenuItem } from "../../../types";
import MenuItem from "./menu-item";
import { firstUpper } from "../../../utils/text-util";
import { useLang } from "../../../providers/lang-provider";
import { useSidebar } from "../../../providers/side-bar-provider";
import { useTheme } from "../../../providers/theme-provider";
import BiztoolsLogo from "./biztools-logo";
const SideBar: FC = () => {
  const { theme } = useTheme()
  const { items, trigger, isOpen, visible } = useSidebar()
  const { words } = useLang()
  const expand = (id: string) => trigger(id, true)
  const menuItems = () => items.map((itm): TMenuItem => ({
    ...itm,
    label: firstUpper(words[itm.id.split('-').join(' ')]) ?? itm.label,
    children: itm.children?.map((c): TMenuItem => ({
      ...c,
      label: firstUpper(words[c.id.split('-').join(' ')]) ?? c.label
      // label: c.id
    }))
  }))
  return <div className={`side-bar ${theme} ${isOpen ?
    'open' : 'close'} ${visible ?
      'show' : 'hide'}`}>
    <a
      href="#"
      target="_blank"
      className={`side-bar-header ${theme}}`}>
      <BiztoolsLogo />
    </a>
    <div className="side-bar-content">
      {menuItems().map(itm =>
        <MenuItem
          key={itm.id}
          item={itm}
          expand={expand} />)}
    </div>
  </div>
}
export default SideBar