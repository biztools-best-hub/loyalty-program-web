import { Button } from "primereact/button";
import { FC } from "react";
import { TMenuItemProps } from "../../../types";
import { useSidebar } from "../../../providers/side-bar-provider";

const MenuItem: FC<TMenuItemProps> = ({ item, expand }) => {
  const { isOpen } = useSidebar()
  const itemClick = () => expand(item.id)
  return <div
    className={`side-bar-itm ${(item.active ||
      item.children?.some(p => p.active)) && !item.isChild ?
      'active' : ''}`}>
    <Button
      tooltip={isOpen ? undefined : item.label}
      onClick={itemClick}
      className={`side-btn ${item.active ?
        (item.isChild ?
          'active' : 'in-active alone')
        : ''} ${item.children?.some(p => p.active) ?
          'in-active' : ''}`}
      text
      id={item.id}
      label={isOpen ? item.label : undefined}
      icon={item.icon}>
      {item.children && item.children.length > 0 && isOpen &&
        <i className={`pi pi-chevron-right side-state ${item.expanded ?
          'open' : ''}`} />}
    </Button>
    <div
      className={`side-children h-${item.children?.length ?? 1} ${item.expanded ?
        'open' : ''}`}>
      {item.children && item.children.length > 0
        && (item.children.map((itm, i) =>
          <MenuItem
            key={i}
            item={itm}
            expand={expand} />))}
    </div>
  </div>
}
export default MenuItem