import { FC, ChangeEvent, FormEvent, useState } from "react";
import { Button } from "primereact/button";
import { InputText } from 'primereact/inputtext'
import { Password } from 'primereact/password'
import { firstUpper } from "../../../utils/text-util";
import { setCookie } from "../../../utils/cookie-util";
import { remove, set } from "../../../utils/local-storage-util";
import { useToken } from "../../../providers/token-provider";
import { useLang } from "../../../providers/lang-provider";
import { useTheme } from "../../../providers/theme-provider";
import { useToast } from "../../../providers/toast-provider";
import { linkColors } from "../../../constants";
import { useApi } from "../../../providers/api-provider";

const Login: FC<{ toRegister: () => void }> = ({ toRegister }) => {
  const [usernameError, setUsernameError] = useState(false)
  const [passwordError, setPasswordError] = useState(false)
  const [canRegister, __] = useState(false)
  const [username, setUsername] = useState<string>()
  const [password, setPassword] = useState<string>()
  const [submitting, setSubmitting] = useState(false)
  const { auth } = useApi()
  const { theme } = useTheme()
  const { show } = useToast()
  const { lang, words } = useLang()
  const { changeToken } = useToken()
  const loginAsync = auth.useLogin({
    onSuccess(d) {
      changeToken(d.token)
      setCookie({
        key: 'conical-refresh-token',
        value: d.refreshToken,
        duration: {
          value: 2,
          by: 'week'
        }
      })
      if (d.uid) setCookie({
        key: 'conical-uid',
        value: d.uid,
        duration: {
          value: 1,
          by: 'minute'
        }
      })
      set({
        key: 'conical-device-id',
        value: d.deviceId
      })
      setSubmitting(_ => false)
      remove('conical-is-register')
      window.location.href = "/"
    },
    onError(e) {
      if (e.message?.toLowerCase() == 'failed to fetch')
        show({
          severity: 'error',
          style: {
            textAlign: 'left'
          },
          summary: firstUpper(words['error']),
          detail: firstUpper(words["cannot connect to server, probably you have no internet connection or server down"]),
          life: 3000
        });
      else if (e.status == 404) {
        setUsernameError(true)
        setPasswordError(true)
      }
      remove('conical-is-register')
      setSubmitting(_ => false)
    }
  })
  const validate = () => {
    setUsernameError(_ => username ? false : true)
    setPasswordError(_ => password ? false : true)
    return password && username
  }
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(_ => true)
    loginAsync({
      username: username ?? "",
      password: password ?? ""
    })
  }
  const goToRegister = () => {
    if (submitting || !canRegister) return
    toRegister()
  }
  const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (usernameError) setUsernameError(_ => false)
    setUsername(_ => e.target.value)
  }
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (passwordError) setPasswordError(_ => false)
    setPassword(_ => e.target.value)
  }
  return (<div>
    <form
      className="login-form"
      onSubmit={handleSubmit}>
      <div className="p-float-label">
        <InputText
          disabled={submitting}
          onChange={handleUsernameChange}
          id="username"
          className={`p-inputtext-md ${usernameError ? 'p-invalid' : ''}`}
          style={{
            width: '100%'
          }} />
        <label
          htmlFor="username"
          style={{
            textTransform: 'capitalize'
          }}>
          {words['username']}
        </label>
      </div>
      <small
        className={`p-error username-error ${usernameError ? 'error' : ''}`}
        id="username-help">
        {usernameError ? words["invalid username"] : ''}
      </small>
      <div className="p-float-label" >
        <Password
          disabled={submitting}
          onChange={handlePasswordChange}
          id="password"
          feedback={false}
          toggleMask
          style={{
            width: '100%'
          }} />
        <label
          htmlFor="password"
          style={{
            textTransform: 'capitalize'
          }}>
          {words["password"]}
        </label>
      </div>
      <small
        className={`p-error password-error ${passwordError ? 'error' : ''}`}
        id="password-help">
        {passwordError ? words["invalid password"] : ''}
      </small>
      <Button
        type="submit"
        label={words["login"]}
        loading={submitting}
        style={{
          textTransform: 'uppercase'
        }} />
    </form>
    {canRegister &&
      <div className="no-account-wrap">
        <span>
          {firstUpper(words["no account yet"])}?
        </span>
        <a
          href="#"
          style={{
            cursor: submitting ? 'default' : 'pointer',
            color: submitting ? linkColors[theme].disabled : linkColors[theme].main,
            textTransform: 'capitalize'
          }}
          onClick={goToRegister}>
          {words["register"]}
        </a>
      </div>
    }
  </div>)
}
export default Login