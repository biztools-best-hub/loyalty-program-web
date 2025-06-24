import { FC } from "react";
import { EventResponse } from "../../../../types/models/event";
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import { ProgressSpinner } from "primereact/progressspinner";
import { useUser } from "../../../../providers/user-provider";
import { useLang } from "../../../../providers/lang-provider";
import { textFromDate } from "../../../../utils/text-util";

type EventCardProps = {
  data: EventResponse,
  onCardClick: () => void,
  disabled: boolean,
  onDelete: () => void
  icon: string
  deleting: boolean
}
const EventCard: FC<EventCardProps> = ({
  data,
  onCardClick,
  disabled,
  onDelete,
  icon,
  deleting }) => {
  const { user } = useUser()
  const { lang } = useLang()
  return (<div
    className="event-item"
    style={{
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      gap: 6,
      maxWidth: 300,
      minWidth: 300,
    }}>
    {data.imageUrl ?
      <img
        src={data.imageUrl}
        alt="event-image"
        onClick={onCardClick}
        style={{
          flex: 1,
          objectFit: 'fill',
          aspectRatio: '2/1',
          boxShadow: '2px 2px 3px rgba(0,0,0,.2)'
        }} /> :
      <div className="item-need-bg"
        onClick={onCardClick}
        style={{
          flex: 1,
          aspectRatio: '2/1',
          boxShadow: '2px 2px 3px rgba(0,0,0,.2)',
          alignItems: 'center',
          justifyContent: 'center',
          display: 'flex',
          overflowY: 'auto',
        }} >
        {lang == 'khmer' ? data.descriptionKhmer && data.descriptionKhmer.trim().length > 0 ? data.descriptionKhmer : data.description : data.description}
      </div>
    }
    <div className="item-need-bg"
      style={{
        minHeight: 40,
        justifyContent: 'space-between',
        display: 'flex',
        alignItems: 'center',
        padding: 10,
        boxShadow: '2px 2px 3px rgba(0,0,0,.2)'
      }}>
      <span style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
      }}>
        <span>
          {lang == 'khmer' ? (data.titleKhmer ?? data.title) : data.title}
        </span>
        <span style={{ fontSize: 10, color: '#347377' }}>
          {
            textFromDate(data.createdAt, 'english', false, { dateOption: { splitter: '-' } })
            // data.createdAt.toCustomString('english', false, { dateOption: { splitter: '-' } })
          }
        </span>
      </span>
      {(user?.permissions.some(p =>
        p.permissionName.toLowerCase() == 'event setup') ||
        user?.currentRole?.toLocaleLowerCase() == 'admin') && <ButtonComponent
          disabled={disabled}
          cssClass="e-small e-outline e-danger" onClick={onDelete}
          iconCss={icon}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: 24,
            height: 24
          }}>
          {deleting &&
            <ProgressSpinner style={{ width: 20, height: 20 }} />}
        </ButtonComponent>}
    </div>
  </div>)
}
export default EventCard