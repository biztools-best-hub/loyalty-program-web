import { FC, useEffect, useState, KeyboardEvent, ChangeEvent } from "react";
import { BriefClientResponse } from "../../../types/models";
import { DataView } from 'primereact/dataview'
import { Checkbox, CheckboxChangeEvent } from "primereact/checkbox";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import '../../../assets/css/client-list-in-point.css'
import { useLang } from "../../../providers/lang-provider";
import { firstUpper } from "../../../utils/text-util";
import { CheckBoxComponent } from "@syncfusion/ej2-react-buttons";

type TClientListProps = {
  data: (BriefClientResponse & { selected?: boolean })[],
  showOnlySelected?: boolean,
  onToggleSelected?: (e: CheckboxChangeEvent) => void,
  onChange?: (d: BriefClientResponse & { selected?: boolean }) => void,
  onSearch?: (v: string) => void,
  page: number,
  onSort?: (key: 'name' | 'status' | 'number', dir: 'asc' | 'desc' | 'none') => void
}
const ClientList: FC<TClientListProps> = ({
  data,
  page,
  // showOnlySelected,
  // onToggleSelected,
  onChange,
  onSearch,
  onSort
}) => {
  const headData: BriefClientResponse & { selected?: boolean } = {
    name: "Name",
    status: "Status",
    oid: "head-name",
    number: "Number",
    selected: false,
    expiry: new Date()

  };
  const { words } = useLang()
  const items = [headData].concat(data.filter((_, i) => i >= 20 * (page - 1) && i < (20 * (page - 1)) + 20))
  const [searchValue, setSearchValue] = useState('')
  const [nameSortIcon, setNameSortIcon] = useState<{
    key: 'desc' | 'asc' | 'none',
    icon: "pi pi-sort" | "pi pi-sort-alpha-down" | "pi pi-sort-alpha-up-alt"
  }>({
    key: 'none',
    icon: 'pi pi-sort'
  })
  const [numberSortIcon, setNumberSortIcon] = useState<{
    key: 'desc' | 'asc' | 'none',
    icon: "pi pi-sort" | "pi pi-sort-alpha-down" | "pi pi-sort-alpha-up-alt"
  }>({
    key: 'none',
    icon: 'pi pi-sort'
  })
  const [statusSortIcon, setStatusSortIcon] = useState<{
    key: 'desc' | 'asc' | 'none',
    icon: "pi pi-sort" | "pi pi-sort-alpha-down" | "pi pi-sort-alpha-up-alt"
  }>({
    key: 'none',
    icon: 'pi pi-sort'
  })
  const template = (d: BriefClientResponse & {
    selected?: boolean
  }) => {
    const onSubChange = (e: any) => {
      if (!onChange) return;
      const temp = { ...d }
      temp.selected = e.target.checked
      onChange(temp)
    }
    const onNameSort = () => {
      setNameSortIcon(p =>
      ({
        key: p.key === 'none' ?
          'asc' : (p.key === 'asc' ?
            'desc' : 'none'),
        icon: p.key === 'none' ?
          'pi pi-sort-alpha-down' : (p.key === 'asc' ?
            'pi pi-sort-alpha-up-alt' : 'pi pi-sort')
      }))
      if (statusSortIcon.key !== 'none') setStatusSortIcon(_ =>
      ({
        key: 'none',
        icon: 'pi pi-sort'
      }))
      if (numberSortIcon.key !== 'none') setNumberSortIcon(_ =>
      ({
        key: 'none',
        icon: 'pi pi-sort'
      }))
      if (!onSort) return;
      onSort(
        'name',
        nameSortIcon.key === 'asc' ?
          'desc' : nameSortIcon.key === 'desc' ?
            'none' : 'asc')
    }
    const onNumberSort = () => {
      setNumberSortIcon(p =>
      ({
        key: p.key === 'none' ?
          'asc' : (p.key === 'asc' ?
            'desc' : 'none'),
        icon: p.key === 'none' ?
          'pi pi-sort-alpha-down' : (p.key === 'asc' ?
            'pi pi-sort-alpha-up-alt' : 'pi pi-sort')
      }))
      if (nameSortIcon.key !== 'none') setNameSortIcon(_ =>
      ({
        key: 'none',
        icon: 'pi pi-sort'
      }))
      if (statusSortIcon.key !== 'none') setStatusSortIcon(_ =>
      ({
        key: 'none',
        icon: 'pi pi-sort'
      }))
      if (!onSort) return;
      onSort('number', numberSortIcon.key === 'asc' ?
        'desc' : statusSortIcon.key === 'desc' ?
          'none' : 'asc')
    }
    const onStatusSort = () => {
      setStatusSortIcon(p =>
      ({
        key: p.key === 'none' ?
          'asc' : (p.key === 'asc' ?
            'desc' : 'none'),
        icon: p.key === 'none' ?
          'pi pi-sort-alpha-down' : (p.key === 'asc' ?
            'pi pi-sort-alpha-up-alt' : 'pi pi-sort')
      }))
      if (nameSortIcon.key !== 'none') setNameSortIcon(_ =>
      ({
        key: 'none',
        icon: 'pi pi-sort'
      }))
      if (numberSortIcon.key !== 'none') setNumberSortIcon(_ =>
      ({
        key: 'none',
        icon: 'pi pi-sort'
      }))
      if (!onSort) return;
      onSort('status', statusSortIcon.key === 'asc' ?
        'desc' : statusSortIcon.key === 'desc' ?
          'none' : 'asc')
    }
    return <div
      className={`client-list-point-template ${d.name === "Name" ?
        'report-client-list-head' : ''}`}>
      {d.name !== 'Name' &&
        // <Checkbox
        //   onChange={onSubChange}
        //   checked={d.selected ?? false} />
        <CheckBoxComponent
          onChange={onSubChange}
          checked={d.selected ?? false}
        />
      }
      {d.name !== 'Name' ? <span
        className="client-list-point-item">
        {d.number}
      </span> : <div
        className="client-list-point-content">
        <span>
          {firstUpper(words['client number'])}
        </span>
        <Button
          onClick={onNumberSort}
          className={`report-client-list-sort-icon ${numberSortIcon.key !== 'none' ?
            'active' : ''}`}
          style={{ padding: 0, maxWidth: 30, maxHeight: 30 }}
          icon={numberSortIcon.icon}
          size="small"
          rounded
          text />
      </div>}
      {d.name !== 'Name' ?
        <span
          className="client-list-point-item">
          {d.name}
        </span> :
        <div
          className="client-list-point-content">
          <span>
            {firstUpper(words["name"])}
          </span>
          <Button
            onClick={onNameSort}
            className={`report-client-list-sort-icon ${nameSortIcon.key !== 'none' ?
              'active' : ''}`}
            style={{ padding: 0, maxWidth: 30, maxHeight: 30 }}
            icon={nameSortIcon.icon}
            size="small"
            rounded
            text />
        </div>}
      {d.name !== 'Name' ?
        <span
          className="client-list-point-item-2">
          {firstUpper(words[d.status.toLowerCase()])}
        </span> :
        <div
          className="client-list-point-content-2">
          <span>
            {firstUpper(words["status"])}
          </span>
          <Button
            icon={statusSortIcon.icon}
            className={`report-client-list-sort-icon ${statusSortIcon.key !== 'none' ?
              'active' : ''}`}
            style={{ padding: 0, maxWidth: 30, maxHeight: 30 }}
            onClick={onStatusSort}
            size="small"
            rounded
            text />
        </div>}
    </div>
  }
  const onClientSearch = onSearch ? (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key.toLowerCase() !== 'enter') return;
    onSearch(searchValue)
  } : undefined
  const onClientSearchLostFocus = onSearch ? () => onSearch(searchValue) : undefined
  const onClientSearchChange = (e: ChangeEvent<HTMLInputElement>) =>
    setSearchValue(_ => e.target.value)
  useEffect(() => {
    if (!onSearch) return;
    onSearch(searchValue)
  }, [searchValue])

  return <div
    className="report-client-list-content-boundary">
    <div
      className="report-client-list-search">
      <span className="p-input-icon-right">
        <i className="pi pi-search" />
        <InputText
          className="client-search-input"
          onChange={onClientSearchChange}
          onKeyDown={onClientSearch}
          onBlur={onClientSearchLostFocus} />
      </span>
    </div>
    <DataView
      className="report-client-list-content"
      value={items.filter((_, i) => i < 21)}
      itemTemplate={template} />
  </div>
}
export default ClientList