import { FC, useEffect, useRef, useState } from "react";
import { Column as Col } from 'primereact/column'
import BasePage from "../../base-page";
import {
  ColumnDirective,
  ColumnModel,
  ColumnsDirective,
  ExcelExport,
  GridComponent,
  Inject,
  Resize,
  RowDataBoundEventArgs,
  Toolbar
} from "@syncfusion/ej2-react-grids";
import { useApi } from "../../../providers/api-provider";
import { useToast } from "../../../providers/toast-provider";
import { TPOSClient, TPOSClientFilter } from "../../../types/models";
import { firstUpper } from "../../../utils/text-util";
import '../../../assets/css/client-list.css'
import { Dialog } from "primereact/dialog";
import { useLang } from "../../../providers/lang-provider";
import ClientDetails from "./components/client-details";
import { rowsPerPage } from "../../../constants";
import Paginator from "../../others/paginator";
import '../../../assets/css/client-list.css'
import { useSearchBox } from "../../../providers/search-box-provider";
import { DataTable, DataTableValue } from "primereact/datatable";
import { Skeleton } from "primereact/skeleton";
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";

const initialFilter: TPOSClientFilter = {
  page: 1,
  take: 20,
  isSavingAndMember: true
}
type ClientCellCol = 'Bill Address' | 'Delivery Address' | 'Gender' | 'Number' | 'Name' | 'Phone' | 'Status'
type SortIcon = {
  key: 'none' | 'asc' | 'desc',
  icon: 'e-sorting-3' | 'e-sort-down' | 'e-sort-up'
}
type ClientCol = {
  id: 'bill-address' | 'delivery-address' | 'created' | 'updated' | 'gender' | 'name' | 'number' | 'registered-at' | 'phone' | 'status'
  label: string
  width?: number
}
const clientCols: ClientCol[] = [{
  id: 'number',
  label: 'Number',
  width: 150
}, {
  id: 'name',
  label: 'Name',
  width: 170
}, {
  id: 'gender',
  label: 'Gender',
  width: 110
}, {
  id: 'phone',
  label: 'Phone',
  width: 130
}, {
  id: 'bill-address',
  label: 'Bill Address'
}, {
  id: 'delivery-address',
  label: 'Delivery Address'
}, {
  id: 'status',
  label: 'Status',
  width: 110
}]
type RenderedClient = {
  oid: string
  billAddress?: string
  deliveryAddress?: string
  number?: string
  name?: string
  dob?: string
  phone?: string
  gender?: string
  clientGroup?: string
  status: string
}

const ClientList: FC = () => {
  const [initializing, setInitializing] = useState(true)
  const { lang, words } = useLang()
  const [currentItem, setCurrentItem] = useState<TPOSClient>()
  const [fetching, setFetching] = useState(false)
  const [filter, setFilter] = useState<TPOSClientFilter>(initialFilter)
  const [showDetails, setShowDetails] = useState(false)
  const [clients, setClients] = useState<TPOSClient[]>([])
  const [total, setTotal] = useState(0)
  const [numSort, setNumSort] = useState<SortIcon>({ key: 'none', icon: 'e-sorting-3' })
  const [nameSort, setNameSort] = useState<SortIcon>({ key: 'none', icon: 'e-sorting-3' })
  const [phoneSort, setPhoneSort] = useState<SortIcon>({ key: 'none', icon: 'e-sorting-3' })
  const [statusSort, setStatusSort] = useState<SortIcon>({ key: 'none', icon: 'e-sorting-3' })
  const [genderSort, setGenderSort] = useState<SortIcon>({ key: 'none', icon: 'e-sorting-3' })
  const [billAddressSort, setBillAddressSort] = useState<SortIcon>({ key: 'none', icon: 'e-sorting-3' })
  const [deliveryAddressSort, setDeliveryAddressSort] = useState<SortIcon>({ key: 'none', icon: 'e-sorting-3' })
  const [isShowAll, setIsShowAll] = useState(false)
  const { posClient } = useApi()
  const { show } = useToast()
  const { defineOnSearch } = useSearchBox()
  const data = () => clients.map((c): RenderedClient => ({
    oid: c.oid,
    billAddress: c.billToAddress1 ?? '---',
    clientGroup: c.clientGroup ?? '---',
    deliveryAddress: c.deliverToAddress1 ?? '---',
    dob: c.dob?.toString() ?? '---',
    gender: c.gender ? (firstUpper(words[c.gender.toLowerCase()])) : '---',
    name: lang == 'khmer' && c.nameKhmer ? c.nameKhmer : c.name ?? '---',
    number: c.number ?? '---',
    phone: c.phone1,
    status: c.status
  }))
  const grid = useRef<GridComponent | null>(null)
  const dataBound = () => grid.current?.hideScroll()
  const onSelect = (id: string) => {
    setCurrentItem(_ => clients.find(d => d.oid === id))
    setShowDetails(true)
  }
  const rowDataBound = (args: RowDataBoundEventArgs) => {
    if (!args.row) return;
    args.row.classList.add('clickable-row')
  }
  const fetchClients = posClient.useFilterPosClients({
    onSuccess: res => {
      setTotal(_ => res.totalRecords)
      setClients(_ => res.data)
      setInitializing(false)
      setFetching(false)
    },
    onError: e => {
      setInitializing(false)
      setFetching(false)
      show({
        detail: e,
        summary: 'Error',
        life: 5000
      })
    }
  })
  const onTake = (n: number) =>
    setFilter(p =>
    ({
      ...p,
      page: 1,
      take: n
    }))
  const onPage = (n: number) =>
    setFilter(p => ({
      ...p,
      page: n
    }))
  const headerTemp = (props: any) => {
    const headText: ClientCellCol = props.headerText
    let target: SortIcon
    let onClick: () => void
    switch (headText) {
      case 'Number':
        target = numSort
        onClick = () => {
          setNumSort(p => ({
            key: p.key === 'none' ?
              'asc' : (p.key === 'asc' ?
                'desc' : 'none'),
            icon: p.key === 'none' ?
              'e-sort-down' : p.key === 'asc' ?
                'e-sort-up' : 'e-sorting-3'
          }));
          setFilter(f => ({
            ...f,
            order: {
              field: 'number',
              isDesc: numSort.key === 'asc'
            }
          }));
          [
            setNameSort,
            setGenderSort,
            setDeliveryAddressSort,
            setBillAddressSort,
            setPhoneSort,
            setStatusSort
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
          setFilter(f => ({
            ...f,
            order: {
              field: 'name',
              isDesc: nameSort.key === 'asc'
            }
          }));
          [
            setNumSort,
            setGenderSort,
            setBillAddressSort,
            setDeliveryAddressSort,
            setPhoneSort,
            setStatusSort
          ].forEach(fun => fun({
            key: 'none',
            icon: 'e-sorting-3'
          }))
        }
        break
      case 'Phone':
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
          setFilter(f => ({
            ...f,
            order: {
              field: 'phone',
              isDesc: phoneSort.key === 'asc'
            }
          }));
          [
            setNameSort,
            setStatusSort,
            setNumSort,
            setGenderSort,
            setBillAddressSort,
            setDeliveryAddressSort
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
          setFilter(f => ({
            ...f,
            order: {
              field: 'gender',
              isDesc: genderSort.key === 'asc'
            }
          }));
          [
            setNumSort,
            setNameSort,
            setDeliveryAddressSort,
            setBillAddressSort,
            setPhoneSort,
            setStatusSort
          ].forEach(fun => fun({
            key: 'none',
            icon: 'e-sorting-3'
          }))
        }
        break
      case 'Bill Address':
        target = billAddressSort
        onClick = () => {
          setBillAddressSort(p => ({
            key: p.key === 'none' ?
              'asc' : (p.key === 'asc' ?
                'desc' : 'none'),
            icon: p.key === 'none' ?
              'e-sort-down' : p.key === 'asc' ?
                'e-sort-up' : 'e-sorting-3'
          }));
          setFilter(f => ({
            ...f,
            order: {
              field: 'billAddress',
              isDesc: billAddressSort.key === 'asc'
            }
          }));
          [
            setNumSort,
            setNameSort,
            setGenderSort,
            setDeliveryAddressSort,
            setPhoneSort,
            setStatusSort
          ].forEach(fun => fun({
            key: 'none',
            icon: 'e-sorting-3'
          }))
        }
        break
      case 'Status':
        target = statusSort
        onClick = () => {
          setStatusSort(p => ({
            key: p.key === 'none' ?
              'asc' : (p.key === 'asc' ?
                'desc' : 'none'),
            icon: p.key === 'none' ?
              'e-sort-down' : p.key === 'asc' ?
                'e-sort-up' : 'e-sorting-3'
          }));
          setFilter(f => ({
            ...f,
            order: {
              field: 'status',
              isDesc: statusSort.key === 'asc'
            }
          }));
          [
            setNumSort,
            setNameSort,
            setGenderSort,
            setDeliveryAddressSort,
            setBillAddressSort,
            setPhoneSort,
          ].forEach(fun => fun({
            key: 'none',
            icon: 'e-sorting-3'
          }))
        }
        break
      default:
        target = deliveryAddressSort
        onClick = () => {
          setDeliveryAddressSort(p => ({
            key: p.key === 'none' ?
              'asc' : (p.key === 'asc' ?
                'desc' : 'none'),
            icon: p.key === 'none' ?
              'e-sort-down' : p.key === 'asc' ?
                'e-sort-up' : 'e-sorting-3'
          }));
          setFilter(f => ({
            ...f,
            order: {
              field: 'deliveryAddress',
              isDesc: deliveryAddressSort.key === 'asc'
            }
          }));
          [
            setNumSort,
            setNameSort,
            setGenderSort,
            setBillAddressSort,
            setPhoneSort,
            setStatusSort
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
  const cModels: ColumnModel[] = clientCols.map(c => ({
    field: c.id,
    headerText: c.label,
    headerTextAlign: 'Left',
    textAlign: 'Left',
    width: c.id === 'bill-address' || c.id === 'delivery-address' ?
      400 : c.id === 'gender' ? 130 : 300,
  }))
  const today = (forFileName: boolean = false, withTime: boolean = false) => {
    const d = new Date();
    const sep = forFileName ? '-' : '/';
    let res = `${d.getDate()}${sep}${d.getMonth() + 1}${sep}${d.getFullYear()}`
    if (withTime) res += ` ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`
    return res;
  }
  const excelProps: any = {
    dataSource: data(),
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
              colSpan: clientCols.length,
              value: 'CLIENT LIST',
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
              colSpan: clientCols.length,
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
              colSpan: clientCols.length,
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
            colSpan: clientCols.length,
            value: `Total: ${data().length}`,
            style: { bold: true }
          }]
        },
      ]
    },
    fileName: `client-list(${today(true, true)}).xlsx`
  }
  const closeDetailDialog = () => setShowDetails(false)
  const skeletonItems = Array.from({
    length: filter.take ??
      rowsPerPage[0] ?? 10
  }, (_): DataTableValue => ({}))
  const skeletonBody = () => <Skeleton></Skeleton>
  const toolbarClick = () => {
    grid.current?.excelExport(excelProps)
  }
  const showAllIcon = () => {
    if (isShowAll) return 'ri-checkbox-line';
    return 'ri-checkbox-blank-line'
  }
  const onTriggerShowAll = () => {
    setIsShowAll(p => !p)
    setFilter(f => ({ ...f, isSavingAndMember: !f.isSavingAndMember }))
  }
  useEffect(() => {
    defineOnSearch((s) => setFilter(f => ({ ...f, search: s })))
  }, [])
  useEffect(() => {
    setFetching(true)
    fetchClients(filter)
  }, [filter])
  return <BasePage rightComponent={
    <div style={{ display: 'flex', gap: 10 }}>
      <ButtonComponent
        cssClass="btn-show-all"
        iconCss={showAllIcon()}
        content={words['show all clients']}
        onClick={onTriggerShowAll} />
      <ButtonComponent
        onClick={toolbarClick}
        cssClass="e-success"
        iconCss="ri-file-excel-line"
        content={words["export excel"]} />
    </div>
  }>
    {initializing || fetching && <DataTable
      size="small"
      style={{
        flex: 1,
        margin: 10
      }}
      value={skeletonItems}
      className="p-datatable-striped">
      {clientCols.map(c => <Col
        key={c.id}
        field={c.id}
        header={firstUpper(words[c.label.toLowerCase()])}
        style={{ width: c.width }}
        body={skeletonBody}></Col>)}
    </DataTable>}
    <div
      className="client-list-v2"
      style={{
        display: initializing || fetching ? 'none' : 'flex'
      }}>
      <GridComponent
        dataBound={dataBound}
        excelHeaderQueryCellInfo={args => args.style = {
          borders: { color: '#222222' }
        }}
        excelQueryCellInfo={args => args.style = {
          borders: { color: '#222222' }
        }}
        allowExcelExport
        rowHeight={28}
        ref={grid}
        enableStickyHeader
        rowSelected={e => onSelect(e.data.oid)}
        // toolbarClick={toolbarClick}
        rowDataBound={rowDataBound}
        autoFit
        height='calc(100vh - 240px)'
        // toolbar={["ExcelExport"]}
        allowResizing
        dataSource={data()}>
        <ColumnsDirective>
          {clientCols.map(c =>
            <ColumnDirective
              field={c.id}
              textAlign="Left"
              headerText={firstUpper(words[c.label.toLowerCase()])}
              headerTemplate={headerTemp}
              key={c.id} />)}
        </ColumnsDirective>
        <Inject services={[Resize, Toolbar, ExcelExport]} />
      </GridComponent>
      <Paginator
        page={filter.page ?? 1}
        take={filter.take ?? rowsPerPage[0]}
        onTake={onTake}
        onPage={onPage}
        total={total} />
      <Dialog
        closeIcon={<i className="ri-close-line"></i>}
        visible={showDetails}
        className="client-detail-dialog"
        draggable={false}
        resizable={true}
        maximizable={true}
        header={
          <div className="client-detail-dialog-head">
            <i className="pi pi-id-card" />
            <span>
              {firstUpper(words["details"])}
            </span>
          </div>}
        onHide={closeDetailDialog} >
        {currentItem &&
          <ClientDetails data={currentItem} />}
      </Dialog>
    </div>
  </BasePage>
}
export default ClientList