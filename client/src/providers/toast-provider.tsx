import { Toast, ToastMessage } from "primereact/toast"
import { FC, ReactNode, createContext, useContext, useState } from "react"

export type TToastContextProps = {
  data?: ToastMessage,
  toast: Toast | null,
  bindData: (d: ToastMessage) => void,
  bindToast: (t: Toast) => void,
  show: (d?: ToastMessage) => void
}

export const ToastContext = createContext<TToastContextProps>({
  toast: null,
  show: (_?: ToastMessage) => { },
  bindToast: (_: Toast) => { },
  bindData: (_: ToastMessage) => { }
})

const ToastProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<Toast | null>(null)
  const [message, setMessage] = useState<ToastMessage>()
  const bindToast = (t: Toast) => setToast(_ => t)
  const show = (data?: ToastMessage) => {
    if (data) return toast?.show({ ...data })
    if (!message) return;
    toast?.show({ ...message })
  }
  const bindData = (d: ToastMessage) => setMessage(d)
  return (
    <ToastContext.Provider
      value={{
        toast,
        bindToast,
        bindData,
        show
      }}>
      {children}
    </ToastContext.Provider>
  )
}
export default ToastProvider
export const useToast = () => useContext(ToastContext)