import { FC, useEffect, useState } from "react";
import BasePage from "../../base-page";
import '../../../assets/css/access-right.css'
import { Dropdown } from "primereact/dropdown";
import {
  PermissionResult,
  PermissionsOfUserResult,
  TWebUser,
  UsersOfPermissionResult
} from "../../../types/models/permissions";
import { useApi } from "../../../providers/api-provider";
import { useToast } from "../../../providers/toast-provider";
import { Skeleton } from "primereact/skeleton";
import { Menu } from "primereact/menu";
import { MenuItem } from "primereact/menuitem";
import { useSearchBox } from "../../../providers/search-box-provider";
import { InputText } from "primereact/inputtext";
import profilePlaceholder from '../../../assets/images/avatar.png'
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { delay } from "../../../utils/general-util";
import { useLang } from "../../../providers/lang-provider";
import { capitalize, firstUpper } from "../../../utils/text-util";

type TMode = {
  value: 'Permissions' | 'Users',
  code: 'p' | 'u',
  label: string
}
const AccessRight: FC = () => {
  const [mode, setMode] = useState<'Users' | 'Permissions'>('Permissions')
  const { show } = useToast()
  const { hide, replace, show: showSearchbox } = useSearchBox()
  const [allPermissions, setAllPermissions] = useState<PermissionResult[]>()
  const [webUsers, setWebUsers] = useState<TWebUser[]>()
  const [filterUsers, setFilterUsers] = useState<TWebUser[] | undefined>(webUsers ? [...webUsers] : undefined)
  const [filterPermissions, setFilterPermissions] = useState<PermissionResult[] | undefined>(allPermissions ?
    [...allPermissions] : undefined)
  const [permissionsOfUser, setPermissionOfUser] = useState<PermissionsOfUserResult>()
  const [usersOfPermission, setUsersOfPermission] = useState<UsersOfPermissionResult>()
  const [selectedPermission, setSelectedPermission] = useState<string>()
  const [updatingPermissions, setUpdatingPermissions] = useState<string[]>([])
  const [updatingUsers, setUpdatingUsers] = useState<string[]>([])
  const [selectedUser, setSelectedUser] = useState<string>()
  const { words } = useLang()
  const [fetching, setFetching] = useState(false)
  const [allowStatus, setAllowStatus] = useState<'all' | 'none' | 'some'>('some')
  const [accessFilter, setAccessFilter] = useState<'All' | 'Have Access' | 'No Access'>('All')
  const [search, setSearch] = useState<string>()
  const { permission } = useApi()
  const modifyFilterPermissions = () => {
    if (!allPermissions) return
    let temp = [...allPermissions]
    if (permissionsOfUser) {
      if (accessFilter == 'Have Access') {
        temp = temp.filter(t => permissionsOfUser.permissons.some(p => p.oid == t.oid))
      }
      else if (accessFilter == 'No Access') {
        temp = temp.filter(t => permissionsOfUser.permissons.every(p => p.oid != t.oid))
      }
    }
    if (search) {
      temp = temp.filter(t => t.name.toLowerCase().includes(search.toLowerCase()))
    }
    setFilterPermissions(_ => [...temp])
  }
  const modifyFilterUsers = () => {
    if (!webUsers || mode != 'Permissions') return
    let temp = [...webUsers]
    if (usersOfPermission) {
      if (accessFilter == 'Have Access') {
        temp = temp.filter(t => usersOfPermission.users.some(u => u.toLowerCase() == t.username.toLowerCase()))
      }
      else if (accessFilter == 'No Access') {
        temp = temp.filter(t => usersOfPermission.users.every(u => u.toLowerCase() != t.username.toLowerCase()))
      }
    }
    if (search) {
      temp = temp.filter(t => t.username.toLowerCase().includes(search.toLowerCase()))
    }
    setFilterUsers(_ => [...temp])
  }
  const fetchUsersOfPermission = permission.useUsersOfPermission({
    onSuccess: r => {
      setUsersOfPermission(_ => ({ ...r }))
    },
    onError: e => {
      show({
        summary: firstUpper(words['error']),
        detail: e.message ?? (e.status ?? firstUpper(words['something went wrong'])),
        severity: 'error',
        life: 500
      })
    }, enabled: false, params: { permissionOid: selectedPermission }
  })
  const addOrRemovePermissionsOfUser = permission.useAddOrRemovePermissionsOfUser({
    onSuccess: async re => {
      setPermissionOfUser(_ => ({ ...re }));
      await delay(200);
      setFetching(false)
    },
    onError: e => {
      setFetching(false)
      show({
        summary: firstUpper(words['error']),
        detail: e.message ?? (e.status ?? firstUpper(words['something went wrong'])),
        severity: 'error',
        life: 5000
      })
    }
  })
  const addOrRemoveUsersOfPermission = permission.useAddOrRemoveUsersOfPermission({
    onSuccess: async res => {
      setUsersOfPermission(_ => ({ ...res }));
      await delay(200);
      setFetching(false)
    },
    onError: e => {
      setFetching(false)
      show({
        summary: firstUpper(words['error']),
        detail: e.message ?? (e.status ?? firstUpper(words['something went wrong'])),
        severity: 'error',
        life: 5000
      })
    }
  })
  const fetchAllPermissions = permission.useAllPermissions({
    onSuccess: pp => {
      setAllPermissions(_ => [...pp])
      if (!selectedPermission && pp.length > 0) setSelectedPermission(pp[0].oid)
      // setFetching(false)
    },
    onError: e => {
      console.log(e)
      // setFetching(false)
      show({
        summary: firstUpper(words['error']),
        detail: e.message ?? (e.status ?? firstUpper(words['something went wrong'])),
        severity: 'error',
        life: 5000
      })
    },
    enabled: false
  })
  const fetchPermissionsOfUser = permission.usePermissionsOfUser({
    onSuccess: rr => {
      setPermissionOfUser(_ => {
        return ({ ...rr })
      })
    },
    onError: e => {
      show({
        summary: firstUpper(words['error']),
        detail: e.message ?? (e.status ?? firstUpper(words['something went wrong'])),
        life: 5000,
        severity: 'error'
      })
    },
    enabled: false,
    params: { username: selectedUser }
  })
  const fetchWebUsers = permission.useWebUsers({
    onSuccess: us => {
      setWebUsers(_ => [...us])
      if (!selectedUser && us.length > 0) setSelectedUser(us[0].username)
      // setFetching(false)
    },
    onError: e => {
      console.log(e)
      // setFetching(false)
      show({
        summary: firstUpper(words['error']),
        detail: e.message ?? (e.status ?? firstUpper(words['something went wrong'])),
        severity: 'error',
        life: 5000
      })
    },
    enabled: false
  })
  const options: TMode[] = [{
    value: 'Permissions',
    label: firstUpper(words['permissions']),
    code: 'p'
  }, {
    value: 'Users',
    label: firstUpper(words['users']),
    code: 'u'
  }]
  const checkUserAccess = (username: string) => {
    return usersOfPermission && usersOfPermission.users.some(u =>
      u.toLowerCase() == username.toLowerCase())
  }
  const checkAccessRight = (permission: string) => {
    return permissionsOfUser?.permissons.some(p => p.oid == permission)
  }
  const clean = () => {
    replace('')
    showSearchbox()
  }
  const modifyAllowStatus = () => {
    if (mode == 'Permissions') {
      if (!filterUsers) return
      if (filterUsers.length < 1) return setAllowStatus(_ => 'none')
      setAllowStatus(_ => filterUsers.every(t =>
        usersOfPermission?.users.some(u => u.toLowerCase() == t.username.toLowerCase())) ?
        'all' : (filterUsers.every(t => usersOfPermission?.users.every(u =>
          u.toLowerCase() != t.username.toLowerCase()))) ? 'none' : 'some')
      return;
    }
    if (!filterPermissions) return
    if (filterPermissions.length < 1) return setAllowStatus(_ => 'none')
    setAllowStatus(_ => filterPermissions.every(t =>
      permissionsOfUser?.permissons.some(p => p.oid == t.oid)) ?
      'all' : (filterPermissions.every(p =>
        permissionsOfUser?.permissons.every(v => v.oid != p.oid)) ? 'none' : 'some'))
  }
  useEffect(() => {
    modifyAllowStatus()
  }, [mode])
  useEffect(() => {
    modifyAllowStatus()
  }, [filterUsers])
  useEffect(() => {
    modifyAllowStatus()
  }, [filterPermissions])
  useEffect(() => {
    modifyFilterUsers()
  }, [usersOfPermission])
  useEffect(() => {
    modifyFilterPermissions()
  }, [permissionsOfUser])
  useEffect(() => {
    modifyFilterUsers()
    modifyFilterPermissions()
  }, [search])
  useEffect(() => {
    modifyFilterUsers()
    modifyFilterPermissions()
  }, [accessFilter])
  useEffect(() => {
    if (!selectedPermission) return;
    fetchUsersOfPermission()
  }, [selectedPermission])
  useEffect(() => {
    if (!selectedUser) return;
    fetchPermissionsOfUser()
  }, [selectedUser])
  useEffect(() => {
    if (!allPermissions) return
    modifyFilterPermissions()
  }, [allPermissions])
  useEffect(() => {
    if (!webUsers) return
    modifyFilterUsers()
  }, [webUsers])
  useEffect(() => {
    if (!allPermissions) fetchAllPermissions()
    if (!webUsers) fetchWebUsers()
    hide()
    replace(words['access right'])
    return clean
  }, [])
  return <BasePage>
    <div style={{
      flex: 1,
      borderRadius: 10,
      display: 'flex',
      gap: 16,
      padding: 16,
      paddingTop: 5
    }}>
      <div className="permissions-list sect-card">
        <Dropdown
          value={mode}
          onChange={e => setMode(e.value)}
          options={options}
          optionLabel="label" />
        {mode == 'Permissions' ? <div className="in-permissions-list">
          {!allPermissions ? <Skeleton height="100%" />
            : allPermissions.length < 1 ? <div>No Permission</div>
              : <Menu style={{ width: '100%', height: '100%' }}
                model={allPermissions.map((v): MenuItem => ({
                  label: v.name.toLowerCase() == "adjust point" ?
                    firstUpper(words['adjust point_v']) : v.name.toLowerCase() == "announcement" ? firstUpper(words['announcement']) : firstUpper(words['event setup_v']),
                  data: v,
                  id: v.oid,
                  style: {
                    background: selectedPermission == v.oid ?
                      '#eee' : undefined, transition: '.2s'
                  },
                  command: () => setSelectedPermission(v.oid)
                }))} />}
        </div> :
          <div className="in-users-list">
            {!webUsers ? <Skeleton height="100%" /> : webUsers.length < 1 ?
              <div>No Users</div> :
              <Menu style={{ width: '100%', height: '100%' }}
                model={webUsers.map((v): MenuItem => ({
                  label: v.username,
                  data: v.username,
                  id: v.username,
                  style: {
                    background: selectedUser == v.username ?
                      '#eee' : undefined, transition: '.2s'
                  },
                  command: () => setSelectedUser(v.username)
                }))} />}
          </div>}
      </div>
      <div className="users-list sect-card">
        <div style={{ display: 'flex', gap: 10, }}>
          <span className="p-input-icon-left">
            <i className="pi ri-search-line"></i>
            <InputText onChange={e => setSearch(e.target.value)}
              style={{ maxHeight: 38 }}
              placeholder={firstUpper(words["search"])} />
          </span>
          <Dropdown style={{ width: 138 }}
            value={accessFilter}
            onChange={e => setAccessFilter(e.value)}
            options={[{
              value: 'All',
              label: firstUpper(words['all'])
            }, {
              value: 'Have Access',
              label: firstUpper(words['have access'])
            }, {
              value: 'No Access',
              label: firstUpper(words['no access'])
            }]} optionLabel="label" />
          <Button
            disabled={(mode == 'Users' && (!filterPermissions || filterPermissions.length < 1)) ||
              (mode == 'Permissions' && (!filterUsers || filterUsers.length < 1)) || fetching}
            onClick={() => {
              const newStatus = allowStatus !== 'none' && allowStatus !== 'some' ? 'none' : 'all'
              if (mode == 'Permissions') {
                if (selectedPermission && filterUsers) {
                  setFetching(true)
                  setUpdatingUsers(_ => filterUsers.map(f => f.username))
                  addOrRemoveUsersOfPermission({
                    permissionOid: selectedPermission,
                    addUsers: newStatus == 'all' ? [...filterUsers.map(f => f.username)] : [],
                    removeUsers: newStatus == 'none' ? [...filterUsers.map(f => f.username)] : []
                  })
                }
                setAllowStatus(_ => newStatus);
                return
              }
              if (selectedUser && filterPermissions) {
                setFetching(true)
                setUpdatingPermissions(_ => filterPermissions.map(f => f.oid))
                addOrRemovePermissionsOfUser({
                  username: selectedUser,
                  addPermissions: newStatus == 'all' ? [...filterPermissions.map(f => f.oid)] : [],
                  removePermissions: newStatus == 'none' ? [...filterPermissions.map(f => f.oid)] : []
                })
              }
              setAllowStatus(_ => newStatus);
            }} style={{
              maxHeight: 36,
              background: '#fff',
              color: '#333',
              padding: '0 10px',
              borderRadius: 3,
              borderColor: '#ccc'
            }} >
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <i style={{ fontSize: 20, color: '#0e8d96' }}
                className={allowStatus == 'all' ?
                  'ri-checkbox-fill' : allowStatus == 'none' ?
                    'ri-checkbox-blank-line' : 'ri-checkbox-indeterminate-fill'}></i>
              <span>{capitalize(words['allow all'])}</span>
            </div>
          </Button>
        </div>
        <div style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {mode == 'Permissions' ? (!filterUsers ?
            <Skeleton width="100%" height="100%" /> : <div
              style={{
                display: 'flex',
                gap: 10,
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'center',
                maxHeight: 'calc(100vh - 220px)',
                overflowY: 'auto'
              }}>
              {filterUsers.map(v => {
                if (!usersOfPermission) return <Skeleton key={v.username} />
                const hasAccess = checkUserAccess(v.username)
                return (<div onClick={() => {
                  if (!selectedPermission ||
                    (fetching && updatingUsers.includes(v.username))) return;
                  setFetching(true)
                  setUpdatingUsers(_ => [v.username])
                  addOrRemoveUsersOfPermission({
                    permissionOid: selectedPermission,
                    addUsers: hasAccess ? [] : [v.username],
                    removeUsers: hasAccess ? [v.username] : []
                  })
                }}
                  className="in-card"
                  key={v.username}
                  style={{
                    background: hasAccess ? '#8fd2ff' : '#efefef',
                    cursor: fetching && updatingUsers.includes(v.username) ?
                      'default' : 'pointer'
                  }}>
                  <div style={{
                    display: 'flex',
                    gap: 10,
                    alignItems: 'center'
                  }}>
                    <img style={{
                      width: 50,
                      aspectRatio: '1/1'
                    }}
                      src={v.profileImage ?? profilePlaceholder}
                      alt="profile" />
                    <span>
                      {v.username}
                    </span>
                    <span style={{
                      background: fetching && updatingUsers.includes(v.username) ?
                        undefined : (hasAccess ? '#9bbd5d' : undefined),
                      width: 25,
                      aspectRatio: '1/1',
                      borderRadius: '50%',
                      color: '#fff'
                    }}>
                      {fetching && updatingUsers.includes(v.username) ?
                        <ProgressSpinner style={{ width: 18, height: 18 }} /> :
                        (hasAccess && <i className="ri-check-line"></i>)}
                    </span>
                  </div>
                </div>)
              })}
            </div>) : (!filterPermissions ?
              <Skeleton width="100%" height="100%" /> :
              <div style={{
                display: 'flex', gap: 10,
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'center',
                maxHeight: 'calc(100vh - 220px)',
                overflowY: 'auto'
              }}>
                {filterPermissions.map(v => {
                  if (!permissionsOfUser) return <Skeleton key={v.oid} />
                  const hasAccess = checkAccessRight(v.oid)
                  return (<div onClick={() => {
                    if (!selectedUser || (fetching &&
                      updatingPermissions.includes(v.oid))) return;
                    setFetching(true)
                    setUpdatingPermissions(_ => [v.oid])
                    addOrRemovePermissionsOfUser({
                      username: selectedUser,
                      addPermissions: hasAccess ? [] : [v.oid],
                      removePermissions: hasAccess ? [v.oid] : []
                    })
                  }} key={v.oid} className="in-card"
                    style={{
                      background: hasAccess ? '#8fd2ff' : '#efefef', gap: 6,
                      cursor: fetching && updatingPermissions.includes(v.oid) ?
                        'default' : 'pointer'
                    }}>
                    <span>
                      {v.name}
                    </span>
                    <span style={{
                      background: fetching && updatingPermissions.includes(v.oid) ?
                        undefined : (hasAccess ? '#9bbd5d' : undefined),
                      width: 25, aspectRatio: '1/1', borderRadius: '50%', color: '#fff'
                    }}>
                      {fetching && updatingPermissions.includes(v.oid) ?
                        <ProgressSpinner style={{ width: 18, height: 18 }} /> :
                        (hasAccess && <i className="ri-check-line"></i>)
                      }
                    </span>
                  </div>)
                })}
              </div>)}
        </div>
      </div>
    </div>
  </BasePage>
}
export default AccessRight