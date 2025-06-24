import { FC, useState } from "react";
// import logo from '../../assets/images/logo.jpeg'
import Register from "./components/register";
import Login from "./components/login";
import '../../assets/css/login-register.css'
import { set } from "../../utils/local-storage-util";
import { useTheme } from "../../providers/theme-provider";
import { useApi } from "../../providers/api-provider";

const LoginRegister: FC = () => {
  const { theme } = useTheme()
  const [isRegister, setIsRegister] = useState(parseInt(localStorage.getItem('conical-is-register') ?? '0') === 1)
  const { companyName } = useApi()
  const toLogin = () => {
    setIsRegister(_ => false)
    set({
      key: 'conical-is-register',
      value: '0'
    })
  }
  const toRegister = () => {
    setIsRegister(_ => true)
    set({
      key: 'conical-is-register',
      value: '1'
    })
  }
  return (
    <div className={`login-register-container ${theme}`}>
      <div className="background-part">
        <div className={`background ${theme}`}>
          <div className={`in-background ${theme}`}></div>
        </div>
        <div className="foreground">
          <img className="bt-logo" src="/images/logo.png" />
          <div className={`bt-name ${theme}`}>
            {companyName}
            {/* BIZTOOLS Enterprise Solution Technologies Co., Ltd */}
          </div>
          <div className={`bt-power ${theme}`}>
            © 2023 - Conical Hat Software
          </div>
        </div>
      </div>
      <div className="form-part">
        <div className="wrap">
          <div className={`in-form ${isRegister ? 'is-register' : ''}`}>
            <div className="title">
              loyalty program
            </div>
            {isRegister ?
              <Register toLogin={toLogin} />
              : <Login toRegister={toRegister} />}
          </div>
        </div>
      </div>
      {/* <Settings /> */}
    </div>
  )
}
export default LoginRegister