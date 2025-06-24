import { FC, useRef, useState } from "react";
import { PointSummaryResponse } from "../../../types/models";
import {
  Column,
  ColumnDirective,
  ColumnsDirective,
  ExcelExport,
  GridComponent,
  Inject,
  QueryCellInfoEventArgs,
  Resize,
  ColumnModel,
  Toolbar,
} from "@syncfusion/ej2-react-grids";
import { rowsPerPage } from "../../../constants";
import Paginator from "../../others/paginator";
import '../../../assets/css/all-point-table.css'
import { firstUpper, textFromDate, toAnnotateNumber } from "../../../utils/text-util";
import { getValue } from "@syncfusion/ej2-base";
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import { DataTable, DataTableValue } from 'primereact/datatable'
import { Column as Col } from 'primereact/column'
import { Skeleton } from "primereact/skeleton";
import { Dialog } from "primereact/dialog";
import ClientDetails from "../../users/client-list/components/client-details";
import { useLang } from "../../../providers/lang-provider";

type SortIcon = {
  key: 'none' | 'asc' | 'desc',
  icon: 'e-sorting-3' | 'e-sort-down' | 'e-sort-up'
}
type Order = {
  field: 'name' | 'number' | 'expiry-date' | 'temp-point' | 'expired-point' |
  'earned-point' | 'spent-point' | 'offset-point' | 'remain-point' | 'status'
  dir: 'asc' | 'desc' | 'none'
}
type AllPointTableProps = {
  data: PointSummaryResponse[]
  initializing?: boolean
  loading?: boolean
  pageSize?: number
  currentPage?: number
  onSort?: (order: Order) => void
  toDate?: Date
  onTake?: (n: number) => void
  total?: number
  onPage?: (n: number) => void
}
type ColHeadText = 'Number' | 'Name' | 'Expiry Date' | 'Temporary' |
  'Expired' | 'Earned' | 'Spent' | 'Offset' | 'Remain' | 'Status' | 'Adjustment'
type CustomCol = {
  label: ColHeadText
  width?: string | number
  id: keyof RenderedData
  align?: 'Left' | 'Center' | 'Right'
}
const cols: CustomCol[] = [{
  label: "Number",
  id: 'client-number',
  width: 120,
  align: 'Left'
}, {
  label: "Name",
  id: 'client-name',
  width: 130,
  align: 'Left'
}, {
  label: 'Expiry Date',
  id: 'expiry-date',
  width: 120,
  align: 'Left'
}, {
  label: "Temporary",
  width: 100,
  id: 'temporary-points',
  align: 'Right'
},
//  {
//   label: 'Expired',
//   id: 'expired-points',
//   width: 90,
//   align: 'Right'
// }, 
{
  label: "Earned",
  id: 'earned-points',
  width: 90,
  align: 'Right'
}, {
  label: "Spent",
  id: 'spent-points',
  width: 90,
  align: 'Right'
}, {
  label: "Adjustment",
  id: 'adjustment-points',
  width: 90,
  align: 'Right'
}, {
  label: "Offset",
  id: 'offset-points',
  width: 90,
  align: 'Right'
}, {
  label: "Remain",
  width: 100,
  id: 'remaining-points',
  align: 'Right'
}
  // , {
  //   label: "Status",
  //   id: 'status',
  //   width: 90,
  //   align: 'Left'
  // }
]
type RenderedData = {
  'oid': string
  'client-number': string
  'client-name': string
  'expiry-date': string
  'temporary-points': number
  'expired-points': number
  'earned-points': number
  'spent-points': number
  'offset-points': number
  'remaining-points': number
  'adjustment-points': number
  status: string
}
const AllPointsTable: FC<AllPointTableProps> = ({
  data,
  initializing,
  loading,
  onTake,
  onSort,
  pageSize,
  currentPage,
  total,
  onPage }) => {
  const grid = useRef<GridComponent | null>(null);
  const dataBound = () => grid.current?.hideScroll()
  const [numSort, setNumSort] = useState<SortIcon>({ key: 'none', icon: 'e-sorting-3' })
  const [nameSort, setNameSort] = useState<SortIcon>({ key: 'none', icon: 'e-sorting-3' })
  const [expDateSort, setExpDateSort] = useState<SortIcon>({ key: 'none', icon: 'e-sorting-3' })
  const [tempSort, setTempSort] = useState<SortIcon>({ key: 'none', icon: 'e-sorting-3' })
  const [expSort, setExpSort] = useState<SortIcon>({ key: 'none', icon: 'e-sorting-3' })
  const [earnSort, setEarnSort] = useState<SortIcon>({ key: 'none', icon: 'e-sorting-3' })
  const [spentSort, setSpentSort] = useState<SortIcon>({ key: 'none', icon: 'e-sorting-3' })
  const [offSort, setOffSort] = useState<SortIcon>({ key: 'none', icon: 'e-sorting-3' })
  const [remainSort, setRemainSort] = useState<SortIcon>({ key: 'none', icon: 'e-sorting-3' })
  const [statusSort, setStatusSort] = useState<SortIcon>({ key: 'none', icon: 'e-sorting-3' })
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [currentMember, setCurrentMember] = useState<string>()
  const { words } = useLang()
  const customData = () => data.map((d): RenderedData => {
    return {
      'oid': d.client.oid,
      'client-number': d.client.number,
      'client-name': d.client.name,
      'expiry-date': d.client.expiry.toString(),
      'temporary-points': d.point.temporaryPoints,
      'expired-points': d.point.expiredPoints,
      'earned-points': d.point.earnedPoints,
      'spent-points': d.point.spentPoints,
      'offset-points': d.point.offSetPoints,
      'remaining-points': d.point.remainPoints,
      'adjustment-points': d.point.adjustPoints,
      status: firstUpper(words[d.client.status.toLowerCase()])
    }
  })
  const customizeCell = (args: QueryCellInfoEventArgs) => {
    if (!args.cell || !args.data) return;
    let col = (args.column as Column).field
    const d = getValue(col, args.data)
    if (d == 0) return;
    if (col === 'expiry-date') {
      args.cell.textContent = textFromDate(
        new Date(d),
        'english',
        false,
        {
          dateOption: {
            monthMode: 'name',
            splitter: '-'
          }
        })
      return args.cell.classList.add(new Date(d) > new Date() ?
        'positive' : 'negative')
    }
    if ('offset-points,earned-points,remaining-points,adjustment-points'.split(',').includes(col)) {
      if (d > 0 && col !== 'remaining-points') args.cell.textContent = '+' + args.cell.textContent
      const toShow = toAnnotateNumber(d)
      args.cell.textContent = toShow
      return args.cell.classList.add(d > 0 ?
        'positive' : 'negative')
    }
    if (col === 'temporary-points') {
      const toShow = toAnnotateNumber(d)
      args.cell.textContent = toShow
      return args.cell.classList.add('positive')
    }
    if (col === 'spent-points') {
      const toShow = toAnnotateNumber(d)
      args.cell.textContent = toShow
      if (d > 0) args.cell.textContent = "-" + args.cell.textContent
      return args.cell.classList.add('negative')
    }
    if (col !== 'expired-points') return;
    const toShow = toAnnotateNumber(d)
    args.cell.textContent = toShow
    args.cell.classList.add('warning')
  }
  const headerTemp = (props: any) => {
    const headText: ColHeadText = props.headerText
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
          if (onSort) onSort({
            field: 'number',
            dir: numSort.key === 'none' ?
              'asc' : numSort.key === 'asc' ?
                'desc' : 'none'
          });
          [
            setNameSort,
            setExpDateSort,
            setTempSort,
            setExpSort,
            setEarnSort,
            setSpentSort,
            setOffSort,
            setRemainSort,
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
          if (onSort) onSort({
            field: 'name',
            dir: nameSort.key === 'none' ?
              'asc' : nameSort.key === 'asc' ?
                'desc' : 'none'
          });
          [
            setNumSort,
            setExpDateSort,
            setTempSort,
            setExpSort,
            setEarnSort,
            setSpentSort,
            setOffSort,
            setRemainSort,
            setStatusSort
          ].forEach(fun => fun({
            key: 'none',
            icon: 'e-sorting-3'
          }))
        }
        break
      case 'Expiry Date':
        target = expDateSort
        onClick = () => {
          setExpDateSort(p => ({
            key: p.key === 'none' ?
              'asc' : (p.key === 'asc' ?
                'desc' : 'none'),
            icon: p.key === 'none' ?
              'e-sort-down' : p.key === 'asc' ?
                'e-sort-up' : 'e-sorting-3'
          }));
          if (onSort) onSort({
            field: 'expiry-date',
            dir: expDateSort.key === 'none' ?
              'asc' : expDateSort.key === 'asc' ?
                'desc' : 'none'
          });
          [
            setNumSort,
            setNameSort,
            setTempSort,
            setExpSort,
            setEarnSort,
            setSpentSort,
            setOffSort,
            setRemainSort,
            setStatusSort
          ].forEach(fun => fun({
            key: 'none',
            icon: 'e-sorting-3'
          }))
        }
        break
      case 'Temporary':
        target = tempSort
        onClick = () => {
          setTempSort(p => ({
            key: p.key === 'none' ?
              'asc' : (p.key === 'asc' ?
                'desc' : 'none'),
            icon: p.key === 'none' ?
              'e-sort-down' : p.key === 'asc' ?
                'e-sort-up' : 'e-sorting-3'
          }));
          if (onSort) onSort({
            field: 'temp-point',
            dir: tempSort.key === 'none' ?
              'asc' : tempSort.key === 'asc' ?
                'desc' : 'none'
          });
          [
            setNumSort,
            setNameSort,
            setExpDateSort,
            setExpSort,
            setEarnSort,
            setSpentSort,
            setOffSort,
            setRemainSort,
            setStatusSort
          ].forEach(fun => fun({
            key: 'none',
            icon: 'e-sorting-3'
          }))
        }
        break
      case 'Expired':
        target = expSort
        onClick = () => {
          setExpSort(p => ({
            key: p.key === 'none' ?
              'asc' : (p.key === 'asc' ?
                'desc' : 'none'),
            icon: p.key === 'none' ?
              'e-sort-down' : p.key === 'asc' ?
                'e-sort-up' : 'e-sorting-3'
          }));
          if (onSort) onSort({
            field: 'expired-point',
            dir: expSort.key === 'none' ?
              'asc' : expSort.key === 'asc' ?
                'desc' : 'none'
          });
          [
            setNumSort,
            setNameSort,
            setExpDateSort,
            setTempSort,
            setEarnSort,
            setSpentSort,
            setOffSort,
            setRemainSort,
            setStatusSort
          ].forEach(fun => fun({
            key: 'none',
            icon: 'e-sorting-3'
          }))
        }
        break
      case 'Earned':
        target = earnSort
        onClick = () => {
          setEarnSort(p => ({
            key: p.key === 'none' ?
              'asc' : (p.key === 'asc' ?
                'desc' : 'none'),
            icon: p.key === 'none' ?
              'e-sort-down' : p.key === 'asc' ?
                'e-sort-up' : 'e-sorting-3'
          }));
          if (onSort) onSort({
            field: 'earned-point',
            dir: earnSort.key === 'none' ?
              'asc' : earnSort.key === 'asc' ?
                'desc' : 'none'
          });
          [
            setNumSort,
            setNameSort,
            setExpDateSort,
            setTempSort,
            setExpSort,
            setSpentSort,
            setOffSort,
            setRemainSort,
            setStatusSort
          ].forEach(fun => fun({
            key: 'none',
            icon: 'e-sorting-3'
          }))
        }
        break
      case 'Spent':
        target = spentSort
        onClick = () => {
          setSpentSort(p => ({
            key: p.key === 'none' ?
              'asc' : (p.key === 'asc' ?
                'desc' : 'none'),
            icon: p.key === 'none' ?
              'e-sort-down' : p.key === 'asc' ?
                'e-sort-up' : 'e-sorting-3'
          }));
          if (onSort) onSort({
            field: 'spent-point',
            dir: spentSort.key === 'none' ?
              'asc' : spentSort.key === 'asc' ?
                'desc' : 'none'
          });
          [
            setNumSort,
            setNameSort,
            setExpDateSort,
            setTempSort,
            setExpSort,
            setEarnSort,
            setOffSort,
            setRemainSort,
            setStatusSort
          ].forEach(fun => fun({
            key: 'none',
            icon: 'e-sorting-3'
          }))
        }
        break
      case 'Offset':
        target = offSort
        onClick = () => {
          setOffSort(p => ({
            key: p.key === 'none' ?
              'asc' : (p.key === 'asc' ?
                'desc' : 'none'),
            icon: p.key === 'none' ?
              'e-sort-down' : p.key === 'asc' ?
                'e-sort-up' : 'e-sorting-3'
          }));
          if (onSort) onSort({
            field: 'offset-point',
            dir: offSort.key === 'none' ?
              'asc' : offSort.key === 'asc' ?
                'desc' : 'none'
          });
          [
            setNumSort,
            setNameSort,
            setExpDateSort,
            setTempSort,
            setExpSort,
            setEarnSort,
            setSpentSort,
            setRemainSort,
            setStatusSort
          ].forEach(fun => fun({
            key: 'none',
            icon: 'e-sorting-3'
          }))
        }
        break
      case 'Remain':
        target = remainSort
        onClick = () => {
          setRemainSort(p => ({
            key: p.key === 'none' ?
              'asc' : (p.key === 'asc' ?
                'desc' : 'none'),
            icon: p.key === 'none' ?
              'e-sort-down' : p.key === 'asc' ?
                'e-sort-up' : 'e-sorting-3'
          }));
          if (onSort) onSort({
            field: 'remain-point',
            dir: remainSort.key === 'none' ?
              'asc' : remainSort.key === 'asc' ?
                'desc' : 'none'
          });
          [
            setNumSort,
            setNameSort,
            setExpDateSort,
            setTempSort,
            setExpSort,
            setEarnSort,
            setSpentSort,
            setOffSort,
            setStatusSort
          ].forEach(fun => fun({
            key: 'none',
            icon: 'e-sorting-3'
          }))
        }
        break
      default:
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
          if (onSort) onSort({
            field: 'status', dir: statusSort.key === 'none' ?
              'asc' : statusSort.key === 'asc' ?
                'desc' : 'none'
          });
          [
            setNumSort,
            setNameSort,
            setExpDateSort,
            setTempSort,
            setExpSort,
            setEarnSort,
            setSpentSort,
            setOffSort,
            setRemainSort
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
      <span>{
        props.headerText.toLowerCase() == 'adjustment' ?
          firstUpper(words['adjustment_v']) : firstUpper(words[props.headerText.toLowerCase()])
        // props.headerText
      }</span>
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
  const cModels: ColumnModel[] = cols.map(c => ({
    field: c.id,
    headerText: c.label,
    headerTextAlign: 'Center',
    textAlign: c.align ?? 'Center',
    width: c.id === 'status' || c.id === 'expiry-date' || c.id.endsWith('points') ? 120 : 200,
  }))
  const convertDate = (d: Date) => {
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
  }

  const excelProps: any = {
    dataSource: customData().map(d => ({ ...d, 'expiry-date': convertDate(new Date(d["expiry-date"])) })),
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
              colSpan: 10,
              value: 'POINT SUMMARY REPORT',
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
              colSpan: 10,
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
              colSpan: 10,
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
            value: `Total: ${data.length}`,
            style: { bold: true }
          }]
        },
      ]
    },
    fileName: `point-summary(${today(true, true)}).xlsx`
  }
  const toolbarClick = () => {
    grid.current?.excelExport(excelProps)
  }
  const skeletonItems = Array.from({ length: pageSize ?? 10 }, (_): DataTableValue => ({}))
  const skeletonBody = () => <Skeleton></Skeleton>
  return <div
    className="all-point-table-container">
    {(initializing || loading) && <DataTable
      size="small"
      style={{
        flex: 1,
        margin: 10
      }}
      value={skeletonItems}
      className="p-datatable-striped">
      {cols.map(c => <Col
        key={c.id}
        field={c.id}
        header={c.label}
        style={{ width: c.width }}
        body={skeletonBody}></Col>)}
    </DataTable>}
    <div
      className="all-point-table-in"
      style={{
        display: initializing || loading ? 'none' : ''
      }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <ButtonComponent
          cssClass="e-success"
          iconCss="ri-file-excel-line"
          onClick={toolbarClick}
          content={words["export excel"]} />
      </div>
      <div
        className="all-point-table-body">
        <GridComponent
          rowSelecting={e => {
            setCurrentMember(e.data.oid)
            setShowDetailsDialog(true)
          }}
          height='calc(100vh - 290px)'
          allowExcelExport
          excelHeaderQueryCellInfo={args => args.style = {
            borders: { color: '#222222' }
          }}
          excelQueryCellInfo={args => args.style = {
            borders: { color: '#222222' }
          }}
          // toolbar={['ExcelExport']}
          enableStickyHeader
          enableHover={false}
          allowResizing
          queryCellInfo={customizeCell}
          // toolbarClick={toolbarClick}
          rowHeight={28}
          autoFit
          dataBound={dataBound}
          rowDataBound={args => args.row.style.cursor = 'pointer'}
          ref={grid}
          dataSource={customData()}>
          <ColumnsDirective>
            {cols.map(c =>
              <ColumnDirective
                key={c.id}
                minWidth={c.width}
                field={c.id}
                headerText={c.label}
                headerTextAlign='Left'
                headerTemplate={headerTemp}
                textAlign={c.align ?? 'Center'} />)}
          </ColumnsDirective>
          <Inject services={[Toolbar, Resize, ExcelExport]} />
        </GridComponent>
      </div>
      <Paginator
        page={currentPage ?? 1}
        take={pageSize ?? rowsPerPage[0]}
        total={total ?? 0}
        onPage={onPage ?? undefined}
        onTake={onTake ?? undefined} />
    </div>
    <Dialog
      visible={showDetailsDialog}
      onHide={() => setShowDetailsDialog(false)}
      resizable={false}
      closeIcon={<i className="ri-close-line"></i>}
      draggable={false} >
      <ClientDetails
        data={{
          oid: currentMember ?? '',
          years: 0,
          months: 0,
          days: 0,
          gender: '',
          createdAt: new Date(),
          createdBy: '',
          status: 'need-fetch',
          clientGroup: ''
        }} />
    </Dialog>
  </div>
}
export default AllPointsTable