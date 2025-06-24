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
import { useUser } from "../../../providers/user-provider";
import { linkColors } from "../../../constants";
import { useApi } from "../../../providers/api-provider";

const Register: FC<{ toLogin: () => void }> = ({ toLogin }) => {
  const [usernameError, setUsernameError] = useState(false)
  const [passwordError, setPasswordError] = useState(false)
  const [cPasswordError, setCPasswordError] = useState(false)
  const [username, setUsername] = useState<string>()
  const [password, setPassword] = useState<string>()
  const [cPassword, setCPassword] = useState<string>()
  const [submitting, setSubmitting] = useState(false)
  const [duplicate, setDuplicate] = useState(false)
  const { auth } = useApi()
  const { theme } = useTheme()
  const { lang, words } = useLang()
  const { modifyUser } = useUser()
  const { changeToken } = useToken()
  const { show } = useToast()
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
    },
    onError(e) {
      if (e.message?.toLowerCase() == 'failed to fetch') show({
        severity: 'error',
        style: { textAlign: 'left' },
        summary: firstUpper(words?.error[lang]),
        detail: firstUpper(words?.["cannot-connect"][lang]),
        life: 3000
      });
      setSubmitting(_ => false)
      remove('conical-is-register')
    }
  })
  const registerAsync = auth.useRegister({
    onSuccess(d) {
      modifyUser(d)
      loginAsync({
        username: username ?? "",
        password: password ?? ""
      })
    },
    onError(e) {
      setSubmitting(_ => false)
      remove('conical-is-register')
      if (e.status == 300) {
        setDuplicate(true)
        setUsernameError(true)
        return
      }
      if (e.message?.toLowerCase() == 'failed to fetch') show({
        severity: 'error',
        style: { textAlign: "left" },
        summary: firstUpper(words?.error[lang]),
        detail: firstUpper(words?.["cannot-connect"][lang]),
        life: 3000
      })
    }
  })
  const validate = () => {
    setUsernameError(_ => username ? false : true)
    setPasswordError(_ => password ? false : true)
    setCPasswordError(_ => cPassword !== password ? true : false)
    if (duplicate) setDuplicate(_ => false)
    return password && username && password === cPassword
  }
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return;
    setSubmitting(_ => true)
    registerAsync({
      username: username ?? "",
      password: password ?? "",
      emails: [],
      phones: [],
      groups: [],
      roles: [],
      types: [],
      addresses: [],
      permissions: []
    })
  }
  const goToLogin = () => {
    if (submitting) return;
    toLogin()
  }
  const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (usernameError) setUsernameError(_ => false)
    if (duplicate) setDuplicate(_ => false)
    setUsername(_ => e.target.value)
  }
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (passwordError) setPasswordError(_ => false)
    setPassword(_ => e.target.value)
  }
  const handleCPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (cPasswordError) setCPasswordError(_ => false)
    setCPassword(_ => e.target.value)
  }
  return (<div>
    <form
      onSubmit={handleSubmit}
      className="register-form">
      <div className="p-float-label">
        <InputText
          disabled={submitting}
          onChange={handleUsernameChange}
          id="username"
          className={`p-inputtext-md ${usernameError ? 'p-invalid' : ''}`}
          style={{ width: '100%' }} />
        <label
          htmlFor="username"
          style={{
            textTransform: 'capitalize'
          }}>
          {words?.username[lang]}
        </label>
      </div>
      <small
        className="p-error"
        id="username-help"
        style={{
          marginTop: '4px',
          marginBottom: '2rem',
          textAlign: 'left',
          fontStyle: 'italic',
          transition: '0.2s',
          maxHeight: usernameError ? '20px' : 0
        }}>
        {usernameError ?
          (duplicate ?
            words?.["username-exist"][lang]
            : words?.["invalid-username"][lang])
          : ''}
      </small>
      <div className="p-float-label" >
        <Password
          disabled={submitting}
          onChange={handlePasswordChange}
          id="password"
          className={passwordError ? 'p-invalid' : ''}
          feedback={false}
          toggleMask
          style={{ width: '100%' }} />
        <label
          htmlFor="password"
          style={{
            textTransform: 'capitalize'
          }}>
          {words?.password[lang]}
        </label>
      </div>
      <small
        className="p-error"
        id="password-help"
        style={{
          marginTop: '4px',
          marginBottom: '2rem',
          textAlign: 'left',
          fontStyle: 'italic',
          transition: '0.2s',
          maxHeight: passwordError ? '20px' : 0
        }}>
        {passwordError ? words?.["invalid-password"][lang] : ''}
      </small>
      <div className="p-float-label" >
        <Password
          disabled={submitting}
          onChange={handleCPasswordChange}
          id="c-password"
          className={cPasswordError ? 'p-invalid' : ''}
          feedback={false}
          toggleMask
          style={{
            width: '100%'
          }} />
        <label
          htmlFor="c-password"
          style={{
            textTransform: 'capitalize'
          }}>
          {words?.["confirm-password"][lang]}
        </label>
      </div>
      <small
        className="p-error"
        id="c-password-help"
        style={{
          marginTop: '4px',
          marginBottom: '2rem',
          textAlign: 'left',
          fontStyle: 'italic',
          transition: '0.2s',
          maxHeight: cPasswordError ? '20px' : 0
        }}>
        {cPasswordError ? words?.["password-not-match"][lang] : ''}
      </small>
      <Button
        type="submit"
        label={words?.register[lang]}
        loading={submitting}
        style={{
          textTransform: 'uppercase'
        }} />
    </form>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      marginTop: '20px',
      justifyContent: 'center'
    }}>
      <span>
        {firstUpper(words?.["had-account"][lang])}?
      </span>
      <a
        href="#"
        style={{
          cursor: submitting ? 'default' : 'pointer',
          color: submitting ? linkColors[theme].disabled : linkColors[theme].main,
          textTransform: 'capitalize'
        }}
        onClick={goToLogin}>
        {words?.login[lang]}
      </a>
    </div>
  </div>)
}
export default Register