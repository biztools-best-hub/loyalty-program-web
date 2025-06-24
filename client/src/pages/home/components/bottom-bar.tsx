import { FC } from "react";
import { useLang } from "../../../providers/lang-provider";
import { useLogout } from "../../../utils/hooks";
import { useSidebar } from "../../../providers/side-bar-provider";
type TBottomBarItem = {
  label?: string,
  active: boolean,
  icon?: string,
  onClick?: () => void
}
const BottomBar: FC = () => {
  const { words } = useLang()
  const { trigger, items } = useSidebar()
  const logout = useLogout()
  const menuItems = (): TBottomBarItem[] => [{
    label: words?.["home"]?.toUpperCase(),
    icon: 'pi pi-home',
    active: items.find(itm => itm.id === 'home')?.active ?? false,
    onClick: () => trigger('home', true)
  }, {
    label: words?.["logout"]?.toUpperCase(),
    icon: 'pi pi-sign-out',
    active: false,
    onClick: logout
  }]
  return <div className="bottom-bar" key={"bottom-bar"}>
    {menuItems().map((itm, i) => <div
      onClick={itm.onClick}
      className={`bottom-bar-item ${itm.active ? 'active' : ''}`}
      key={itm.label ?? i}>
      <i className={itm.icon} />
      <div className="bottom-bar-item-label">
        {itm.label}
      </div>
    </div>)}
  </div>
}
export default BottomBar