import { Badge } from "primereact/badge";
import { Menu } from "primereact/menu";
import { MenuItem } from "primereact/menuitem";
import { FC, SyntheticEvent, useRef } from "react";
import { useTheme } from "../../../providers/theme-provider";
import { useLang } from "../../../providers/lang-provider";
import { firstUpper } from "../../../utils/text-util";
type TNotificationProps = {
  id: string,
  msg: string,
  read: boolean
}
const messages: TNotificationProps[] = []
//  [1, 2, 3].map(m => ({
//   id: m.toString(),
//   msg: `Test notification ${m}`,
//   read: m > 1
// }))
const NotificationBell: FC = () => {
  const { words } = useLang()
  const { theme } = useTheme()
  const notifications = useRef<Menu>(null)
  const showNotification = (e: SyntheticEvent<Element, Event>) => notifications.current?.toggle(e)
  const notificationList = (): MenuItem[] => messages.map(m => ({
    label: m.msg,
    id: m.id,
    template: (itm, opt) => {
      return <div
        onClick={opt.onClick}
        className={opt.className}
        style={{
          whiteSpace: 'nowrap',
          display: 'flex',
          gap: '10px',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
        <span style={{
          color: theme === 'dark' ?
            (m.read ? '#aaa' : '#fff')
            : (m.read ? '#999' : '#121212')
        }}>
          {itm.label}
        </span>
        {!m.read &&
          <span style={{
            fontSize: '0.85rem',
            fontStyle: 'italic',
            color: theme === 'light' ? '#F59E0B' : '#FCD34D'
          }}>
            {firstUpper(words["new"])}
          </span>}
      </div>
    }
  }))
  return <div>
    <Menu
      model={notificationList()}
      popup
      ref={notifications}
      style={{ width: 'fit-content' }} />
    <div
      onClick={showNotification}
      className="bell-btn">
      <i
        className="pi pi-bell p-overlay-badge"
        style={{
          fontSize: '1.25rem'
        }}>
        {messages.filter(m => !m.read).length > 0 &&
          <Badge
            value={messages.filter(m => !m.read).length}
            severity='danger'
            size='normal' />}
      </i>
    </div>
  </div>
}
export default NotificationBell