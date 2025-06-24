import { FC } from "react";
import { Sidebar } from 'primereact/sidebar'
import { useDrawer } from "../../../providers/drawer-provider";
import avatar from '../../../assets/images/avatar.png'
import { MenuItem } from "primereact/menuitem";
import { useLang } from "../../../providers/lang-provider";
import { extractAvatarText, firstUpper } from "../../../utils/text-util";
import { Menu } from "primereact/menu";
import { Avatar } from "primereact/avatar";
import { useUser } from "../../../providers/user-provider";
import { useLogout } from "../../../utils/hooks";
import { Button } from "primereact/button";
import { useSidebar } from "../../../providers/side-bar-provider";
import { initialItems } from "../../../constants";

const Drawer: FC = () => {
  const { open, toggle } = useDrawer()
  const { words } = useLang()
  const { trigger } = useSidebar()
  const { user } = useUser()
  const logout = useLogout()
  const menuItems = (): MenuItem[] => {
    const lst: MenuItem[] = []
    for (let i = 0; i < initialItems.length; i++) {
      const itm = initialItems[i]
      if (itm.id === 'home') continue;
      lst.push({
        label: firstUpper(words[itm.id]),
        items: itm.children?.map((c): MenuItem => ({
          label: firstUpper(words[c.id]),
          icon: c.icon,
          command() {
            trigger(c.id, true)
            toggle()
          }
        }))
      });
      if (i < initialItems.length - 1) lst.push({
        separator: true
      })
    }
    return lst
  }
  return <Sidebar
    className="drawer"
    visible={open}
    onHide={toggle}
    icons={null}
    showCloseIcon={false}>
    <div className="drawer-head">
      <Avatar
        className="user-profile"
        label={extractAvatarText(user?.username)}
        image={user?.profileImage ?? avatar}
        shape="circle"
        size="large" />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: 'column',
          justifyContent: 'center',
          textAlign: 'left',
          padding: '0 1.2rem'
        }}>
        <div
          style={{
            fontSize: '1.4rem'
          }}>
          {user?.username.toUpperCase()}
        </div>
        <Button
          className="btn-logout"
          onClick={logout}
          label={words["logout"]}
          outlined />
      </div>
    </div>
    <Menu model={menuItems()} />
  </Sidebar>
}
export default Drawer