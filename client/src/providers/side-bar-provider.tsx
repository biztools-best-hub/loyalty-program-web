import { FC, ReactNode, createContext, useContext, useState } from "react";
import { get, set } from "../utils/local-storage-util";
import { TMenuItem } from "../types";
import { initialItems } from "../constants";
import { useUser } from "./user-provider";

export type TSideBarContextProps = {
  items: TMenuItem[],
  isOpen: boolean,
  visible: boolean,
  currentItem?: TMenuItem,
  trigger: (id: string, notRoute: boolean) => void,
  onTrigger: any,
  close: () => void,
  open: () => void,
  toggle: () => void,
  toggleVisibility: () => void,
}

export const SideBarContext = createContext<TSideBarContextProps>({
  open: () => { },
  close: () => { },
  items: initialItems.filter(v => v.id != 'access-right'),
  isOpen: get('conical-sidebar-open') === 'open',
  visible: true,
  toggle: () => { },
  toggleVisibility: () => { },
  trigger: (_, __) => { },
  onTrigger: undefined
})

const SideBarProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(!get('conical-sidebar-open') || get('conical-sidebar-open') === 'open')
  const [visible, setVisible] = useState(true)
  const { userRole } = useUser()
  const [items, setItems] = useState(userRole &&
    userRole.toLocaleLowerCase() == 'admin' ?
    initialItems : initialItems.filter(v =>
      v.id != 'access-right').map(v => {
        if (!v.children || v.children.length < 1 || v.children.every(c =>
          c.id != 'access-right')) return v
        v.children = v.children.filter(c => c.id != 'access-right')
        return v;
      }))
  const [whenTrigger, setWhenTrigger] = useState<any>()
  const [currentItem, setCurrentItem] = useState<TMenuItem>()
  const toggle = () => {
    setIsOpen(_ => !isOpen)
    set({
      key: 'conical-sidebar-open',
      value: isOpen ? 'close' : 'open'
    })
  }
  const toggleVisibility = () => setVisible(_ => !visible)
  const onTrigger = (fn: any) => setWhenTrigger((_: any) => fn)
  const open = () => {
    setIsOpen(_ => true)
    set({
      key: 'conical-sidebar-open',
      value: 'open'
    })
  }
  const close = () => {
    setIsOpen(_ => false)
    set({
      key: 'conical-sidebar-open',
      value: 'close'
    })
  }
  const trigger = (id: string, notRoute: boolean) => {
    let target = items.find(v => v.id === id)
    if (!target) target = items.find(v => v.children?.some(c => c.id === id));
    if (!target) return
    if (target.id !== id) target = target.children?.find(v => v.id == id)
    if (!target) return;
    setCurrentItem(_ => target)
    let toTrigger: string | undefined = 'home'
    if (target.children && target.children.length > 0) {
      if (target.children.some(c => c.active))
        toTrigger = target.children.find(c => c.active)?.id
      else toTrigger = target.children[0].id
    } else toTrigger = target.id
    if (notRoute && whenTrigger) whenTrigger(toTrigger)
    if ((!target.children || target.children.length < 1) && !target.isChild)
      return setItems(p => p.map(v => v.id === id ? ({
        ...v,
        active: true
      }) : ({
        ...v,
        expanded: false,
        children: v.children?.map(c => ({
          ...c,
          active: false
        }))
      })))
    if (target.isChild) return setItems(p => p.map((v): TMenuItem => {
      if (!v.children || v.children.length < 1 || v.children.every(e => e.id !== id))
        return {
          ...v,
          active: false,
          expanded: false,
          children: v.children?.map(e => ({
            ...e,
            expanded: false,
            active: false
          }))
        };
      return {
        ...v,
        expanded: true,
        children: v.children.map((e): TMenuItem => ({
          ...e,
          active: e.id === id
        }))
      }
    }))
    setItems(p => p.map(v => {
      if (v.id !== id) return {
        ...v,
        expanded: false,
        active: false,
        children: v.children?.map(c => ({
          ...c,
          active: false,
          expanded: false
        }))
      }
      const expanded = !v.expanded
      return {
        ...v,
        expanded,
        children: expanded && v.children?.every(c => !c.active) ?
          v.children.map((c, i) => ({
            ...c,
            active: i === 0
          })) : v.children
      }
    }))
  }
  return <SideBarContext.Provider
    value={{
      items,
      isOpen,
      visible,
      open,
      close,
      toggle,
      toggleVisibility,
      trigger,
      onTrigger,
      currentItem
    }}>
    {children}
  </SideBarContext.Provider>
}
export default SideBarProvider
export const useSidebar = () => useContext(SideBarContext)