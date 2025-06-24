import {
  FC,
  useEffect,
  useRef,
  useState,
  KeyboardEvent,
  FocusEvent
} from "react";
import {
  ColumnDirective,
  ColumnModel,
  ColumnsDirective,
  ExcelExport,
  GridComponent,
  Inject,
  Resize,
  RowDataBoundEventArgs,
  Toolbar,
} from "@syncfusion/ej2-react-grids";
import { Column as Col } from 'primereact/column'
import { firstUpper, textFromDate, toAnnotateNumber } from "../../../../utils/text-util";
import { useLang } from "../../../../providers/lang-provider";
import '../../../../assets/css/client-points.css'
import { rowsPerPage } from "../../../../constants";
import { Skeleton } from "primereact/skeleton";
import { Button } from "primereact/button";
import { OffSetPointRequest, PointResponse, TPOSClient } from "../../../../types/models";
import { useUser } from "../../../../providers/user-provider";
import { useToast } from "../../../../providers/toast-provider";
import { useApi } from "../../../../providers/api-provider";
import Paginator from "../../../others/paginator";
import { TBaseFilter } from "../../../../types/models/base";
import { DataTable, DataTableValue } from "primereact/datatable";
import { useColumns, useCustomizeCell } from "./values";
import PointDialog from "./point-dialog";
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";

const IndividualClientPoints: FC<{ oid: string, client: TPOSClient }> = ({ oid, client }) => {
  const { lang, words } = useLang()
  const { user } = useUser()
  const { show } = useToast()
  const { point } = useApi()
  const [initializing, setInitializing] = useState(true)
  const [loading, setLoading] = useState(false)
  const [totalRecords, setTotalRecords] = useState(0)
  const [lastPoint, setLastPoint] = useState<any>()
  const [currentAdjustValue, setCurrentAdjustValue] = useState<number>()
  const [showAdjustDialog, setShowAdjustDialog] = useState(false)
  const [offsetPointsRequestError, setOffsetPointsRequestError] = useState({
    point: false, remark: false
  })
  const [addingOffset, setAddingOffset] = useState(false)
  const doneBtnRef = useRef<Button>(null)
  const columns = useColumns()
  const [data, setData] = useState<PointResponse[]>()
  const [offsetPointsInput, setOffsetPointsInput] = useState<{
    clientOid: string
    description?: string
    offSetPoints?: number
    pointType: number
    userLogIn?: string
  }>({
    clientOid: oid,
    description: "",
    offSetPoints: currentAdjustValue,
    pointType: 1,
    userLogIn: user?.username ?? ''
  })
  const pointRef = useRef<HTMLInputElement>(null)
  const remarkRef = useRef<HTMLInputElement>(null)
  const grid = useRef<GridComponent | null>(null)
  const customizeCell = useCustomizeCell(lastPoint, data)
  const pointHistoryAsync = point.usePointsHistory({
    onSuccess(d) {
      setLastPoint(() =>
        d.lastPoint ?
          ({
            ...d.lastPoint,
            timeStamp:
            //  new Date(d.lastPoint.timeStamp).toCustomString(lang, true, {
            //   dateOption: { format: '00', monthMode: 'name', withDayName: false, splitter: ' ' },
            //   timeOption: { format: 'hh mm', mode: '12h', splitter: ':' }
            // }),
            textFromDate(
              new Date(d.lastPoint.timeStamp),
              lang,
              true,
              {
                dateOption: {
                  format: '00',
                  monthMode: 'name',
                  withDayName: false,
                  splitter: ' ',
                },
                timeOption: {
                  format: 'hh mm',
                  mode: '12h',
                  splitter: ':',
                }
              }),
            adjustPoints: toAnnotateNumber(d.lastPoint.adjustPoints),
            current: toAnnotateNumber(d.lastPoint.current),
            total: toAnnotateNumber(d.lastPoint.total),
            amount: toAnnotateNumber(d.lastPoint.amount),
            beginningPoints: toAnnotateNumber(d.lastPoint.beginningPoints),
            earnedPoints: toAnnotateNumber(d.lastPoint.earnedPoints),
            offSetPoints: toAnnotateNumber(d.lastPoint.offSetPoints),
            spentPoints: toAnnotateNumber(d.lastPoint.spentPoints),
            temporaryPoints: toAnnotateNumber(d.lastPoint.temporaryPoints)
          }) : undefined)
      setTotalRecords(_ => d.totalRecords)
      setData(_ => d.data)
      setInitializing(false)
      setLoading(false)
    },
    onError: e => console.log('%c' + e, `color:${e === 'success' ? 'darkgreen' : 'red'}`)
  })
  const rowDataBound = (args: RowDataBoundEventArgs) => args.rowHeight = 34
  const [filter, setFilter] = useState<TBaseFilter<string>>({
    isIn: {
      field: 'Oid',
      values: [oid]
    },
    page: 1,
    take: rowsPerPage[0]
  })
  const filterPointsHistory = () => pointHistoryAsync(filter)
  const offsetPointsAsync = point.useOffsetPoints({
    onSuccess() {
      setAddingOffset(false)
      setShowAdjustDialog(false)
      const lastPage = totalRecords < 1 || !filter.take ?
        1 : Math.ceil(totalRecords / filter.take)
      setFilter(p =>
      ({
        ...p,
        page: lastPage
      }))
      show({
        summary: 'Success',
        detail: "Offset points added",
        severity: 'success',
        life: 5000
      })
    },
    onError: e => show({
      detail: firstUpper(typeof e === 'string' ?
        e : (e.message ?? 'Some thing went wrong!')),
      severity: 'error',
      life: 5000,
    })
  })
  const offsetDoneClick = () => {
    if (!offsetPointsInput.userLogIn) return;
    if (!pointRef.current || !remarkRef.current) return;
    let invalid = false
    const n = Number(pointRef.current.value)
    if (n === 0) {
      setOffsetPointsRequestError(p =>
      ({
        ...p,
        point: true
      }))
      invalid = true
    }
    if (!remarkRef.current.value || remarkRef.current.value.trim().length < 1) {
      setOffsetPointsRequestError(p =>
      ({
        ...p,
        remark: true
      }))
      invalid = true
    }
    if (invalid) return;
    setAddingOffset(true)
    const input: OffSetPointRequest = {
      ...offsetPointsInput,
      userLogIn: offsetPointsInput.userLogIn ?? '',
      offSetPoints: !pointRef.current ?
        1 : Number(pointRef.current.value),
      description: !remarkRef.current ?
        '' : remarkRef.current.value
    }
    offsetPointsAsync(input)
  }
  const goToLastPoint = () => {
    closeAdjustDialog()
    const lastPage = totalRecords < 1 || !filter.take ?
      1 : Math.ceil(totalRecords / filter.take)
    setFilter(p => ({ ...p, page: lastPage }))
  }
  const dataBound = () => grid.current?.hideScroll()
  const openAdjustDialog = () => setShowAdjustDialog(true)
  const closeAdjustDialog = () => setShowAdjustDialog(false)
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
  const onPointChange = () => {
    if (!offsetPointsRequestError.point) return;
    setOffsetPointsRequestError(p => ({
      ...p,
      point: false
    }))
  }
  const onPointKeyEnter = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key.toLowerCase() !== 'enter') return;
    offsetDoneClick()
  }
  const onPointLostFocus = (e: FocusEvent<HTMLInputElement, Element>) => {
    const n = !e.target.value ?
      0 : Number(e.target.value)
    setCurrentAdjustValue(n)
    e.target.value = n.toString()
  }
  const onRemarkKeyEnter = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key.toLowerCase() !== 'enter') return;
    offsetDoneClick()
  }
  const onRemarkChange = () => {
    if (!offsetPointsRequestError.remark) return;
    setOffsetPointsRequestError(p =>
    ({
      ...p,
      remark: false
    }))
  }
  const convertDate = (d: Date) => {
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
  }
  const cModels: ColumnModel[] = columns.map(c => ({
    field: c.field,
    headerText: c.header,
    headerTextAlign: 'Center',
    textAlign: ['receipt-number', 'date', 'user', 'remark'].includes(c.header) ? 'Left' : 'Right',
    width: c.header === 'remark' ? 240 : 150,
  }))
  const today = (forFileName: boolean = false, withTime: boolean = false) => {
    const d = new Date();
    const sep = forFileName ? '-' : '/';
    let res = `${d.getDate()}${sep}${d.getMonth() + 1}${sep}${d.getFullYear()}`
    if (withTime) res += ` ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`
    return res;
  }
  const excelProps: any = {
    dataSource: data?.map(d => ({ ...d, timeStamp: convertDate(new Date(d.timeStamp)) })),
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
              colSpan: columns.length,
              value: `POINT HISTORY REPORT FOR CLIENT NUMBER ${client.number?.toUpperCase()} : ${client.name?.toUpperCase()}`,
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
              colSpan: columns.length,
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
              colSpan: columns.length,
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
            colSpan: 10,
            value: `Total: ${data?.length ?? 0}`,
            style: { bold: true }
          }]
        },
      ]
    },
    fileName: `point-history-client-${client.number}(${today(true, true)}).xlsx`
  }
  const toolbarClick = () => {
    grid.current?.excelExport(excelProps)
  }
  const skeletonItems = Array.from({
    length: filter.take ??
      rowsPerPage[0] ?? 20
  }, (_): DataTableValue => ({}))
  const skeletonBody = () => <Skeleton></Skeleton>
  useEffect(() => filterPointsHistory(), [filter])
  useEffect(() => setOffsetPointsInput(p =>
  ({
    ...p,
    offSetPoints: currentAdjustValue
  })), [currentAdjustValue])
  return <div className="client-points">
    {!initializing &&
      <div className="table-title">
        <span className="point-history-title">
          {words["points history"]}
        </span>
        <ButtonComponent
          cssClass="e-small e-success"
          iconCss="ri-file-excel-fill"
          content={words['export excel']}
          style={{ margin: '6px 0' }}
          onClick={toolbarClick} />
        {(user?.permissions.some(p => p.permissionName.toLowerCase() == 'adjust point') ||
          user?.currentRole?.toLocaleLowerCase() == 'admin') &&
          <ButtonComponent
            disabled={loading}
            iconCss="pi pi-pencil"
            cssClass="btn-adj-point e-small e-outline e-info"
            onClick={openAdjustDialog}
            className="btn-adj-point"
            content={words["adjust point_v"]}
          />}
      </div>}
    {initializing || loading && <DataTable
      size="small"
      style={{
        flex: 1,
        margin: 10
      }}
      value={skeletonItems}
      className="p-datatable-striped">
      {columns.map(c => <Col
        key={c.header}
        field={c.field}
        header={c.header}
        style={{
          width: c.header === 'date' ?
            (lang === 'khmer' ?
              254 : 220) : (['temporary', 'amount', 'remark'].includes(c.header) ?
                (lang === 'khmer' ?
                  150 : 130) :
                (['current', 'earned', 'spent', 'offset', 'total'].includes(c.header) ?
                  120 : 160))
        }}
        body={skeletonBody}></Col>)}
    </DataTable>
    }
    <GridComponent
      ref={grid}
      style={{
        display: initializing || loading ? 'none' : ''
      }}
      excelHeaderQueryCellInfo={args => args.style = {
        borders: { color: '#222222' }
      }}
      excelQueryCellInfo={args => args.style = {
        borders: { color: '#222222' },
      }}
      dataSource={data}
      dataBound={dataBound}
      enableStickyHeader
      allowExcelExport
      rowHeight={28}
      allowResizing
      autoFit
      queryCellInfo={customizeCell}
      enableHover={false}
      rowDataBound={rowDataBound}>
      <ColumnsDirective>
        {columns.map(c =>
          <ColumnDirective
            headerTextAlign='Center'
            textAlign={'remark,user,receipt-number,date'.split(',').includes(c.header) ?
              'Left' : 'Right'}
            key={c.header}
            valueAccessor={c.accessor}
            field={c.field}
            headerText={firstUpper(words[c.header.split('-').join(' ')])}
          />)}
      </ColumnsDirective>
      <Inject services={[Resize, Toolbar, ExcelExport]} />
    </GridComponent>
    {data && data.length > 0 &&
      <Paginator
        page={filter.page ?? 1}
        take={filter.take ?? rowsPerPage[0]}
        total={totalRecords}
        onTake={onTake}
        onPage={onPage} />
    }
    <PointDialog
      addingOffset={addingOffset}
      closeAdjustDialog={closeAdjustDialog}
      currentAdjustValue={currentAdjustValue}
      doneBtnRef={doneBtnRef}
      goToLastPoint={goToLastPoint}
      offsetPointsRequestError={offsetPointsRequestError}
      onPointChange={onPointChange}
      onPointKeyEnter={onPointKeyEnter}
      onPointLostFocus={onPointLostFocus}
      onRemarkChange={onRemarkChange}
      onRemarkKeyEnter={onRemarkKeyEnter}
      pointRef={pointRef}
      remarkRef={remarkRef}
      showAdjustDialog={showAdjustDialog}
      offsetDoneClick={offsetDoneClick} />
  </div>
}
export default IndividualClientPoints