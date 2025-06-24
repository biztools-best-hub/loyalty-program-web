import { ChangeEvent, FC, useEffect, useRef, useState } from "react";
import BasePage from "../../base-page";
import { useSearchBox } from "../../../providers/search-box-provider";
import { Avatar } from "primereact/avatar";
import avatarPlaceholder from '../../../assets/images/avatar.png'
import { useUser } from "../../../providers/user-provider";
import { Card } from 'primereact/card'
import { Divider } from 'primereact/divider'
import { Tag } from 'primereact/tag'
import '../../../assets/css/user-account.css'
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { DropdownChangeEvent } from "primereact/dropdown";
import SimpleReactValidator from "simple-react-validator";
import { Dialog } from "primereact/dialog";
import { useApi } from "../../../providers/api-provider";
import { useToast } from "../../../providers/toast-provider";
import { Password } from "primereact/password";
import { TUserRequest } from "../../../types/models";
import { v4 } from 'uuid';
import { capitalize, firstUpper } from "../../../utils/text-util";
import { useLang } from "../../../providers/lang-provider";

const UserAccount: FC = () => {
  const { hide, show, replace } = useSearchBox()
  const [changeablePassword, __] = useState(false)
  const { show: notify } = useToast()
  const { auth, user: userApi, uploader, apiUrl } = useApi()
  const { words } = useLang()
  const validator = new SimpleReactValidator()
  const { user, modifyUser } = useUser()
  const [deleteDisabled, _] = useState(true)
  const [displayName, setDisplayName] = useState<string | undefined>(user?.displayName)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [img, setImg] = useState(user?.profileImage ?? avatarPlaceholder)
  const [tempImg, setTempImg] = useState(img)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  const [oldPasswordError, setOldPasswordError] = useState(false)
  const [confirmPasswordError, setConfirmPasswordError] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [gender, setGender] = useState<string | undefined>(user?.gender)
  const [tempGender, setTempGender] = useState<string | undefined>(gender)
  const [lastname, setLastname] = useState<string | undefined>(user?.lastname)
  const [firstname, setFirstname] = useState<string | undefined>(user?.firstname)
  const [khLastname, setKhLastname] = useState<string | undefined>(user?.khLastname)
  const [khFirstname, setKhFirstname] = useState<string | undefined>(user?.khFirstname)
  const [email, setEmail] = useState<string | undefined>(user?.currentEmail)
  const [phone, setPhone] = useState<string | undefined>(user?.currentPhone)
  const [address, setAddress] = useState<string | undefined>(user?.currentAddress?.en)
  const [open, setOpen] = useState(false)
  const [errorMail, setErrorMail] = useState(false)
  const [errorPhone, setErrorPhone] = useState(false)
  const [errorLastname, setErrorLastname] = useState(false)
  const [errorFirstname, setErrorFirstname] = useState(false)
  const [errorKhLastname, setErrorKhLastname] = useState(false)
  const [errorKhFirstname, setErrorKhFirstname] = useState(false)
  const displayNameRef = useRef<HTMLInputElement>(null)
  const lastnameRef = useRef<HTMLInputElement>(null)
  const firstnameRef = useRef<HTMLInputElement>(null)
  const khLastnameRef = useRef<HTMLInputElement>(null)
  const khFirstnameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
  const addressRef = useRef<HTMLInputElement>(null)
  const imgRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File>()
  const [edit, setEdit] = useState(false)
  const updateUser = userApi.useUpdateUser({
    onSuccess(res) {
      setUpdating(false)
      modifyUser(res)
      closeEdit()
      notify({
        summary: firstUpper(words['success']),
        style: {
          textAlign: 'left'
        },
        detail: firstUpper(words['profile updated']),
        severity: 'success',
        life: 5000
      })
    },
    onError(e: any) {
      setUpdating(false)
      notify({
        summary: firstUpper(words['error']),
        style: {
          textAlign: 'left'
        },
        detail: e.message ?? e.statusText,
        severity: 'error',
        life: 5000
      })
    },
  })
  const changePassword = auth.useChangePassword({
    onSuccess() {
      setChangingPassword(false)
      closeDialog()
      notify({
        summary: firstUpper(words['success']),
        style: { textAlign: 'left' },
        detail: firstUpper(words["password is changed"]),
        severity: 'success',
        life: 5000
      })
    },
    onError() {
      setChangingPassword(false)
      setOldPasswordError(true)
    }
  })
  const openEdit = () => setEdit(true)
  const openDialog = () => {
    if (!changeablePassword) return;
    setOpen(true)
  }
  const closeDialog = () => setOpen(false)
  const closeEdit = () => setEdit(false)
  const cancelEdit = () => {
    setErrorFirstname(false)
    setErrorLastname(false)
    setErrorKhLastname(false)
    setErrorKhFirstname(false)
    setErrorPhone(false)
    setErrorMail(false)
    closeEdit()
  }
  const saveUpdate = () => {
    let validMail: boolean = true
    let validPhone: boolean = true
    let validFirstname: boolean = true
    let validLastname: boolean = true
    let validKhFirstname: boolean = true
    let validKhLastname: boolean = true
    if (emailRef.current?.value &&
      emailRef.current.value.trim().length > 0) {
      validMail = validator.check(emailRef.current?.value, 'email')
      setErrorMail(_ => !validMail)
    }
    else setErrorMail(false)
    if (phoneRef.current?.value &&
      phoneRef.current.value.trim().length > 0) {
      validPhone = validator.check('855' + phoneRef.current.value, 'phone')
      setErrorPhone(_ => !validPhone)
    }
    else setErrorPhone(false)
    if (lastnameRef.current?.value &&
      lastnameRef.current.value.trim().length > 0) {
      validLastname = validator.check(lastnameRef.current.value, 'alpha')
      setErrorLastname(_ => !validLastname)
    } else setErrorLastname(false)
    if (firstnameRef.current?.value &&
      firstnameRef.current.value.trim().length > 0) {
      validFirstname = validator.check(firstnameRef.current.value, 'alpha')
      setErrorFirstname(_ => !validFirstname)
    } else setErrorFirstname(false)
    // if (khLastnameRef.current?.value &&
    //   khLastnameRef.current.value.trim().length > 0) {
    //   validKhLastname = validator.check(khLastnameRef.current.value, 'alpha')
    //   setErrorKhLastname(_ => !validKhLastname)
    // } else setErrorKhLastname(false)
    // if (khFirstnameRef.current?.value &&
    //   khFirstnameRef.current.value.trim().length > 0) {
    //   validKhFirstname = validator.check(khFirstnameRef.current.value, 'alpha')
    //   setErrorKhFirstname(_ => !validKhFirstname)
    // } else setErrorKhFirstname(false)
    if (!validMail ||
      !validPhone ||
      !validFirstname ||
      !validLastname ||
      !validKhFirstname ||
      !validKhLastname) return;
    setDisplayName(_ => displayNameRef.current?.value)
    setGender(_ => tempGender)
    setLastname(_ => lastnameRef.current?.value)
    setFirstname(_ => firstnameRef.current?.value)
    setKhLastname(_ => khLastnameRef.current?.value)
    setKhFirstname(_ => khFirstnameRef.current?.value)
    setEmail(_ => emailRef.current?.value)
    setPhone(_ => phoneRef.current?.value)
    setAddress(_ => addressRef.current?.value)
    setUpdating(true)
  }
  const form = useRef<HTMLFormElement>(null)
  const onOldPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setOldPassword(_ => e.target.value)
    if (!oldPasswordError) return;
    setOldPasswordError(false)
  }
  const onConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(_ => e.target.value)
    if (!confirmPasswordError) return;
    setConfirmPasswordError(false)
  }
  const onNewPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewPassword(_ => e.target.value)
  }
  const onChangePasswordClick = () => {
    if (!changeablePassword) return;
    if (!newPassword || confirmPassword !== newPassword) {
      setConfirmPasswordError(true)
      return;
    };
    if (!oldPassword || !newPassword) return;
    setChangingPassword(true)
  }
  const onGenderChange = (e: DropdownChangeEvent) => setTempGender(e.value)
  const selectImg = () => {
    if (!imgRef.current) return;
    imgRef.current.click();
  }
  const onSelectImg = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return;
    convertFile(file)
  }
  const convertFile = async (f: File) => {
    if (f.size < 1) return;
    setFile(f)
  }
  const upload = uploader.useUpload({
    onSuccess: r => {
      if (r.localUrl) {
        setImg(tempImg)
        const input: TUserRequest = {
          oid: user?.oid,
          username: user?.username,
          displayName,
          gender,
          lastname,
          firstname,
          khLastname,
          khFirstname,
          profileImage: `${apiUrl}/${r.localUrl}`,
          currentEmail: email,
          currentPhone: phone,
          currentAddress: {
            en: address
          },
          emails: [],
          phones: [],
          addresses: [],
          groups: [],
          permissions: [],
          types: [],
          roles: []
        }
        updateUser(input)
      }
    },
    onError: e => {
      console.log(e)
    }
  })
  useEffect(() => {
    if (!updating) return;
    const input: TUserRequest = {
      oid: user?.oid,
      username: user?.username,
      displayName,
      gender,
      lastname,
      firstname,
      khLastname,
      khFirstname,
      currentEmail: email,
      currentPhone: phone,
      currentAddress: {
        en: address
      },
      emails: [],
      phones: [],
      addresses: [],
      groups: [],
      permissions: [],
      types: [],
      roles: []
    }
    if (tempImg !== img) {
      if (!file) return;
      const uid = v4()
      const nameSplit = file?.name.split('.')
      const ext = nameSplit?.[nameSplit.length - 1] ?? ''
      upload({
        data: file,
        extension: ext,
        id: uid,
        username: user?.username ?? ''
      })
      return;
    }
    updateUser(input)
  }, [updating])
  useEffect(() => {
    if (!edit) return;
    displayNameRef.current?.focus()
  }, [edit])
  const clear = () => {
    replace('')
    show()
  }
  useEffect(() => {
    hide()
    replace(words['user account'])
    return clear
  }, [])
  // useEffect(() => {
  //   if (!newPassword ||
  //     confirmPassword === newPassword) return;
  //   setConfirmPasswordError(true)
  // }, [confirmPassword])
  useEffect(() => {
    // console.log({
    //   oldPassword,
    //   confirmPasswordError,
    //   changePassword
    // })
    if (!changingPassword || !changeablePassword) return;
    changePassword({
      oldPassword,
      newPassword
    })
  }, [changingPassword])
  useEffect(() => {
    if (!file) return;
    setTempImg(URL.createObjectURL(file))
    setImg(URL.createObjectURL(file))
  }, [file])
  return <BasePage hideTitle>
    <form
      ref={form}
      encType="multipart/form-data"
      className="user-account-page" >
      <Card className="profile-card">
        <div className="section">
          <div className="head">
            <div className="avatar-wrap">
              <input
                type="file"
                id="profile-image"
                name="profile-image"
                onChange={onSelectImg}
                accept="image/*"
                ref={imgRef}
                hidden />
              <Avatar
                className="avatar-img"
                style={{ background: 'transparent' }}
                shape="circle"
                image={edit ? tempImg : img} />
              <Button
                size="small"
                type="button"
                icon="pi pi-camera"
                text
                rounded
                onClick={selectImg}
                className={`btn-upload-img ${edit ? '' : 'hide'}`} />
            </div>
            <span className="profile-username">
              {user?.username}
            </span>
          </div>
          <Divider />
          <div className="body">
            <div className="label-part">
              <label>
                {firstUpper(words['code'])}
              </label>
              <label>
                {firstUpper(words['type'])}
              </label>
              <label>
                {firstUpper(words['role'])}
              </label>
              <label>
                {firstUpper(words['groups'])}
              </label>
            </div>
            <div className="val-part">
              <span id="user-code">
                : {user?.code ?? '---'}
              </span>
              <span id="user-type">
                : {words[user?.currentType ?? '---'] ?? '---'}
              </span>
              <span id="user-role">
                : {user?.currentRole ?? '---'}
              </span>
              <span id="user-groups">
                : {user?.groups &&
                  user.groups.length > 0 ?
                  user.groups.map(g =>
                    <Tag
                      key={g}
                      value={g}
                      className="group-tag" />)
                  : '---'}
              </span>
            </div>
          </div>
          <div className="foot">
            <Button
              outlined
              label={firstUpper(words['change password'])}
              className={changeablePassword ? '' : 'change-pw-btn disabled'}
              disabled={!changeablePassword}
              type="button"
              onClick={openDialog}
              severity="warning"
              icon='pi pi-key' />
            <Button
              outlined
              type="button"
              className={`btn-delete-account ${deleteDisabled ?
                'disabled' : ''}`}
              label={firstUpper(words["delete account"])}
              severity={deleteDisabled ?
                'secondary' : 'danger'}
              icon='pi pi-trash'
              disabled={deleteDisabled} />
          </div>
        </div>
      </Card>
      <Card className="profile-detail-card">
        <div className="section">
          <div className="section-items">
            <div className="row">
              <div className="item">
                <label >
                  {capitalize(words["display name"])}
                </label>
                {edit ?
                  <InputText
                    ref={displayNameRef}
                    id="display-name"
                    name="display-name"
                    disabled={updating}
                    defaultValue={displayName ?? ''} /> :
                  <span id="user-display-name">
                    {displayName &&
                      displayName.trim().length > 0 ?
                      displayName : '---'}
                  </span>}
              </div>
              {/* <div className="item">
                <label htmlFor="user-gender">
                  Gender
                </label>
                {edit ?
                  <Dropdown
                    value={tempGender}
                    onChange={onGenderChange}
                    id="gender"
                    name="gender"
                    disabled={updating}
                    options={['None', 'Male', 'Female']} /> :
                  <span id="user-gender">
                    {gender ?? '---'}
                  </span>}
              </div> */}
            </div>
            <Divider type="dashed" />
            <div className="row">
              <div className="item">
                <label >
                  {firstUpper(words["lastname (ENG)"])}
                </label>
                {edit ?
                  <div>
                    <InputText
                      className="change-pw-input-box"
                      id="lastname"
                      name="lastname"
                      defaultValue={lastname ?? ''}
                      disabled={updating}
                      ref={lastnameRef} />
                    {errorLastname &&
                      <small
                        className="error-help"
                        id="lastname-help">
                        {firstUpper(words['invalid name'])}!
                      </small>}
                  </div> :
                  <span id="user-lastname-en">
                    {lastname &&
                      lastname.trim().length > 0 ?
                      lastname : '---'}
                  </span>
                }
              </div>
              <div className="item">
                <label >
                  {firstUpper(words["firstname (ENG)"])}
                </label>
                {edit ?
                  <div>
                    <InputText
                      className="change-pw-input-box"
                      id="firstname"
                      name="firstname"
                      disabled={updating}
                      defaultValue={firstname ?? ''}
                      ref={firstnameRef} />
                    {errorFirstname &&
                      <small
                        className="error-help"
                        id="firstname-help">
                        {firstUpper(words['invalid name'])}!
                      </small>}
                  </div> :
                  <span id="user-firstname-en">
                    {firstname &&
                      firstname.trim().length > 0 ?
                      firstname : '---'}
                  </span>
                }
              </div>
            </div>
            <Divider type="dashed" />
            <div className="row">
              <div className="item">
                <label >
                  {firstUpper(words["lastname (KH)"])}
                </label>
                {edit ?
                  <div>
                    <InputText
                      className="change-pw-input-box"
                      id="kh-lastname"
                      name="kh-lastname"
                      defaultValue={khLastname ?? ''}
                      disabled={updating}
                      ref={khLastnameRef} />
                    {errorKhLastname &&
                      <small
                        className="error-help"
                        id="kh-lastname-help">
                        {firstUpper(words['invalid name'])}!
                      </small>}
                  </div> :
                  <span id="user-lastname-kh">
                    {khLastname &&
                      khLastname.trim().length > 0 ?
                      khLastname : '---'}
                  </span>
                }
              </div>
              <div className="item">
                <label >
                  {firstUpper(words["firstname (KH)"])}
                </label>
                {edit ?
                  <div>
                    <InputText
                      className="change-pw-input-box"
                      id="kh-firstname"
                      name="kh-firstname"
                      disabled={updating}
                      defaultValue={khFirstname ?? ''}
                      ref={khFirstnameRef} />
                    {errorKhFirstname &&
                      <small
                        className="error-help"
                        id="kh-firstname-help">
                        {firstUpper(words['invalid name'])}!
                      </small>}
                  </div> :
                  <span id="user-firstname-kh">
                    {khFirstname &&
                      khFirstname.trim().length > 0 ?
                      khFirstname : '---'}
                  </span>
                }
              </div>
            </div>
            <Divider type="dashed" />
            <div className="row">
              <div className="item">
                <label>
                  {firstUpper(words['email'])}
                </label>
                {edit ?
                  <div>
                    <InputText
                      className="change-pw-input-box"
                      id="email"
                      name="email"
                      disabled={updating}
                      defaultValue={email ?? ''}
                      ref={emailRef} />
                    {errorMail &&
                      <small
                        className="error-help"
                        id="email-help">
                        {firstUpper(words['invalid email'])}!
                      </small>}
                  </div> :
                  <span id="user-email">
                    {email &&
                      email.trim().length > 0 ?
                      email : '---'}
                  </span>
                }
              </div>
              {/* <div className="item">
                <label htmlFor="user-phone">
                  Phone
                </label>
                {edit ?
                  <div>
                    <InputText
                      className="change-pw-input-box"
                      id="phone"
                      name="phone"
                      disabled={updating}
                      defaultValue={phone ?? ''}
                      ref={phoneRef} />
                    {errorPhone &&
                      <small
                        className="error-help"
                        id="phone-help">
                        Invalid phone!
                      </small>}
                  </div> :
                  <span id="user-phone">
                    {phone &&
                      phone.trim().length > 0 ?
                      phone : '---'}
                  </span>
                }
              </div> */}
            </div>
            <Divider type="dashed" />
            <div className="row">
              <div className="item">
                <label >
                  {firstUpper(words['address'])}
                </label>
                {edit ?
                  <InputText
                    defaultValue={address ?? ''}
                    id="address"
                    name="address"
                    disabled={updating}
                    ref={addressRef} /> :
                  <span id="user-address">
                    {address &&
                      address.trim().length > 0 ?
                      address : '---'}
                  </span>
                }
              </div>
            </div>
          </div>
          <div className="profile-control">
            {edit ?
              <div className="editing">
                <Button
                  size="small"
                  type="button"
                  disabled={updating}
                  outlined
                  onClick={cancelEdit}
                  label={firstUpper(words["cancel"])}
                  severity="secondary"
                  icon='pi pi-times' />
                <Button
                  loading={updating}
                  size="small"
                  type="submit"
                  outlined
                  onClick={saveUpdate}
                  label={firstUpper(words["save"])}
                  severity="success"
                  icon='pi pi-save' />
              </div> :
              <Button
                type="button"
                icon='pi pi-pencil'
                onClick={openEdit}
                size="small"
                severity="info"
                outlined
                label={firstUpper(words["edit"])} />}
          </div>
        </div>
      </Card>
    </form>
    <Dialog
      className="change-pw-dialog-container"
      closeIcon={<i className="ri-close-line"></i>}
      header={
        <div className="header">
          <span className="pi pi-key"></span>
          <span>{capitalize(words['change password'])}</span>
        </div>}
      draggable={false}
      resizable={false}
      visible={open}
      onHide={closeDialog}>
      <div className="change-pw-dialog">
        <div className="row">
          <label>
            {capitalize(words['old password'])}
          </label>
          <Password
            feedback={false}
            toggleMask
            onChange={onOldPasswordChange}
            defaultValue={oldPassword}
            id="old-pw" />
          {oldPasswordError &&
            <small className="error-help">
              {firstUpper(words["incorrect password"])}!
            </small>}
        </div>
        <div className="row">
          <label >
            {capitalize(words["new password"])}
          </label>
          <Password
            feedback={false}
            onChange={onNewPasswordChange}
            defaultValue={newPassword}
            toggleMask
            id="new-pw" />
        </div>
        <div className="row">
          <label >
            {capitalize(words["confirm password"])}
          </label>
          <Password
            toggleMask
            feedback={false}
            defaultValue={confirmPassword}
            onChange={onConfirmPasswordChange}
            id="confirm-new-pw" />
          {confirmPasswordError &&
            <small className="error-help">
              {firstUpper(words["password does not matched"])}!
            </small>}
        </div>
        <Button
          className="btn-change-pw-ok"
          loading={changingPassword}
          onClick={onChangePasswordClick}
          label={words['ok'].toUpperCase()}
          severity="info" />
      </div>
    </Dialog>
  </BasePage>
}
export default UserAccount