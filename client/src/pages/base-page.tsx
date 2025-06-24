import { FC, ReactNode, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSidebar } from "../providers/side-bar-provider";
import { useLang } from "../providers/lang-provider";
import { useToken } from "../providers/token-provider";
import '../assets/css/base-page.css'

const BasePage: FC<{
  children: ReactNode,
  hideTitle?: boolean,
  rightComponent?: ReactNode
}> = ({ children, hideTitle, rightComponent }) => {
  const route = useLocation()
  const { trigger, onTrigger, currentItem } = useSidebar()
  const { token } = useToken()
  const { words } = useLang()
  const navigate = useNavigate()
  useEffect(() => trigger(route.pathname.substring(1), false), [route])
  const doOnTrigger = (id: string) => navigate(`/${id === 'home' ? '' : id}`)
  useEffect(() => onTrigger(doOnTrigger), [])
  const title = () => words[currentItem?.id.split('-').join(' ') ?? 'home']
  if (!token) navigate('/', { replace: true })
  return <div className="base-page">
    {(!hideTitle || rightComponent) &&
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '10px 1rem'
      }}>
        {!hideTitle ?
          <div className="page-title">
            {title()}
          </div> : null}
        {rightComponent}
      </div>
    }
    <div className={`base-page-content ${hideTitle ? 'hide-title' : ''}`}>
      {children}
    </div>
  </div>
}
export default BasePage