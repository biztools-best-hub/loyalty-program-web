import { FC, useEffect, useMemo, useRef, useState } from "react";
import { Column as Col } from 'primereact/column'
import BasePage from "../../base-page";
import { TUser, TUserFilter } from "../../../types/models";
import { rowsPerPage } from "../../../constants";
import { useApi } from "../../../providers/api-provider";
import { useToast } from "../../../providers/toast-provider";
import {
  Column,
  ColumnDirective,
  ColumnModel,
  ColumnsDirective,
  ExcelExport,
  GridComponent,
  Inject,
  QueryCellInfoEventArgs,
  Resize,
  Toolbar
} from "@syncfusion/ej2-react-grids";
import '../../../assets/css/user-list.css'
import { useSearchBox } from "../../../providers/search-box-provider";
import Paginator from "../../others/paginator";
import '../../../assets/css/user-list.css'
import { getValue } from "@syncfusion/ej2-base";
import { Skeleton } from "primereact/skeleton";
import { DataTable, DataTableValue } from "primereact/datatable";
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import { TabComponent, TabItemDirective, TabItemsDirective } from "@syncfusion/ej2-react-navigations";
import { capitalize, firstUpper } from "../../../utils/text-util";
import { useLang } from "../../../providers/lang-provider";
import { useUser } from "../../../providers/user-provider";
const avatar = '/images/avatar.png'
const initialFilter: TUserFilter = {
  hasProfileImage: 2,
  page: 1,
  isInGroups: { field: '', values: ['web'] },
  take: rowsPerPage[0]
}
type SortIcon = {
  key: 'none' | 'asc' | 'desc',
  icon: 'e-sorting-3' | 'e-sort-down' | 'e-sort-up'
}
type CellCol = 'Username' | 'Gender' | 'Name' | 'Email' | 'Address' | string
type UCol = {
  id: 'image' | 'code' | 'username' | 'name' | 'address' | 'email' | 'gender' | 'master'
  label: CellCol
  isImage?: boolean
  width?: number
}
const userCols: UCol[] = [{
  id: 'image',
  label: '',
  width: 60,
  isImage: true
}, {
  id: 'username',
  width: 150,
  label: 'Username'
}, {
  id: 'name',
  width: 160,
  label: 'Name'
}, {
  id: 'gender',
  label: 'Gender',
  width: 120
}, {
  id: 'email',
  width: 240,
  label: 'Email'
}, {
  id: 'address',
  width: 400,
  label: 'Address'
}, {
  id: 'master',
  width: 160,
  label: ''
}]
type RenderedUser = {
  oid: string
  image?: string
  code: string
  username: string
  name?: string
  gender?: string
  address?: string
  phone?: string
  email?: string
  currentType?: string
}
const UserList: FC = () => {
  const [total, setTotal] = useState(0)
  const { defineOnSearch } = useSearchBox()
  const [fetching, setFetching] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const [data, setData] = useState<TUser[]>([])
  const [targetUser, setTargetUser] = useState<TUser>()
  const [filter, setFilter] = useState<TUserFilter>(initialFilter)
  const [tabMode, setTabMode] = useState<'web' | 'app'>('web');
  const { words } = useLang()
  const { show } = useToast()
  const { user } = useApi()
  const uHook = useUser()
  const usersCols = useMemo(() => uHook.user?.currentRole?.toLocaleLowerCase() == 'admin' && tabMode == 'app' ? userCols : userCols.filter(c => c.id != 'master'), [uHook.user?.currentRole, tabMode])
  const [usernameSort, setUsernameSort] = useState<SortIcon>({ key: 'none', icon: 'e-sorting-3' })
  const [nameSort, setNameSort] = useState<SortIcon>({ key: 'none', icon: 'e-sorting-3' })
  const [genderSort, setGenderSort] = useState<SortIcon>({ key: 'none', icon: 'e-sorting-3' })
  const [phoneSort, setPhoneSort] = useState<SortIcon>({ key: 'none', icon: 'e-sorting-3' })
  const [emailSort, setEmailSort] = useState<SortIcon>({ key: 'none', icon: 'e-sorting-3' })
  const [addressSort, setAddressSort] = useState<SortIcon>({ key: 'none', icon: 'e-sorting-3' })
  const fetchUsers = user.useUsers({
    onSuccess: res => {
      setInitializing(false)
      setFetching(false)
      setTotal(_ => res.totalRecords)
      setData(_ => res.data)
    },
    onError: e => {
      setInitializing(false)
      setFetching(false)
      show({
        summary: 'Error',
        detail: e,
        life: 5000
      })
    }
  })
  const switchUserType = user.useSwitchUserType({
    onSuccess: r => {
      setData(p => {
        const temp = [...p];
        for (let i = 0; i < temp.length; i++) {
          if (temp[i].username != r.username) continue;
          temp[i] = r;
        }
        return temp;
      });
      setTargetUser(undefined);
    },
    enabled: false,
    onError: e => {
      setTargetUser(undefined)
      console.log(e)
    },
    params: {
      username: targetUser?.username,
      userType: targetUser?.currentType?.toLowerCase() == "master" ? "member" : "master"
    }
  });
  // const updateUser = user.useUpdateUser({
  //   onSuccess: r => {
  //     setData(p => {
  //       const temp = [...p];
  //       for (let i = 0; i < temp.length; i++) {
  //         if (temp[i].username != r.username) continue;
  //         temp[i] = r;
  //       }
  //       return temp;
  //     })
  //   },
  //   onError: e => {
  //     console.log(e)
  //   }
  // })
  const users = () => data.map((d): RenderedUser => {
    let name = `${d.lastname ?? ''} ${d.firstname ?? ''}`
    if (name.trim().length < 1) name = '---'
    return {
      oid: d.oid,
      username: d.username,
      code: d.code,
      email: d.currentEmail ?? '---',
      phone: d.currentPhone ?? '---',
      address: d.currentAddress?.en ?? '---',
      gender: d.gender ?? '---',
      image: d.profileImage,
      currentType: d.currentType,
      name
    }
  })
  const customizeCell = (args: QueryCellInfoEventArgs) => {
    if (!args.cell || !args.data) return;
    const col = (args.column as Column).field
    let d = getValue(col, args.data)
    if (col === 'image') {
      return args.cell.innerHTML = `<div class="user-list-img-container">
      <img class="user-list-img" src="${d ?? avatar}"/>
      </div>`
    }
    if (col === 'master') {
      d = getValue("currentType", args.data)
      let checked = d.toLowerCase() == "master" ? "checked" : ""
      let disabled = data.some(d => d.currentType?.toLowerCase() == "master") && d.toLowerCase() != 'master' ? "disabled" : "";
      const username = getValue("username", args.data);
      if (!args.cell) return;
      args.cell.classList.add('user-type-toggler')
      args.cell.setAttribute("username", username)
      args.cell.innerHTML = `<div  id="${username}-check-box" class="user-type-toggler" username="${username}" style="display:flex; cursor:${disabled == 'disabled' ? 'default' : 'pointer'}; align-items:center; justify-content:center; gap:6px;">
      <input type="checkbox" ${disabled} ${checked} class="user-type-toggler" username="${username}" style="cursor:${disabled ? '' : 'pointer'}" />
      <span class="user-type-toggler" username="${username}">Master</span>
      </div>`;
      return;
    }
    if (col !== 'gender') return
    if (d.toLowerCase() === 'none') return args.cell.textContent = '---'
    return args.cell.innerHTML = `<div class="custom-cell-left">
    <span>${d}</span>
    <span class="${d.toLowerCase()}">
    <i class="${d.toLowerCase() === 'male' ?
        'ri-men-line' : 'ri-women-line'}"></i>
    </span>
    </div>`
  }
  const grid = useRef<GridComponent>(null)
  const dataBound = () => {
    grid.current?.hideScroll()
  }
  const onTake = (n: number) =>
    setFilter(p =>
    ({
      ...p,
      page: 1,
      take: n
    }))
  const onPage = (n: number) =>
    setFilter(p =>
    ({
      ...p,
      page: n
    }))
  const skeletonItems = Array.from({ length: filter.take ?? rowsPerPage[0] ?? 10 }, (_): DataTableValue => ({}))
  const skeletonBody = () => <Skeleton></Skeleton>
  const headerTemp = (props: any) => {
    const headText: CellCol = props.headerText
    let target: SortIcon
    let onClick: () => void
    switch (headText) {
      case 'Username':
        target = usernameSort
        onClick = () => {
          setUsernameSort(p => ({
            key: p.key === 'none' ?
              'asc' : (p.key === 'asc' ?
                'desc' : 'none'),
            icon: p.key === 'none' ?
              'e-sort-down' : p.key === 'asc' ?
                'e-sort-up' : 'e-sorting-3'
          }));
          setFilter(f => ({ ...f, order: { field: 'username', isDesc: usernameSort.key === 'asc' } }));
          [
            setNameSort,
            setGenderSort,
            setPhoneSort,
            setEmailSort,
            setAddressSort
          ].forEach(fun => fun({
            key: 'none',
            icon: 'e-sorting-3'
          }))
        }
        break
      case 'Name':
        target = nameSort
        onClick = () => {
          setNameSort(p => ({
            key: p.key === 'none' ?
              'asc' : (p.key === 'asc' ?
                'desc' : 'none'),
            icon: p.key === 'none' ?
              'e-sort-down' : p.key === 'asc' ?
                'e-sort-up' : 'e-sorting-3'
          }));
          setFilter(f => ({ ...f, order: { field: 'name', isDesc: nameSort.key === 'asc' } }));
          [
            setGenderSort,
            setAddressSort,
            setEmailSort,
            setPhoneSort,
            setUsernameSort
          ].forEach(fun => fun({
            key: 'none',
            icon: 'e-sorting-3'
          }))
        }
        break
      case 'Gender':
        target = genderSort
        onClick = () => {
          setGenderSort(p => ({
            key: p.key === 'none' ?
              'asc' : (p.key === 'asc' ?
                'desc' : 'none'),
            icon: p.key === 'none' ?
              'e-sort-down' : p.key === 'asc' ?
                'e-sort-up' : 'e-sorting-3'
          }));
          setFilter(f => ({ ...f, order: { field: 'gender', isDesc: genderSort.key === 'asc' } }));
          [
            setNameSort,
            setUsernameSort,
            setPhoneSort,
            setEmailSort,
            setAddressSort
          ].forEach(fun => fun({
            key: 'none',
            icon: 'e-sorting-3'
          }))
        }
        break
      case 'Address':
        target = addressSort
        onClick = () => {
          setAddressSort(p => ({
            key: p.key === 'none' ?
              'asc' : (p.key === 'asc' ?
                'desc' : 'none'),
            icon: p.key === 'none' ?
              'e-sort-down' : p.key === 'asc' ?
                'e-sort-up' : 'e-sorting-3'
          }));
          setFilter(f => ({ ...f, order: { field: 'address', isDesc: addressSort.key === 'asc' } }));
          [
            setNameSort,
            setGenderSort,
            setUsernameSort,
            setEmailSort,
            setPhoneSort
          ].forEach(fun => fun({
            key: 'none',
            icon: 'e-sorting-3'
          }))
        }
        break
      case 'Email':
        target = emailSort
        onClick = () => {
          setEmailSort(p => ({
            key: p.key === 'none' ?
              'asc' : (p.key === 'asc' ?
                'desc' : 'none'),
            icon: p.key === 'none' ?
              'e-sort-down' : p.key === 'asc' ?
                'e-sort-up' : 'e-sorting-3'
          }));
          setFilter(f => ({ ...f, order: { field: 'email', isDesc: emailSort.key === 'asc' } }));
          [
            setNameSort,
            setGenderSort,
            setUsernameSort,
            setPhoneSort,
            setAddressSort
          ].forEach(fun => fun({
            key: 'none',
            icon: 'e-sorting-3'
          }))
        }
        break
      default:
        target = phoneSort
        onClick = () => {
          setPhoneSort(p => ({
            key: p.key === 'none' ?
              'asc' : (p.key === 'asc' ?
                'desc' : 'none'),
            icon: p.key === 'none' ?
              'e-sort-down' : p.key === 'asc' ?
                'e-sort-up' : 'e-sorting-3'
          }));
          setFilter(f => ({ ...f, order: { field: 'phone', isDesc: phoneSort.key === 'asc' } }));
          [
            setNameSort,
            setGenderSort,
            setUsernameSort,
            setEmailSort,
            setAddressSort
          ].forEach(fun => fun({
            key: 'none',
            icon: 'e-sorting-3'
          }))
        }
        break
    }
    return <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        justifyContent: 'space-between'
      }}>
      <span>{props.headerText}</span>
      <ButtonComponent
        onClick={onClick}
        style={{ minWidth: 30 }}
        cssClass={`e-small e-round sort-btn${target.key === 'none' ?
          '' : ' active'} e-flat e-primary`}
        iconCss={`e-icons ${target.icon} sort-icon${target.key === 'none' ?
          '' : ' active'}`} />
    </div>
  }
  const today = (forFileName: boolean = false, withTime: boolean = false) => {
    const d = new Date();
    const sep = forFileName ? '-' : '/';
    let res = `${d.getDate()}${sep}${d.getMonth() + 1}${sep}${d.getFullYear()}`
    if (withTime) res += ` ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`
    return res;
  }
  const cModels: ColumnModel[] = usersCols.filter(c => c.id !== 'image').map(c => ({
    field: c.id,
    headerText: c.label,
    headerTextAlign: 'Left',
    textAlign: 'Left',
    width: c.id === 'gender' ? 130 : 300,
  }))
  const excelProps: any = {
    dataSource: users(),
    query: '',
    columns: cModels,
    header: {
      headerRows: 5,
      rows: [
        {
          index: 1,
          cells: [
            {
              index: 1,
              colSpan: usersCols.filter(c => c.id !== 'image').length,
              value: 'USER LIST',
              style: {
                fontSize: 25,
                hAlign: 'Center',
                bold: true
              }
            }
          ]
        },
        {
          index: 2,
          cells: [
            {
              index: 1,
              colSpan: usersCols.filter(c => c.id !== 'image').length,
              value: 'Biztools Enterprise Solution Technology',
              style: {
                fontSize: 14,
                hAlign: 'Center'
              }
            },
          ]
        },
        {
          index: 3,
          cells: [
            {
              index: 1,
              colSpan: usersCols.filter(c => c.id !== 'image').length,
              value: today(),
              style: { hAlign: 'Center' }
            }
          ]
        }
      ]
    },

    footer: {
      footerRows: 2,
      rows: [
        {
          cells: [{
            index: 1,
            colSpan: usersCols.filter(c => c.id !== 'image').length,
            value: `Total: ${users().length}`,
            style: { bold: true }
          }]
        },
      ]
    },
    fileName: `user-list(${today(true, true)}).xlsx`
  }
  const toolbarClick = () => {
    grid.current?.excelExport(excelProps)
  }
  useEffect(() => {
    fetchUsers(filter)
    defineOnSearch((s: string) =>
      setFilter(p =>
      ({
        ...p,
        search: s
      })))
  }, [])
  useEffect(() => {
    setFetching(true)
    fetchUsers(filter)
  }, [filter])
  useEffect(() => {
    if (!targetUser) return
    switchUserType();
  }, [targetUser])
  return <BasePage
    rightComponent={<ButtonComponent
      cssClass="e-sm e-success"
      content={capitalize(words['export excel'])}
      iconCss="ri-file-excel-line"
      onClick={toolbarClick} />}>
    <div
      className="user-list">
      <TabComponent selecting={e => {
        if (e.selectingIndex == 0) {
          setFilter(f => ({ ...f, isInGroups: { values: ['web'] } }))
          setTabMode('web')
          return
        }
        setFilter(f => ({ ...f, isInGroups: { values: ['mobile'] } }))
        setTabMode('app')
      }}>
        <TabItemsDirective >
          <TabItemDirective header={
            {
              text: capitalize(words['web']),
              iconCss: 'ri-global-line'
            }
          }></TabItemDirective>
          <TabItemDirective header={
            {
              text: capitalize(words["app"]),
              iconCss: 'ri-android-line'
            }
          }></TabItemDirective>
        </TabItemsDirective>
      </TabComponent>
      {initializing || fetching && <DataTable
        size="small"
        style={{
          flex: 1,
          margin: 10
        }}
        value={skeletonItems}
        className="p-datatable-striped">
        {usersCols.map(c => <Col
          key={c.id}
          field={c.id}
          header={c.label}
          style={{ width: c.width ? c.width + 120 : c.width }}
          body={skeletonBody}></Col>)}
      </DataTable>}
      <div
        className="user-list-tbl"
        style={{
          display: initializing || fetching ? 'none' : ''
        }}>
        <GridComponent
          dataBound={dataBound}
          ref={grid}
          rowHeight={50}
          queryCellInfo={customizeCell}
          allowExcelExport
          toolbarClick={toolbarClick}
          excelHeaderQueryCellInfo={args => args.style = {
            borders: { color: '#222222' }
          }}
          excelQueryCellInfo={args => args.style = {
            borders: { color: '#222222' }
          }}
          autoFit
          enableHover={false}
          enableStickyHeader
          height='calc(100vh - 304px)'
          cellSelecting={args => {
            console.log(args)
          }}
          onClick={args => {
            const clickable = (args.target as any).classList.contains("user-type-toggler");
            if (!clickable) return;
            const username = (args.target as any).getAttribute("username")
            const u = data.find(d => d.username == username);
            if (u) {
              if (data.some(d => d.currentType?.toLowerCase() == "master" && d.username != username)) return;
              setTargetUser(u);
              // switchUserType(username, u.currentType?.toLowerCase() == "master" ? "member" : "master");
              // switchUserType({})
              // updateUser({username:username,currentType:'master',types})
              // (async () => {
              //   try {
              //   } catch (e) { }
              // })();
              // setData(p => {
              //   const temp = [...p];
              //   for (let i = 0; i < temp.length; i++) {
              //     if (temp[i].username != username) continue;
              //     if (temp[i].currentType == "master") {
              //       temp[i].currentType = "member";
              //       if (temp[i].types.includes("master")) temp[i].types = temp[i].types.filter(t => t != "master");
              //       return temp;
              //     }
              //     temp[i].currentType = "master";
              //     if (!temp[i].types.includes("master")) temp[i].types.push("master");
              //   }
              //   return temp;
              // });
            }
          }}
          allowResizing={true}
          dataSource={users()}>
          <ColumnsDirective>
            {usersCols.map(u =>
              <ColumnDirective
                textAlign="Left"
                headerTemplate={u.id === 'image' || u.id === 'master' ? undefined : headerTemp}
                key={u.id}
                field={u.id}
                headerText={u.id === 'image' || u.id == "master" ? '' :
                  firstUpper(words[u.label.toLocaleLowerCase()])}
              />)}
          </ColumnsDirective>
          <Inject services={[Resize, Toolbar, ExcelExport]} />
        </GridComponent>
      </div>
      {!initializing && !fetching &&
        <Paginator
          page={filter.page ?? 1}
          take={filter.take ?? rowsPerPage[0]}
          total={total}
          onTake={onTake}
          onPage={onPage} />
      }
    </div>
  </BasePage>
}
export default UserList