import { FC, useState, useRef, useEffect } from "react";
import { v4 } from 'uuid';
import BasePage from "../../base-page";
import { ButtonComponent, SwitchComponent } from "@syncfusion/ej2-react-buttons";
import { Dialog } from "primereact/dialog";
import { FileUpload, ItemTemplateOptions } from "primereact/fileupload";
// import { GoogleGenerativeAI } from '@google/generative-ai'
import '../../../assets/css/events-setup.css'
import { useApi } from "../../../providers/api-provider";
import { useToast } from "../../../providers/toast-provider";
import { ProgressSpinner } from "primereact/progressspinner";
import { TDataListResponse } from "../../../types/models/base";
import { EventFilter, EventResponse } from "../../../types/models/event";
import { rowsPerPage } from "../../../constants";
import noDataImg from '../../../assets/images/no_data.png'
import Paginator from "../../others/paginator";
import imageCompression from "browser-image-compression";
import { ProgressBar } from "primereact/progressbar";
import EventCard from "./components/event-card";
import { useSearchBox } from "../../../providers/search-box-provider";
import { useUser } from "../../../providers/user-provider";
import { useLang } from "../../../providers/lang-provider";
import { capitalize, firstUpper, textFromDate } from "../../../utils/text-util";
import { DateRangePickerComponent } from "@syncfusion/ej2-react-calendars";
import StateInput from "../../others/state-input";
import StateTextArea from "../../others/state-textarea";
// const ai = new GoogleGenerativeAI("AIzaSyBxDdqg4ItzJ-3puGhRnfflbCOK-iweOXE");

const EventsSetup: FC = () => {
  const { user } = useUser()
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [currentPublished, setCurrentPublished] = useState(true)
  const [enableChangeImage, setEnableChangeImage] = useState(false)
  const [enableSaveBtn, setEnableSaveBtn] = useState(false)
  const { defineOnSearch } = useSearchBox()
  const [enableSwitch] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [saveIconClass, setSaveIconClass] = useState('ri-save-3-fill')
  const [eventsFilterOption, setEventsFilterOption] = useState<EventFilter>({
    order: { field: 'created-at' },
    take: rowsPerPage[0],
    page: 1,
    startDate: null,
    endDate: null,
    needFetch: true
  })
  const [eventsResponse, setEventsResponse] = useState<TDataListResponse<EventResponse>>()
  const [currentEvent, setCurrentEvent] = useState<string>()
  const [emptyByFilter, setEmptyByFilter] = useState(false)
  const [filteredEvents, setFilteredEvents] = useState<EventResponse[]>()
  const [needFilter, setNeedFilter] = useState(false)
  const [currentData, setCurrentData] = useState<EventResponse>()
  const [deleting, setDeleting] = useState(false)
  const [showFullPreview, setShowPreview] = useState(false)
  const [errorTitle, setErrorTitle] = useState(false)
  const [showFileTooLarge, setShowFileTooLarge] = useState(false)
  const [compressing, setCompressing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [title, setTitle] = useState("")
  const [titleKhmer, setTitleKhmer] = useState("")
  const [initialTitleKh, setInitialTitleKh] = useState(titleKhmer)
  const [description, setDescription] = useState("")
  const [descriptionKhmer, setDescriptionKhmer] = useState("")
  const { words, lang } = useLang()
  const { event, apiUrl } = useApi()
  const { show } = useToast()
  const statusSwitch = useRef<SwitchComponent>(null)
  const uploader = useRef<FileUpload>(null)
  const inputFile = useRef<HTMLInputElement>(null)
  const saveBtn = useRef<ButtonComponent>(null)
  const eventsWrap = useRef<HTMLDivElement>(null)
  const removeEvent = event.useRemoveEvent({
    onSuccess: _ => {
      setEventsFilterOption(p => ({ ...p, page: 1 }))
    },
    params: { oid: currentEvent },
    onError: (e: any) => {
      setDeleting(false)
      setCurrentEvent(undefined)
      show({
        detail: e.message,
        severity: 'error',
        summary: firstUpper(words['error']),
        life: 5000
      })
    },
    enabled: false
  })
  const filterEvents = event.useFilterEvents({
    onSuccess: r => {
      setEventsResponse(r)
      setFilteredEvents(r.data)
      setNeedFilter(true)
    },
    onError: (e: any) => {
      const emptyList: EventResponse[] = []
      setEventsResponse({ totalFilteredRecords: 0, totalRecords: 0, data: emptyList, page: 1 })
      show({
        detail: e.message,
        summary: firstUpper(words['error']),
        severity: 'error',
        life: 5000
      })
    }
  })
  const startCompress = async (f: File) => {
    try {
      setCompressing(true)
      const compressedFile = await imageCompression(f, {
        maxSizeMB: 1.8, onProgress: p => {
          setProgress(p)
        }
      })
      setProgress(100)
      setTimeout(() => {
        setShowFileTooLarge(false)
        setCompressing(false)
        startAdd(compressedFile)
        setProgress(0)
      }, 1600)
    } catch (error: any) {
      setFetching(false)
      setSaveIconClass('ri-save-3-fill')
      setCompressing(false)
      setShowFileTooLarge(false)
      show({
        detail: error.message ?? firstUpper(words["something went wrong while compressing"]),
        summary: firstUpper(words['error']),
        severity: 'error',
        life: 5000
      })
    }
  }
  const uploadEvent = event.useUploadEvent({
    onSuccess: r => {
      setCompressing(false)
      addEvent({
        title: title ?? "",
        description: description,
        titleKhmer: titleKhmer,
        descriptionKhmer: descriptionKhmer,
        duration: 0,
        eventType: 'none',
        imageUrl: `${apiUrl}${r.localUrl}`,
        oid: r.refId,
        status: 'pub'
      })
    },
    onError: e => {
      setCompressing(false)
      setFetching(false)
      setSaveIconClass('ri-save-3-fill')
      show({
        detail: e.message ??
          (e.statusText.toLowerCase().endsWith("too large") ?
            firstUpper(words[`Your file is too large (limit size is 1.8MB)`]) :
            firstUpper(words['something went wrong'])),
        severity: 'error',
        summary: firstUpper(words["error"]),
        life: 5000
      })
    },
  })
  const addEvent = event.useAddEvent({
    onSuccess: () => {
      setFetching(false)
      setShowEventDialog(false)
      setSaveIconClass('ri-save-3-fill')
      setEventsFilterOption(p => ({
        ...p,
        page: Math.ceil(((eventsResponse?.totalRecords ?? 0) + 1) / (eventsFilterOption.take ?? rowsPerPage[0])),
        needFetch: true
      }))
      show({
        detail: !words['event_s'] || !words['is added'] ?
          `Event: ${lang == 'khmer' ? (titleKhmer ?? title) : title} is added` :
          firstUpper(`${words['event_s']}: ${lang == 'khmer' ? (titleKhmer ?? title) : title} ${words['is added']}`),
        summary: firstUpper(words['success']),
        life: 5000,
        severity: 'success'
      })
    },
    onError: (e: any) => {
      setFetching(false)
      setSaveIconClass('ri-save-3-fill')
      show({
        detail: e.message ??
          (e.statusText && e.statusText.toLowerCase() == "multiple choices" ?
            firstUpper(words["duplicated event title"]) : "Something wrong"),
        severity: 'error',
        summary: firstUpper(words['error']),
        life: 5000
      })
    }
  })
  const startAdd = (f?: File) => {
    if (!title || title.trim().length < 1) {
      setErrorTitle(true)
      return;
    }
    if (!f) f = uploader.current?.getFiles()[0]
    setFetching(true)
    setSaveIconClass('')
    const image = new Image()
    if (f) {
      if (f.size > 1.78 * 1024 * 1024) {
        setShowFileTooLarge(true)
        return;
      }
      const url = URL.createObjectURL(f)
      image.addEventListener('load', () => {
        if (!title) return;
        uploadEvent({
          data: f as File,
          height: image.height,
          width: image.width,
          id: v4(),
        })
      })
      image.src = url
      return;
    }
    else if (currentData?.imageUrl) {
      image.addEventListener('load', () => {
        if (!title) return;
        uploadEvent({
          height: image.height,
          width: image.width,
          id: v4(),
          old: currentData.imageUrl
        })
      })
      image.src = currentData.imageUrl;
    }
    else addEvent({
      title: title,
      description: description,
      titleKhmer: titleKhmer ?? "",
      descriptionKhmer: descriptionKhmer ?? "",
      status: 'pub',
      duration: 0,
      eventType: 'none',
    })
  }
  const itemTemplate = (file: any, _: ItemTemplateOptions) => {
    const img = file as File
    return (
      <div style={{ display: 'flex', flex: 1 }}>
        <img
          className="event-img"
          src={`${URL.createObjectURL(img)}`}
          alt="empty" />
      </div>
    )
  }
  const getFileSize = () => {
    const f = uploader.current?.getFiles()[0]
    if (!f) return '0B';
    const units = ["MB", "GB", "TB"]
    let current = 0
    let size = f.size / 1024 / 1024
    while (size >= 1024 && current < units.length) {
      size = size / 1024
      current++
    }
    return `${size.toFixed(2)}${units[current]}`
  }
  const emptyTemplate = () => {
    return currentData?.imageUrl ? <div style={{ display: 'flex', flex: 1 }}>
      <img
        className="event-img"
        src={currentData.imageUrl}
        alt="empty" />
    </div> : <div
      onClick={() => {
        if (fetching) return;
        inputFile.current?.click()
      }}
      style={{
        cursor: fetching ? 'default' : 'pointer',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
      <i className="pi pi-image"
        style={{
          fontSize: '5em',
          borderRadius: '50%',
          color: 'rgba(0,0,0,.3)'
        }}>
      </i>
      <span
        style={{
          fontSize: '1em',
          color: 'var(--text-color-secondary)'
        }}
        className="my-5">
        {firstUpper(words['click to upload or drag and drop image here'])}
      </span>
    </div>
  }
  useEffect(() => {
    if (!needFilter) return;
    if (eventsFilterOption.startDate && eventsFilterOption.endDate) {
      const exactFilterStart = new Date(eventsFilterOption.startDate.getFullYear(), eventsFilterOption.startDate.getMonth(), eventsFilterOption.startDate.getDate())
      const exactFilterEnd = new Date(eventsFilterOption.endDate.getFullYear(), eventsFilterOption.endDate.getMonth(), eventsFilterOption.endDate.getDate())
      const res = eventsResponse?.data.filter(e => {
        const d = new Date(e.createdAt)
        const exactDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())
        return exactDate >= exactFilterStart && exactDate <= exactFilterEnd;
      }) ?? [];
      setFilteredEvents(res)
      if (res.length <= 0) setEmptyByFilter(true)
      return setNeedFilter(false)
    }
    setFilteredEvents(eventsResponse?.data)
    setNeedFilter(false)
  }, [needFilter])
  useEffect(() => {
    if (eventsFilterOption.needFetch) filterEvents(eventsFilterOption)
  }, [eventsFilterOption])
  useEffect(() => {
    if (currentEvent && deleting) removeEvent()
  }, [deleting, currentEvent])
  useEffect(() => {
    defineOnSearch(v => {
      setEventsFilterOption(o => ({ ...o, search: v, needFetch: true }))
    })
  }, [])
  return (<BasePage
    rightComponent={(emptyByFilter || (filteredEvents && filteredEvents.length > 0)) &&
      <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
        <span style={{ whiteSpace: 'nowrap', display: 'flex', gap: 5, alignItems: 'center' }}>
          <i className="ri-filter-2-fill"></i>
          <span>
            {capitalize(words['date filter'])}:
          </span>
          <DateRangePickerComponent
            openOnFocus={true}
            format="dd/MM/yyyy"
            change={e => {
              setEventsFilterOption(o =>
              ({
                ...o,
                startDate: e.startDate,
                endDate: e.endDate,
                needFetch: false
              }))
              setNeedFilter(true)
            }} />
        </span>
        {(user?.permissions.some(p =>
          p.permissionName.toLocaleLowerCase() == 'event setup')
          || user?.currentRole?.toLocaleLowerCase() == 'admin') &&
          <ButtonComponent
            onClick={() => setShowEventDialog(true)}
            cssClass="e-success"
            iconCss="ri-add-fill"
            content={firstUpper(words["add new event"])} />
        }
      </div>
    }
  >
    <div className="events-container"
      style={{ display: 'flex', flex: 1 }}>
      {!filteredEvents ?
        <div className="events-loading"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            justifyContent: 'center',
            alignItems: 'center'
          }}>
          <ProgressSpinner style={{ width: 50 }} />
          <span>
            {firstUpper(words['checking events'])}...
          </span>
        </div> :
        filteredEvents.length > 0 ?
          <div ref={eventsWrap}
            className="events-wrap"
            style={{
              flex: 1,
              gap: 10,
              display: 'flex',
              flexDirection: 'column'
            }}>
            <div style={{
              display: 'grid',
              flex: 1,
              placeItems: 'center',
              overflowY: 'auto'
            }}>
              <div style={{
                display: 'flex',
                gap: 16,
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                {filteredEvents.map(d => {
                  const iconCss = deleting && currentEvent === d.oid ?
                    '' : 'ri-delete-bin-6-fill'
                  return (<EventCard
                    key={d.oid}
                    data={d}
                    deleting={deleting && currentEvent === d.oid}
                    onCardClick={() => {
                      setCurrentData(d)
                      const len = filteredEvents.filter(r => r.title == d.title).length;
                      const lenKh = filteredEvents.filter(r => r.titleKhmer == d.titleKhmer).length;
                      setTitle(d.title ? `${d.title}(${len + 1})` : "")
                      const kh = d.titleKhmer ? `${d.titleKhmer}(${lenKh + 1})` : "";
                      setTitleKhmer(kh)
                      setInitialTitleKh(kh)
                      setDescription(d.description ?? "")
                      setDescriptionKhmer(d.descriptionKhmer ?? "")
                      setShowPreview(true)
                      if (d.imageUrl) setEnableChangeImage(true)
                      setEnableSaveBtn(true)
                    }}
                    onDelete={() => {
                      setCurrentEvent(d.oid)
                      setDeleting(true)
                    }}
                    icon={iconCss}
                    disabled={deleting && currentEvent == d.oid} />)
                })}
              </div>
            </div>
            {filteredEvents.length > 0 &&
              <div style={{ padding: '0 16px 16px 16px' }}>
                <Paginator page={eventsFilterOption.page ?? 1}
                  take={eventsFilterOption.take ?? rowsPerPage[0]}
                  total={filteredEvents.length} />
              </div>
            }
          </div> : emptyByFilter ? <div style={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            {firstUpper(words["cannot find the events"])}
          </div> :
            <div className="no-events"
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                gap: 10
              }} >
              <img src={noDataImg} alt="no-data" style={{ width: 200 }} />
              <span>{firstUpper(words['oop no events'])}</span>
              {(user?.permissions.some(p =>
                p.permissionName.toLocaleLowerCase() == 'event setup') ||
                user?.currentRole?.toLocaleLowerCase() == 'admin') &&
                <ButtonComponent
                  onClick={() => setShowEventDialog(true)}
                  cssClass="e-info"
                  iconCss="ri-add-fill"
                  content={firstUpper(words["add new event now"])} />
              }
            </div>}
    </div>
    <Dialog
      style={{ width: '75vw', minWidth: '400px' }}
      resizable={false}
      closeIcon={<i className="ri-close-line"></i>}
      header={<div style={{ display: 'flex', gap: 1 }}>
        <i className="ri-megaphone-fill"></i>
        <span>{capitalize(words['new event'])}</span>
      </div>}
      visible={showEventDialog}
      draggable={false}
      footer={<div style={{
        paddingTop: 20,
        display: 'flex',
        justifyContent: 'flex-end'
      }} >
        <div style={{ display: 'flex', gap: 10 }}>
          <ButtonComponent
            ref={saveBtn}
            onClick={() => {
              startAdd()
            }}
            disabled={!enableSaveBtn || fetching}
            iconCss={saveIconClass}
            cssClass="e-success"
            style={{ margin: 0, display: 'flex', alignItems: 'center' }} >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {fetching && <ProgressSpinner style={{ width: 16, height: 16 }} />}
              <span>{words['save']}</span>
            </div>
          </ButtonComponent>
          {/* <ButtonComponent
            ref={saveBtn}
            onClick={async () => {
              const model = ai.getGenerativeModel({ model: "gemini-pro" })
              const prompt = "Write an a chinese new year 2024 event announcement in english with discount 50% on all products"
              const result = await model.generateContent(prompt)
              const response = result.response;
              const text = response.text();
              setDescription(text)
            }}
            cssClass="e-info"
            style={{ margin: 0, display: 'flex', alignItems: 'center' }} >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {fetching && <ProgressSpinner style={{ width: 16, height: 16 }} />}
              <span>Auto generate content</span>
            </div>
          </ButtonComponent> */}
        </div>
      </div>}
      closable={!fetching}
      onHide={() => {
        setShowEventDialog(false)
        if (currentData?.imageUrl) setEnableChangeImage(false)
        if (enableSaveBtn) setEnableSaveBtn(false)
        setCurrentData(undefined)
        setTitle("")
        setTitleKhmer("")
        setInitialTitleKh("")
        setDescription("")
        setDescriptionKhmer("")
      }}>
      <input disabled={fetching}
        type="file"
        accept="image/*"
        ref={inputFile}
        hidden
        onChange={e => {
          const f = e.target.files?.[0]
          if (!f) return;
          uploader.current?.setFiles([f])
          setEnableChangeImage(true)
          setEnableSaveBtn(true)
        }} />
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '5px',
        borderTop: 'solid 1px #ddd',
        paddingTop: 20, gap: 10
      }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            flex: 1,
            textAlign: 'left',
            gap: 1
          }}>
            <label >{firstUpper(words['title (KH)'])}</label>
            <StateInput initialValue={initialTitleKh} disabled={fetching} onChange={e => {
              setTitleKhmer(e.target.value)
              if (!enableSaveBtn) setEnableSaveBtn(true)
              if (errorTitle) setErrorTitle(false)
            }} />
          </div>
          <div style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'flex-start',
            textAlign: 'left',
            gap: 1
          }}>
            <label >{firstUpper(words['title (ENG)'])}</label>
            <StateInput disabled={fetching} initialValue={title} onChange={e => {
              setTitle(e.target.value)
              if (!enableSaveBtn) setEnableSaveBtn(true);
              if (errorTitle) setErrorTitle(false)
            }} />

            {errorTitle && <small style={{ color: 'red' }}>
              {firstUpper(words['title is required'])}!
            </small>}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                textAlign: 'left'
              }}>
                <label>
                  {firstUpper(words['image'])}
                </label>
                <div id="image-wrap"
                  style={{
                    display: 'flex',
                    width: '40vw',
                    minWidth: '250px',
                    aspectRatio: '2 / 1',
                    border: 'solid 1px #ddd',
                    borderRadius: 6
                  }}>
                  <FileUpload
                    disabled={fetching}
                    className="custom-file-upload"
                    ref={uploader}
                    accept="image/*"
                    onSelect={() => {
                      setEnableChangeImage(true)
                      setEnableSaveBtn(true)
                    }}
                    style={{ flex: 1, display: 'flex' }}
                    contentStyle={{
                      flex: 1,
                      display: 'flex',
                      background: 'transparent'
                    }}
                    itemTemplate={itemTemplate}
                    emptyTemplate={emptyTemplate}
                    headerTemplate={<div></div>} />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <label style={{ textAlign: 'left' }} >{firstUpper(words['description (KH)'])}</label>
                <StateTextArea
                  disabled={fetching}
                  initialValue={descriptionKhmer}
                  onChange={e => setDescriptionKhmer(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <label style={{ textAlign: 'left' }}>{firstUpper(words['description (ENG)'])}</label>
                <StateTextArea
                  onChange={e => setDescription(e.target.value)}
                  initialValue={description}
                  disabled={fetching}
                />
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
            <ButtonComponent
              disabled={!enableChangeImage || fetching}
              cssClass="e-info"
              iconCss="ri-image-edit-fill"
              onClick={() => inputFile.current?.click()}
              content={words["change image"]} />
            <div style={{
              display: 'flex',
              textAlign: 'left',
              alignItems: 'center',
              gap: 10
            }}>
              <label onClick={() => {
                if (!enableSwitch || fetching) return;
                statusSwitch.current?.toggle()
                setCurrentPublished(p => !p)
              }}
                style={{ cursor: enableSwitch ? 'pointer' : 'default' }}>
                {currentPublished ? firstUpper(words['published']) :
                  firstUpper(words['pending_pub'])}
              </label>
              <SwitchComponent
                disabled={!enableSwitch || fetching}
                ref={statusSwitch}
                cssClass="e-small"
                checked={currentPublished}
                onChange={(e: any) => setCurrentPublished(e.target.checked)} />
            </div>
          </div>
        </div>
      </div>
    </Dialog>
    <Dialog draggable={false}
      className="preview-event-image"
      closeIcon={<i className="ri-close-line"></i>}
      resizable={false}
      header={<div style={{ display: 'flex', flexDirection: 'column' }}>
        <span>
          {lang == 'khmer' ?
            (currentData?.titleKhmer && currentData.titleKhmer.length > 0 ?
              currentData.titleKhmer : currentData?.title) : currentData?.title}
        </span>
        {currentData?.createdAt &&
          <span style={{ fontSize: 12, color: '#6deee7' }}>
            {
              // currentData.createdAt.toCustomString('english', false, { dateOption: { splitter: '-' } })
              textFromDate(currentData.createdAt, 'english', false, { dateOption: { splitter: '-' } })
            }
          </span>
        }
      </div>}
      headerStyle={{ color: '#fff', textAlign: 'left', justifyContent: 'space-between', minWidth: 400 }}
      style={{ padding: 0 }}
      visible={showFullPreview}
      onHide={() => {
        setShowPreview(false)
        if (currentData?.imageUrl) setEnableChangeImage(false)
        if (enableSaveBtn) setEnableSaveBtn(false)
        setCurrentData(undefined)
        setTitle("")
        setTitleKhmer("")
        setInitialTitleKh("")
        setDescription("")
        setDescriptionKhmer("")
      }}
      contentStyle={{
        display: 'flex',
        padding: 0,
        justifyContent: 'center',
        alignItems: 'flex-start',
        maxWidth: '45vw',
        minWidth: 300,
        gap: 10,
        color: '#fff',
        flexDirection: 'column',
        textAlign: 'justify'
      }} >
      {currentData?.imageUrl &&
        <img
          src={currentData.imageUrl}
          alt="preview-image"
          style={{
            background: '#ddd',
            width: '40vw',
            aspectRatio: '2/1',
            minWidth: 300
          }} />
      }
      {lang == 'khmer' ?
        (currentData?.descriptionKhmer ?
          <div>{currentData.descriptionKhmer}</div> : currentData?.description ?
            <div>{currentData.description}</div> : null) : (currentData?.description ?
              <div>{currentData.description}</div> : null)}
      {(user?.permissions.some(p =>
        p.permissionName.toLocaleLowerCase() == 'event setup')
        || user?.currentRole?.toLocaleLowerCase() == 'admin') &&
        <ButtonComponent
          className="btn-event-edit need-hover"
          content={words['edit to republish']}
          onClick={() => {
            setShowPreview(false)
            setShowEventDialog(true)
            setEnableSaveBtn(true)
          }} />
      }
    </Dialog>
    <Dialog closable={!compressing}
      closeIcon={<i className="ri-close-line"></i>}
      style={{ width: 460 }}
      header={<div style={{
        display: 'flex',
        color: 'orange',
        justifyContent: 'flex-start',
        gap: 6,
        alignItems: 'center'
      }}>
        < i className="ri-alert-line"></i>
        <span>{firstUpper(words['alert'])}</span>
      </div>}
      draggable={false}
      className="file-too-large-dialog"
      visible={showFileTooLarge}
      onHide={() => {
        setFetching(false)
        setShowFileTooLarge(false)
      }}>
      <div style={{
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}>
        {compressing ? <ProgressBar value={progress} /> :
          <span>{
            !words['your file size'] || !words['too large (limit size is 1.8MB)'] ?
              `Your file size ${getFileSize()} is too large (limit size is 1.8MB)` :
              `${words['your file size']} ${getFileSize()} ${words['too large (limit size is 1.8MB)']}`
          }</span>}
        {compressing ? <span>{firstUpper(words['compressing'])}...</span> :
          <span>{firstUpper(words['try to compress it and upload'])}?</span>}
        <div>
          <ButtonComponent
            onClick={() => {
              const f = uploader.current?.getFiles()[0]
              if (!f) return;
              startCompress(f)
            }}
            disabled={compressing}
            cssClass="e-info"
            content={words["compress then upload"]} />
        </div>
      </div>
    </Dialog>
    <div></div>
  </BasePage >)
}
export default EventsSetup