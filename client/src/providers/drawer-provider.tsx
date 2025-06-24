import { FC, ReactNode, createContext, useContext, useState } from "react";

export type TDrawerContextProps = {
  open: boolean,
  toggle: () => void
}
export const DrawerContext = createContext<TDrawerContextProps>({ open: false, toggle: () => { } })

const DrawerProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false)
  const toggle = () => setOpen(_ => !open)
  return <DrawerContext.Provider
    value={{
      open,
      toggle
    }}>
    {children}
  </DrawerContext.Provider>
}
export default DrawerProvider
export const useDrawer = () => useContext(DrawerContext)