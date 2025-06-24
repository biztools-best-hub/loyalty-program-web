import { FC, useEffect, useRef, useState } from "react";
import BasePage from "../base-page";
import { MenuItem } from "primereact/menuitem";
import { useLang } from "../../providers/lang-provider";
import { capitalize, firstUpper } from "../../utils/text-util";
import { Menu } from "primereact/menu";
import '../../assets/css/points.css'
import { RadioButton } from "primereact/radiobutton";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Checkbox, CheckboxChangeEvent } from "primereact/checkbox";
import { ChangedEventArgs, DatePickerComponent } from "@syncfusion/ej2-react-calendars";
import AllPointsTable from "./components/all-points-table";
import SpecifiedPointsTable from "./components/specified-points-table";
import {
  BriefClientResponse,
  PointSummaryResponse,
  TBriefClientFilter,
  TPointSummaryFilter,
  TSinglePointSummaryFilter
} from "../../types/models";
import { useApi } from "../../providers/api-provider";
import { serverDateTime } from "../../utils/date-util";
import ClientList from "./components/client-list";
import { useToast } from "../../providers/toast-provider";
import { useSearchBox } from "../../providers/search-box-provider";
import { InputText } from "primereact/inputtext";
import { ButtonComponent, CheckBoxComponent, RadioButtonComponent } from "@syncfusion/ej2-react-buttons";
import { Order, TItem, initialAllFilter, initialClientStatusItems, initialItems } from "./values";
const PointsReport: FC = () => {
  const { words } = useLang()
  const [items, setItems] = useState(initialItems)
  const { show } = useToast()
  const [clientSearch, setClientSearch] = useState('')
  const [allClientsStatus, setAllClientsStatus] = useState(initialClientStatusItems)
  const [specifiedClientsStatus, setSpecifiedClientsStatus] = useState(initialClientStatusItems)
  const [isFilterDate, setIsFilterDate] = useState(false)
  const [allFilter, setAllFilter] = useState<TPointSummaryFilter>(initialAllFilter)
  const [singleFilter, setSingleFilter] = useState<TSinglePointSummaryFilter>({})
  const [clientFilter, setClientFilter] = useState<TBriefClientFilter>({})
  const [fetchedPoints, setFetchedPoints] = useState<boolean>(false)
  const [fetchedClients, setFetchedClients] = useState<boolean>(false)
  const [points, setPoints] = useState<PointSummaryResponse[]>([])
  const [specifiedPoints, setSpecifiedPoints] = useState<PointSummaryResponse[]>([])
  const [renderSpecifiedPoints, setRenderSpecifiedPoints] = useState<PointSummaryResponse[]>([])
  const [clients, setClients] = useState<BriefClientResponse[]>([])
  const { hide, show: showSearchBox, replace } = useSearchBox()
  const [renderClients, setRenderClients] = useState<(BriefClientResponse &
  { selected?: boolean })[]>([])
  const [filterRenderClients, setFilterRenderClients] = useState<(BriefClientResponse &
  { selected?: boolean })[]>([])
  const [isAllMaxRemainingMoths, setIsAllMaxRemainingMonths] = useState<boolean>(false)
  const [isSpecifiedMaxRemainingMoths, setIsSpecifiedMaxRemainingMonths] = useState<boolean>(false)
  const { point, posClient } = useApi()
  const [currentStartDate, setCurrentStartDate] = useState<Date>()
  const [currentEndDate, setCurrentEndDate] = useState<Date>()
  const [currentStartDate2, setCurrentStartDate2] = useState<Date>()
  const [currentEndDate2, setCurrentEndDate2] = useState<Date>()
  const [showSelectedClientsOnly, setShowSelectedClientsOnly] = useState(false)
  const [totalAllData, setTotalAllData] = useState(0)
  const [fetching, setFetching] = useState(false)
  const [singleFetching, setSingleFetching] = useState(false)
  const [openList, setOpenList] = useState(false)
  const [clientListPage, setClientListPage] = useState<number>(1)
  const [allMaxRemainingMonths, setAllMaxRemainingMonths] = useState<number>(0)
  const [specifiedMaxRemainingMonths, setSpecifiedMaxRemainingMonths] = useState<number>(0)
  const [mostRemaining, setMostRemaining] = useState(0)
  const [leastRemaining, setLeastRemaining] = useState(0)
  const [isMostRemaining, setIsMostRemaining] = useState(false)
  const [isLeastRemaining, setIsLeastRemaining] = useState(false)
  const allMaxRemainingMonthsInput = useRef<HTMLInputElement | null>(null)
  const specifiedMaxRemainingMonthsInput = useRef<HTMLInputElement | null>(null)
  const mostRemainingInput = useRef<HTMLInputElement | null>(null)
  const leastRemainingInput = useRef<HTMLInputElement | null>(null)
  const [order, setOrder] = useState<Order>({ field: 'name', 'dir': 'none' })
  const pointsSummaryFilter = point.usePointsSummary({
    onSuccess(res) {
      setFetching(false)
      setFetchedPoints(true)
      setPoints(_ => res.data)
      setTotalAllData(_ => res.totalRecords)
    },
    onError(e) {
      setFetching(false)
      show({
        summary: firstUpper(words["error"]),
        detail: e,
        life: 5000
      })
    }
  })
  const briefClientsFilter = posClient.useBriefFilterPosClients({
    onSuccess(res) {
      setFetchedClients(true)
      setClients(_ => res.data)
      setRenderClients(_ => res.data)
      setFilterRenderClients(_ => res.data)
    },
    onError: e => show({
      summary: firstUpper(words["error"]),
      detail: e,
      life: 5000
    })
  })
  const getSinglePointSummary = point.useSinglePointSummary({
    onSuccess(res) {
      setSingleFetching(false)
      setSpecifiedPoints(p => [...p, res])
      setRenderSpecifiedPoints(p => [...p, res].filter(v => {
        let valid1 = !isMostRemaining || mostRemaining >= v.point.remainPoints
        let valid2 = !isLeastRemaining || leastRemaining <= v.point.remainPoints
        return valid1 && valid2
      }))
    },
    onError(e) {
      setSingleFetching(false)
      show({
        detail: e,
        summary: firstUpper(words["error"]),
        life: 5000
      })
    }
  })
  const allStatus = () =>
    allClientsStatus.map(v =>
    ({
      ...v,
      label: firstUpper(words[v.id])
    }))
  const specifiedStatus = () =>
    specifiedClientsStatus.map(v =>
    ({
      ...v,
      label: firstUpper(words[v.id])
    }))
  const dateCheckbox = useRef<CheckBoxComponent>(null)
  const itemClick = (v: TItem) => {
    if (v.id == 'all-clients') setIsSpecifiedMaxRemainingMonths(false)
    else setIsAllMaxRemainingMonths(false)
    if (v.selected) return;
    setItems(p =>
      p.map((d): TItem =>
      ({
        ...d,
        selected: d.id === v.id
      })))
    if (v.id === 'specific-clients' && !fetchedClients) briefClientsFilter(clientFilter)
  }
  const onMonthCheck = (checked: boolean, v: TItem) => {
    console.log(v.id);
    console.log(checked)
    if (v.id === 'all-clients') setIsAllMaxRemainingMonths(checked)
    else setIsSpecifiedMaxRemainingMonths(checked)
    if (checked) {
      return setTimeout(() => {
        if (v.id === 'all-clients') {
          allMaxRemainingMonthsInput.current?.focus()
          allMaxRemainingMonthsInput.current?.select()
          return
        }
        specifiedMaxRemainingMonthsInput.current?.focus()
        specifiedMaxRemainingMonthsInput.current?.select()
      }, 10)
    }
    if (v.id === 'specific-clients') {
      setFilterRenderClients(renderClients)
    }
  }
  const onAllItemFilterModeChange = (e: DropdownChangeEvent) => {
    setAllClientsStatus(p =>
      p.map(d =>
      ({
        ...d,
        selected: d.value === e.value
      })))
    setAllFilter(p => {
      const temp = ({
        ...p,
        clientStatus: allClientsStatus.find(s => s.value === e.value)?.id as string
      })
      return temp
    })
  }
  const specItemFilterModeChange = (e: DropdownChangeEvent) => {
    setSpecifiedClientsStatus(p =>
      p.map(d =>
      ({
        ...d,
        selected: d.value === e.value
      })))
    setClientFilter(p =>
    ({
      ...p,
      status: specifiedClientsStatus.find(v => v.value === e.value)?.id as string
    }))
  }
  const clItems = (): MenuItem[] => {
    const allItem = items[0]
    const specItem = items[1]
    return [
      {
        ...allItem,
        label: firstUpper(words[allItem.id.split('-').join(' ')]),
        style: { whiteSpace: 'nowrap' },
        template: () =>
          <div
            className={`client-item${allItem.selected ?
              " selected" : ""}`}
            onClick={() => itemClick(allItem)} >
            <div
              className="filter-mode-section">
              <RadioButtonComponent
                checked={allItem.selected}
                value='all-clients'
                id="all-clients"
                name="clients-option"
                label={firstUpper(words[allItem.id.split('-').join(' ')])}
              />

            </div>
            <div
              style={{
                display: 'flex',
                flex: 1,
                maxWidth: 405,
                gap: 10,
                justifyContent: 'space-between'
              }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 4,
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                <div
                  style={{
                    display: 'flex',
                    gap: 10,
                    alignItems: 'center'
                  }}>

                  <CheckBoxComponent
                    label={firstUpper(words['max remaining months'])}
                    id="max-remaining-months"
                    // disabled={!items.find(itm => itm.id == v.id)?.selected}
                    disabled={!allItem.selected}
                    change={e => onMonthCheck(e.checked ?? false, allItem)}
                  />
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <InputText
                    ref={allMaxRemainingMonthsInput}
                    defaultValue={0}
                    type="number"
                    min={0}
                    onKeyDown={e => {
                      if (e.key.toLowerCase() !== 'enter') return;
                      onFilter()
                      // if (v.id === 'all-clients') return onFilter()
                      // setFilterRenderClients(renderClients.filter(c => {
                      //   const dt = new Date(c.expiry)
                      //   const now = new Date()
                      //   const temp = new Date(now.getFullYear(),
                      //     now.getMonth() + specifiedMaxRemainingMonths,
                      //     now.getDate())
                      //   return temp >= new Date(dt.getFullYear(),
                      //     dt.getMonth(),
                      //     dt.getDate());
                      // }))
                    }}
                    onChange={e =>
                      // v.id === 'all-clients' ?
                      setAllMaxRemainingMonths(Number(e.target.value))
                      // :setSpecifiedMaxRemainingMonths(Number(e.target.value))
                    }
                    style={{ maxWidth: 100, maxHeight: 30 }}
                    disabled={
                      // v.id === 'all-clients' ?
                      !isAllMaxRemainingMoths
                      // : !isSpecifiedMaxRemainingMoths
                    } />
                  <ButtonComponent
                    cssClass="e-small e-round e-info"
                    disabled={
                      // v.id === 'all-clients' ?
                      !isAllMaxRemainingMoths
                      // : !isSpecifiedMaxRemainingMoths
                    }
                    onClick={() => {
                      // if (v.id === 'all-clients')
                      return onFilter()
                      // setFilterRenderClients(renderClients.filter(c => {
                      //   const dt = new Date(c.expiry)
                      //   const now = new Date()
                      //   const temp = new Date(now.getFullYear(),
                      //     now.getMonth() + specifiedMaxRemainingMonths,
                      //     now.getDate())
                      //   return temp >= new Date(dt.getFullYear(),
                      //     dt.getMonth(),
                      //     dt.getDate());
                      // }))
                    }}
                    iconCss="e-icons e-check" />
                </div>
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}>
                <label style={{ fontSize: 12 }}>
                  {firstUpper(words["status"])}
                </label>
                <Dropdown
                  className="filter-mode-dropdown"
                  style={{ maxHeight: 30, fontSize: '12px' }}
                  id={`${String(allItem.id)}-dropdown`}
                  options={
                    // v.id === 'all-clients' ?
                    allStatus()
                    //  : specifiedStatus()
                  }
                  value={
                    // v.id === 'all-clients' ?
                    allStatus().find(v => v.selected)?.value
                    // :specifiedStatus().find(v => v.selected)?.value
                  }
                  onChange={onAllItemFilterModeChange} />
              </div>
            </div>
          </div >
      },
      {
        ...specItem,
        label: firstUpper(words[specItem.id.split('-').join(' ')]),
        style: { whiteSpace: 'nowrap' },
        template: () =>
          <div
            className={`client-item${specItem.selected ?
              " selected" : ""}`}
            onClick={() => itemClick(specItem)} >
            <div
              className="filter-mode-section">
              <RadioButtonComponent
                checked={specItem.selected}
                value='all-clients'
                id="all-clients"
                name="clients-option"
                label={firstUpper(words[specItem.id.split('-').join(' ')])}
              />
            </div>
            <div
              style={{
                display: 'flex',
                flex: 1,
                maxWidth: 405,
                gap: 10,
                justifyContent: 'space-between'
              }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 4,
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                <div
                  style={{
                    display: 'flex',
                    gap: 10,
                    alignItems: 'center'
                  }}>

                  <CheckBoxComponent
                    label={firstUpper(words['max remaining months'])}
                    id="max-remaining-months"
                    // disabled={!items.find(itm => itm.id == v.id)?.selected}
                    disabled={!specItem.selected}
                    change={e => onMonthCheck(e.checked ?? false, specItem)}
                  />
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <InputText
                    ref={allMaxRemainingMonthsInput}
                    defaultValue={0}
                    type="number"
                    min={0}
                    onKeyDown={e => {
                      if (e.key.toLowerCase() !== 'enter') return;
                      // onFilter()
                      // if (v.id === 'all-clients') return onFilter()
                      setFilterRenderClients(renderClients.filter(c => {
                        const dt = new Date(c.expiry)
                        const now = new Date()
                        const temp = new Date(now.getFullYear(),
                          now.getMonth() + specifiedMaxRemainingMonths,
                          now.getDate())
                        return temp >= new Date(dt.getFullYear(),
                          dt.getMonth(),
                          dt.getDate());
                      }))
                    }}
                    onChange={e =>
                      // v.id === 'all-clients' ?
                      // setAllMaxRemainingMonths(Number(e.target.value))
                      // :
                      setSpecifiedMaxRemainingMonths(Number(e.target.value))
                    }
                    style={{ maxWidth: 100, maxHeight: 30 }}
                    disabled={
                      // v.id === 'all-clients' ?
                      // !isAllMaxRemainingMoths
                      // :
                      !isSpecifiedMaxRemainingMoths
                    } />
                  <ButtonComponent
                    cssClass="e-small e-round e-info"
                    disabled={
                      // v.id === 'all-clients' ?
                      // !isAllMaxRemainingMoths
                      // :
                      !isSpecifiedMaxRemainingMoths
                    }
                    onClick={() => {
                      // if (v.id === 'all-clients')
                      // return onFilter()
                      setFilterRenderClients(renderClients.filter(c => {
                        const dt = new Date(c.expiry)
                        const now = new Date()
                        const temp = new Date(now.getFullYear(),
                          now.getMonth() + specifiedMaxRemainingMonths,
                          now.getDate())
                        return temp >= new Date(dt.getFullYear(),
                          dt.getMonth(),
                          dt.getDate());
                      }))
                    }}
                    iconCss="e-icons e-check" />
                </div>
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}>
                <label style={{ fontSize: 12 }}>
                  {firstUpper(words["status"])}
                </label>
                <Dropdown
                  className="filter-mode-dropdown"
                  style={{ maxHeight: 30, fontSize: '12px' }}
                  id={`${String(specItem.id)}-dropdown`}
                  options={
                    // v.id === 'all-clients' ?
                    // allStatus()
                    //  :
                    specifiedStatus()
                  }
                  value={
                    // v.id === 'all-clients' ?
                    // allStatus().find(v => v.selected)?.value
                    // :
                    specifiedStatus().find(v => v.selected)?.value
                  }
                  onChange={specItemFilterModeChange} />
              </div>
            </div>
          </div >
      }

    ];
  }
  const clientItems = () =>
    items.map(function (v): MenuItem {
      const onFilterModeChange = (e: DropdownChangeEvent) => {
        if (v.id === 'all-clients') {
          setAllClientsStatus(p =>
            p.map(d =>
            ({
              ...d,
              selected: d.value === e.value
            })))
          setAllFilter(p => {
            const temp = ({
              ...p,
              clientStatus: allClientsStatus.find(s => s.value === e.value)?.id as string
            })
            return temp
          })
          return
        }
        setSpecifiedClientsStatus(p =>
          p.map(d =>
          ({
            ...d,
            selected: d.value === e.value
          })))
        setClientFilter(p =>
        ({
          ...p,
          status: specifiedClientsStatus.find(v => v.value === e.value)?.id as string
        }))
      }
      return ({
        ...v,
        id: v.id as string,
        label: firstUpper(words[v.id.toString().split('-').join(' ')]),
        style: { whiteSpace: 'nowrap' },
        template: () =>
          <div
            className={`client-item${v.selected ?
              " selected" : ""}`}
            onClick={() => itemClick(v)} >
            <div
              className="filter-mode-section">
              <RadioButtonComponent
                checked={v.selected}
                value='all-clients'
                id="all-clients"
                name="clients-option"
                label={firstUpper(words[v.id.toString().split('-').join(' ')])}
              />
              {/* <RadioButton
                checked={v.selected}
                value='all-clients'
                id="all-clients"
                name="clients-option" />
              <label
                className="filter-mode-label">
                {firstUpper(words[v.id.toString().split('-').join(' ')])}
              </label> */}
            </div>
            <div
              style={{
                display: 'flex',
                flex: 1,
                maxWidth: 405,
                gap: 10,
                justifyContent: 'space-between'
              }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 4,
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                <div
                  style={{
                    display: 'flex',
                    gap: 10,
                    alignItems: 'center'
                  }}>
                  {/* <Checkbox
                    id="max-remaining-months"
                    checked={v.id === 'all-clients' ?
                      isAllMaxRemainingMoths : isSpecifiedMaxRemainingMoths}
                    disabled={!items.find(itm => itm.id == v.id)?.selected}
                    onChange={e => onMonthCheck(e.checked ?? false, v)} />
                  <label
                    style={{ whiteSpace: 'nowrap', fontSize: 12, cursor: 'pointer' }}
                    onClick={() => {
                      if (items.find(itm => itm.id == v.id)?.selected) {
                        if (v.id == 'all-clients') {
                          onMonthCheck(!isAllMaxRemainingMoths, v)
                          return
                        }
                        onMonthCheck(!isSpecifiedMaxRemainingMoths, v)
                      }
                    }}>
                    {firstUpper(words["max remaining months"])}
                  </label> */}
                  <CheckBoxComponent
                    label={firstUpper(words['max remaining months'])}
                    id="max-remaining-months"
                    // checked={v.id === 'all-clients' ? isAllMaxRemainingMoths : isSpecifiedMaxRemainingMoths}
                    disabled={!items.find(itm => itm.id == v.id)?.selected}
                    change={e => onMonthCheck(e.checked ?? false, v)}
                  // onChange={(e: any) => {
                  //   onMonthCheck(e.target.checked ?? false, v)
                  // }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <InputText
                    ref={v.id === 'all-clients' ?
                      allMaxRemainingMonthsInput : specifiedMaxRemainingMonthsInput}
                    defaultValue={0}
                    type="number"
                    min={0}
                    onKeyDown={e => {
                      if (e.key.toLowerCase() !== 'enter') return;
                      if (v.id === 'all-clients') return onFilter()
                      setFilterRenderClients(renderClients.filter(c => {
                        const dt = new Date(c.expiry)
                        const now = new Date()
                        const temp = new Date(now.getFullYear(),
                          now.getMonth() + specifiedMaxRemainingMonths,
                          now.getDate())
                        return temp >= new Date(dt.getFullYear(),
                          dt.getMonth(),
                          dt.getDate());
                      }))
                    }}
                    onChange={e => v.id === 'all-clients' ?
                      setAllMaxRemainingMonths(Number(e.target.value)) :
                      setSpecifiedMaxRemainingMonths(Number(e.target.value))}
                    style={{ maxWidth: 100, maxHeight: 30 }}
                    disabled={v.id === 'all-clients' ?
                      !isAllMaxRemainingMoths : !isSpecifiedMaxRemainingMoths} />
                  <ButtonComponent
                    cssClass="e-small e-round e-info"
                    disabled={v.id === 'all-clients' ?
                      !isAllMaxRemainingMoths : !isSpecifiedMaxRemainingMoths}
                    onClick={() => {
                      if (v.id === 'all-clients') return onFilter()
                      setFilterRenderClients(renderClients.filter(c => {
                        const dt = new Date(c.expiry)
                        const now = new Date()
                        const temp = new Date(now.getFullYear(),
                          now.getMonth() + specifiedMaxRemainingMonths,
                          now.getDate())
                        return temp >= new Date(dt.getFullYear(),
                          dt.getMonth(),
                          dt.getDate());
                      }))
                    }}
                    iconCss="e-icons e-check" />
                </div>
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}>
                <label style={{ fontSize: 12 }}>
                  {firstUpper(words["status"])}
                </label>
                <Dropdown
                  className="filter-mode-dropdown"
                  style={{ maxHeight: 30, fontSize: '12px' }}
                  id={`${String(v.id)}-dropdown`}
                  options={v.id === 'all-clients' ?
                    allStatus() : specifiedStatus()}
                  value={v.id === 'all-clients' ?
                    allStatus().find(v => v.selected)?.value :
                    specifiedStatus().find(v => v.selected)?.value}
                  onChange={onFilterModeChange} />
              </div>
            </div>
          </div >
      })
    })
  const specifiedSummaryPointsFilter = point.usePointsSummary({
    onSuccess: res => {
      setSpecifiedPoints(res.data)
      setRenderSpecifiedPoints(res.data.filter(d => {
        let valid1 = !isMostRemaining || mostRemaining >= d.point.remainPoints
        let valid2 = !isLeastRemaining || leastRemaining <= d.point.remainPoints
        return valid1 && valid2
      }))
    },
    onError: e => show({
      detail: e,
      summary: 'Error',
      life: 5000
    })
  })
  const onAllPointsSort = (order: Order) => {
    if (order.dir === 'none') return setAllFilter(f => ({ ...f, order: undefined }))
    setAllFilter(f => ({
      ...f,
      order: {
        field: order.field,
        isDesc: order.dir === 'desc'
      }
    }))
  }
  const onSearch = (v: string) => {
    const res = sortHandle(order)
    const searchHandle = () => {
      if (v && v.trim().length > 0) {
        return res.filter(d =>
          d.number.toLowerCase().includes(v.toLowerCase()) ||
          d.name.toLowerCase().includes(v.toLowerCase()))
      }
      if (showSelectedClientsOnly) {
        if (clientFilter.status && clientFilter.status !== 'all') {
          return res.filter(c => c.selected &&
            c.status.toLowerCase() === clientFilter.status)
        }
        return res.filter(c => c.selected)
      }
      if (clientFilter.status && clientFilter.status !== 'all') {
        return res.filter(c =>
          c.status.toLowerCase() === clientFilter.status)
      }
      return res
    }
    setFilterRenderClients(searchHandle())
    setClientSearch(v)
  }
  const sortHandle = (order: Order) => {
    const k = order.field
    const d = order.dir
    const res = [...filterRenderClients]
    if (k === 'name') {
      if (d === 'none') return [...renderClients]
      if (d === 'asc') return res.sort((a, b) =>
        a.name.toLowerCase() === b.name.toLowerCase() ?
          0 : a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1)
      return res.sort((a, b) =>
        a.name.toLowerCase() === b.name.toLowerCase() ?
          0 : a.name.toLowerCase() < b.name.toLowerCase() ? 1 : -1)
    }
    if (k === 'status') {
      if (d === 'none') return [...renderClients]
      if (d === 'asc') return res.sort((a, b) =>
        a.status.toLowerCase() === b.status.toLowerCase() ?
          0 : a.status.toLowerCase() > b.status.toLowerCase() ? 1 : -1)
      return res.sort((a, b) =>
        a.status.toLowerCase() === b.status.toLowerCase() ?
          0 : a.status.toLowerCase() < b.status.toLowerCase() ? 1 : -1)
    }
    if (d === 'none') return [...renderClients]
    if (d === 'asc') return res.sort((a, b) =>
      a.number.toLowerCase() === b.number.toLowerCase() ?
        0 : a.number.toLowerCase() > b.number.toLowerCase() ? 1 : -1)
    return res.sort((a, b) =>
      a.number.toLowerCase() === b.number.toLowerCase() ?
        0 : a.number.toLowerCase() < b.number.toLowerCase() ? 1 : -1)
  }
  const onSort = (k: 'number' | 'name' | 'status', d: 'none' | 'desc' | 'asc') => {
    setOrder({ field: k, dir: d })
    setFilterRenderClients(sortHandle({ field: k, dir: d }))
  }
  const onChange = (d: BriefClientResponse & {
    selected?: boolean
  }) => {
    setRenderClients(p => {
      const cp = [...p]
      for (let i = 0; i < cp.length; i++)if (cp[i].oid === d.oid) cp[i] = d;
      return cp;
    })
    setFilterRenderClients(p => {
      const cp = [...p]
      for (let i = 0; i < cp.length; i++)if (cp[i].oid === d.oid) cp[i] = d;
      return cp;
    })
    if (d.selected) {
      return getSinglePointSummary({
        clientOid: d.oid.endsWith('temp-0') ?
          d.oid.replace('temp-0', '') : d.oid.endsWith('temp-1') ?
            d.oid.replace('temp-1', '') : d.oid,
        startDate: singleFilter.startDate,
        endDate: singleFilter.endDate
      })
    }
    setSpecifiedPoints(p => p.filter(v => v.client.oid !== d.oid))
    setRenderSpecifiedPoints(p => p.filter(v => v.client.oid !== d.oid))
  }
  const onDateFilterChange = (e: any) => {
    if (e.target.checked) return setIsFilterDate(true)
    setIsFilterDate(false)
    setCurrentStartDate(_ => undefined)
    setCurrentEndDate(_ => undefined)
    setCurrentStartDate2(_ => undefined)
    setCurrentEndDate2(_ => undefined)
  }
  const onStartDateChange = (e: ChangedEventArgs) => {
    if (items.find(v => v.selected)?.id === 'all-clients') {
      return setCurrentStartDate(_ => e.value)
    }
    setCurrentStartDate2(_ => e.value)
  }
  const onEndDateChange = (e: ChangedEventArgs) => {
    if (items.find(v => v.selected)?.id === 'all-clients') {
      return setCurrentEndDate(_ => e.value)
    }
    setCurrentEndDate2(_ => e.value)
  }
  const onFilter = () => {
    if (items.find(v => v.selected)?.id === 'all-clients') {
      let f: TPointSummaryFilter = { ...allFilter }
      if (isFilterDate) {
        f.startDate = currentStartDate
        f.endDate = currentEndDate
      } else {
        f.startDate = undefined
        f.endDate = undefined
      }
      f.mostRemain = isMostRemaining ? mostRemaining : undefined
      f.leastRemain = isLeastRemaining ? leastRemaining : undefined
      f.maxRemainingMonths = isAllMaxRemainingMoths ? allMaxRemainingMonths : undefined
      return setAllFilter(f)
    }
    let sf: TSinglePointSummaryFilter = { ...singleFilter }
    if (isFilterDate) {
      sf.startDate = currentStartDate2
      sf.endDate = currentEndDate2
    }
    else {
      sf.startDate = undefined
      sf.endDate = undefined
    }
    return setSingleFilter(sf)
  }
  const onTake = (n: number) =>
    setAllFilter(p =>
    ({
      ...p,
      page: 1,
      take: n
    }))
  const onPage = (n: number) =>
    setAllFilter(p =>
    ({
      ...p,
      page: n
    }))
  const toggleList = () => setOpenList(p => !p)
  useEffect(() => {
    setFilterRenderClients(_ => {
      if (showSelectedClientsOnly) {
        if (clientFilter.status &&
          clientFilter.status !== 'all') {
          return renderClients.filter(c => c.selected &&
            c.status.toLowerCase() === clientFilter.status &&
            c.name.toLowerCase().includes(clientSearch.toLowerCase()))
        }
        return renderClients.filter(c => c.selected &&
          c.name.toLowerCase().includes(clientSearch.toLowerCase()))
      }
      if (clientFilter.status && clientFilter.status !== 'all') {
        return renderClients.filter(c =>
          c.status.toLowerCase() === clientFilter.status &&
          c.name.toLowerCase().includes(clientSearch.toLowerCase()))
      }
      return renderClients.filter(c =>
        c.name.toLowerCase().includes(clientSearch.toLowerCase()))
    })
    setFilterRenderClients(_ => clientFilter.status === 'all' ?
      (showSelectedClientsOnly ?
        renderClients.filter(v => v.selected) :
        [...renderClients]) : renderClients.filter(v => {
          let res = v.status.toLowerCase() === clientFilter.status
          if (showSelectedClientsOnly) res = res &&
            (v.selected ?? false)
          return res
        }))
  }, [clientFilter])
  useEffect(() => {
    setFetching(true)
    pointsSummaryFilter(allFilter)
  }, [allFilter])
  useEffect(() => {
    if (points.length > 0 || fetchedPoints) return;
    pointsSummaryFilter({
      ...allFilter,
      startDate: allFilter.startDate ?
        serverDateTime(allFilter.startDate) : undefined,
      endDate: allFilter.endDate ?
        serverDateTime(allFilter.endDate) : undefined
    })
  }, [points, fetchedPoints])
  useEffect(() => {
    setFilterRenderClients(_ => {
      if (showSelectedClientsOnly) {
        if (clientFilter.status && clientFilter.status !== 'all') {
          return renderClients.filter(c => c.selected &&
            c.status.toLowerCase() === clientFilter.status
            && c.name.toLowerCase().includes(clientSearch.toLowerCase()))
        }
        return renderClients.filter(c => c.selected &&
          c.name.toLowerCase().includes(clientSearch.toLowerCase()))
      }
      if (clientFilter.status && clientFilter.status !== 'all') {
        return renderClients.filter(c =>
          c.status.toLowerCase() === clientFilter.status &&
          c.name.toLowerCase().includes(clientSearch.toLowerCase()))
      }
      return renderClients.filter(c =>
        c.name.toLowerCase().includes(clientSearch.toLowerCase()))
    })
  }, [showSelectedClientsOnly])
  useEffect(() => {
    if (specifiedPoints.length < 1) return;
    specifiedSummaryPointsFilter({
      ofClientOids: {
        field: 'oid',
        values: renderClients.filter(c => c.selected).map(c => c.oid)
      },
      startDate: singleFilter.startDate,
      endDate: singleFilter.endDate
    })
  }, [singleFilter])
  const clean = () => {
    showSearchBox()
    replace('')
  }
  useEffect(() => {
    hide()
    replace(words['points report'])
    // setOpenList(true)
    return clean
  }, [])
  const [toggleClass, setToggleClass] = useState('e-small e-round e-flat btn-toggle-list closed')
  useEffect(() => {
    if (openList) return setToggleClass('e-small e-round e-flat btn-toggle-list')
    setToggleClass('e-small e-round e-flat btn-toggle-list closed')
  }, [openList])
  // const toggleBtnClass = () => {
  //   const openClose = openList ? '' : 'closed';
  //   return `e-small e-round e-flat btn-toggle-list ${openClose}`
  // }
  return <BasePage hideTitle>
    <div className="points-report">
      <div className={`client-panel ${openList ? '' : 'closed'}`}>
        <Menu
          className="client-items-menu"
          model={clItems()} />
        <div
          className={`report-client-list${items.find(v =>
            v.selected)?.id === 'all-clients' ? '' : ' open'}`}>
          <ClientList
            data={filterRenderClients}
            page={clientListPage}
            showOnlySelected={showSelectedClientsOnly}
            onToggleSelected={e =>
              setShowSelectedClientsOnly(_ => e.checked ?? false)}
            onSearch={onSearch}
            onSort={onSort}
            onChange={onChange} />
          <div
            className="cl-navigate-group">
            <ButtonComponent
              cssClass="e-round e-primary e-small"
              iconCss="pi pi-angle-double-left"
              disabled={clientListPage < 2}
              onClick={() => setClientListPage(1)} />
            <ButtonComponent
              cssClass="e-round e-primary e-small"
              iconCss="pi pi-angle-left"
              disabled={clientListPage < 2}
              onClick={() => {
                if (clientListPage < 2) return;
                setClientListPage(p => p - 1)
              }} />
            <ButtonComponent
              cssClass="e-round e-primary e-small"
              iconCss="pi pi-angle-right"
              disabled={clientListPage >= Math.ceil(clients.length / 20)}
              onClick={() => {
                if (clientListPage >= Math.ceil(clients.length / 20)) return;
                setClientListPage(p => p + 1)
              }} />
            <ButtonComponent
              cssClass="e-round e-primary e-small"
              iconCss="pi pi-angle-double-right"
              disabled={clientListPage >= Math.ceil(clients.length / 20)}
              onClick={() => {
                if (clientListPage >= Math.ceil(clients.length / 20)) return;
                setClientListPage(Math.ceil(clients.length / 20))
              }} />
          </div>
        </div>
        <div
          className={`report-client-list-placeholder${items.find(v =>
            v.selected)?.id === 'all-clients' ? '' : ' open'}`}>
          <i className="pi pi-users" />
          <span>
            {firstUpper(words["all clients"])}
          </span>
        </div>
      </div>
      <div
        className="points-table-part">
        <div
          className="points-table-part-section">
          <ButtonComponent
            cssClass={toggleClass}
            iconCss="e-icons e-arrow-left"
            onClick={toggleList}
          />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              flex: 1,
              gap: 10
            }}>
            <div
              className="points-table-part-item"
              style={{ flex: 1 }}>
              <div
                className="points-table-part-subitem">
                <CheckBoxComponent
                  id="date-filter"
                  checked={isFilterDate}
                  ref={dateCheckbox}
                  onChange={onDateFilterChange}
                  label={firstUpper(words['date'])} />
                {/* <Checkbox
                  defaultChecked={false}
                  id="date-filter"
                  checked={isFilterDate}
                  ref={dateCheckbox}
                  onChange={onDateFilterChange} />
                <label
                  style={{ whiteSpace: 'nowrap', fontSize: 12 }}>
                  {firstUpper(words['date'])}
                </label> */}
              </div>
              <div
                className="points-table-part-subitem-2">
                <DatePickerComponent
                  change={onStartDateChange}
                  value={items.find(v => v.selected)?.id === 'all-clients' ?
                    allFilter.startDate : singleFilter.startDate}
                  enabled={isFilterDate}
                  placeholder={firstUpper(words['from_d'])} />
                <DatePickerComponent
                  enabled={isFilterDate}
                  value={items.find(v => v.selected)?.id === 'all-clients' ?
                    allFilter.endDate : singleFilter.endDate}
                  change={onEndDateChange}
                  placeholder={firstUpper(words['to_d'])} />
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 10,
                flex: 1,
              }}>
              <label style={{ fontSize: 12 }}>
                {capitalize(words['remain points'])}
              </label>
              <div
                style={{
                  display: 'flex',
                  gap: 6,
                  alignItems: 'center'
                }}>
                {/* <Checkbox
                  id="most-remaining-points"
                  checked={isMostRemaining}
                  onChange={e => {
                    setIsMostRemaining(e.target.checked ?? false)
                    if (!e.checked) return;
                    setTimeout(() => {
                      mostRemainingInput.current?.focus()
                      mostRemainingInput.current?.select()
                    }, 10);
                  }}
                />
                <label
                  style={{ whiteSpace: 'nowrap', fontSize: 12 }}>
                  {firstUpper(words['most'])}
                </label> */}
                <CheckBoxComponent
                  id="most-remaining-points"
                  checked={isMostRemaining}
                  onChange={(e: any) => {
                    setIsMostRemaining(e.target.checked ?? false)
                    if (!e.target.checked) return;
                    setTimeout(() => {
                      mostRemainingInput.current?.focus()
                      mostRemainingInput.current?.select()
                    }, 10);
                  }}
                  label={firstUpper(words['most'])}
                />
                <InputText
                  defaultValue={0}
                  min={0}
                  ref={mostRemainingInput}
                  onChange={e => setMostRemaining(Number(e.target.value))}
                  type="number"
                  disabled={!isMostRemaining}
                  style={{ maxWidth: 60, padding: 6, fontSize: 14 }}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: 6,
                  alignItems: 'center'
                }}>
                {/* <Checkbox
                  id="remaining-points"
                  checked={isLeastRemaining}
                  onChange={e => {
                    setIsLeastRemaining(e.target.checked ?? false)
                    if (!e.checked) return;
                    setTimeout(() => {
                      leastRemainingInput.current?.focus()
                      leastRemainingInput.current?.select()
                    }, 10)
                  }}
                />
                <label
                  style={{ whiteSpace: 'nowrap', fontSize: 12 }}>
                  {firstUpper(words['least'])}
                </label> */}
                <CheckBoxComponent
                  id="remaining-points"
                  checked={isLeastRemaining}
                  onChange={(e: any) => {
                    setIsLeastRemaining(e.target.checked ?? false)
                    if (!e.target.checked) return;
                    setTimeout(() => {
                      leastRemainingInput.current?.focus()
                      leastRemainingInput.current?.select()
                    }, 10)
                  }}
                  label={firstUpper(words['least'])}
                />
                <InputText
                  defaultValue={0}
                  min={0}
                  onChange={e => setLeastRemaining(Number(e.target.value))}
                  ref={leastRemainingInput}
                  disabled={!isLeastRemaining}
                  type="number"
                  style={{ maxWidth: 60, padding: 6, fontSize: 14 }}
                />
              </div>
            </div>
          </div>
          <ButtonComponent
            cssClass="btn-date-filter e-round e-small e-info"
            iconCss="pi pi-check"
            onClick={onFilter}
          />
        </div>
        <div
          className={`client-points-table ${openList ? '' : 'closed'}`}>
          {items.find(v => v.selected)?.id === 'all-clients' ?
            <AllPointsTable
              data={points}
              initializing={!fetchedPoints}
              loading={fetching}
              onSort={onAllPointsSort}
              toDate={currentEndDate}
              onTake={onTake}
              pageSize={allFilter.take}
              total={totalAllData}
              onPage={onPage}
              currentPage={allFilter.page} /> :
            <SpecifiedPointsTable
              data={renderSpecifiedPoints}
              loading={singleFetching} />}
        </div>
      </div>
    </div>
  </BasePage>
}
export default PointsReport