import { FC, useEffect, useRef, useState } from "react";
import BasePage from "../base-page";
import { useSearchBox } from "../../providers/search-box-provider";
import '../../assets/css/dashboard.css'
import bg from '../../assets/images/home_bg.png'
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import AnimatedNumber from "react-animated-numbers";
import { MenuItem } from "primereact/menuitem";
import { Menu } from "primereact/menu";
import { TDashboardReport } from "../../types/models/point";
import { useApi } from "../../providers/api-provider";
import { useToast } from "../../providers/toast-provider";
import { capitalize, firstUpper, textFromDate, toAnnotateNumber } from "../../utils/text-util";
import { Chart } from 'primereact/chart'
import { Dialog } from "primereact/dialog";
import { ProgressSpinner } from "primereact/progressspinner";
import ClientDetails from "../users/client-list/components/client-details";
import { useLang } from "../../providers/lang-provider";
import { useWs } from "../../providers/ws-provider";
type TSign = 'ri-add-fill' | 'ri-minus-fill'
type TIncrSign = {
  icon: 'ri-arrow-up-s-fill' | 'ri-arrow-down-s-fill'
  color: 'lime' | 'pink'
}

const Dashboard: FC = () => {
  const { hide, show, replace } = useSearchBox()
  const { show: showToast } = useToast()
  const { ws } = useWs()
  const availableColor = '#83af5f'
  const hoverAvailableColor = '#65973c'
  const expiredColor = '#ff7070'
  const totalColor = '#3aafc4'
  const remainColor = '#a057c2'
  const hoverRemainColor = '#7f31a3'
  const earnColor = '#4daa61'
  const hoverEarnColor = '#2b9442'
  const adjustColor = '#bdbe66'
  const hoverAdjustColor = '#a2a33d'
  const spentColor = '#f06399'
  const hoverSpentColor = '#d63673'
  const hoverExpiredColor = '#cc4040'
  const { words, lang } = useLang()
  const [currentAllFilter, setCurrentAllFilter] = useState<'all' | 'this year' | 'this month'>('all')
  const [currentAvailableFilter, setCurrentAvailableFilter] = useState<'all' | 'this year' | 'this month'>('all')
  const [currentExpiredFilter, setCurrentExpiredFilter] = useState<'all' | 'this year' | 'this month'>('all')
  const [currentFilter, setCurrentFilter] = useState<'all' | 'available' | 'expired'>('all')
  const [dashboardData, setDashboardData] = useState<TDashboardReport>()
  const [showChartDialog, setShowChartDialog] = useState(false)
  const [statisticLoading, setStatisticLoading] = useState(false)
  const [currentMember, setCurrentMember] = useState<string>()
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [currentStatistic, setCurrentStatistic] = useState({
    labels: [''],
    datasets: [{
      label: words['points'],
      data: [0],
      fill: false,
      borderColor: totalColor,
      tension: 0.4
    }]
  })
  const [membersPieChartData, setMembersPieChartData] = useState({
    label: [words['available'], words['expired']],
    datasets: [{
      data: [dashboardData?.summaryData.available.count ?? 0,
      dashboardData?.summaryData.expired.count ?? 0],
      backgroundColor: [availableColor, expiredColor],
      hoverBackgroundColor: [hoverAvailableColor, hoverExpiredColor]
    }]
  })
  const [pointsPieChartData, setPointsPieChartData] = useState({
    label: [words['earn'], words['adjust'], words['spent'], words['remain']],
    datasets: [{
      data: [dashboardData?.points.earned ?? 0,
      dashboardData?.points.adjust ?? 0,
      dashboardData?.points.spend,
      dashboardData?.points.total],
      backgroundColor: [earnColor,
        adjustColor,
        spentColor,
        remainColor],
      hoverBackgroundColor: [hoverEarnColor,
        hoverAdjustColor,
        hoverSpentColor,
        hoverRemainColor]
    }]
  })
  const { dashboard } = useApi()
  const dashboardReport = dashboard.useDashboardReport({
    onSuccess: r => {
      setDashboardData({
        ...r,
        newMembers: r.newMembers.length > 0 ?
          r.newMembers : r.topPointsMembers
      })
      setMembersPieChartData(p => ({
        ...p,
        datasets: [{
          ...p.datasets[0],
          data: [r.summaryData.available.count, r.summaryData.expired.count]
        }]
      }))
      setPointsPieChartData(p => ({
        ...p,
        datasets: [{
          ...p.datasets[0],
          data: [r.points.earned, r.points.adjust, r.points.spend, r.points.total]
        }]
      }))
    },
    onError: e => {
      showToast({
        detail: e.message ?? (e.status ?? words['something went wrong']),
        summary: words['error'],
        severity: 'error',
        life: 5000
      })
    },
    enabled: false
  })
  const memberStatistic = dashboard.useMemberStatistic({
    onSuccess: r => {
      setStatisticLoading(false)
      const labels = r.points.map(p =>
        // new Date(p.timestamp).toCustomString('english', false, { dateOption: { splitter: '-' } })
        textFromDate(new Date(p.timestamp), 'english', false, { dateOption: { splitter: '-' } })
      )
      setCurrentStatistic(p => ({
        ...p, labels, datasets: [{
          label: words['points'],
          data: r.points.map(v => v.points),
          fill: false,
          borderColor: totalColor,
          tension: 0.4
        }]
      }))
    },
    onError: e => {
      setStatisticLoading(false)
      showToast({
        summary: words['error'],
        detail: e.message ?? (e.status ?? words['something went wrong']),
        severity: 'error',
        life: 5000
      })
    },
  })
  const filterItems: MenuItem[] = [{
    label: words['all'],
    command: () => {
      if (currentFilter == 'all') return setCurrentAllFilter('all')
      if (currentFilter == 'available') return setCurrentAvailableFilter('all')
      setCurrentExpiredFilter('all')
    }
  }, {
    label: firstUpper(!words['this'] || !words['year'] || lang == "english" ?
      'this year' : (lang == "khmer" ?
        `${words["year"]}${words['this']}` : `${words['this']} ${words['year']}`)),
    command: () => {
      if (currentFilter == 'all') return setCurrentAllFilter('this year')
      if (currentFilter == 'available') return setCurrentAvailableFilter('this year')
      setCurrentExpiredFilter('this year')
    }
  }, {
    label: firstUpper(!words['this'] || !words['month'] || lang == 'english' ?
      'this month' : (lang == 'khmer' ?
        `${words['month']}${words['this']}` : `${words['this']} ${words['month']}`)),
    command: () => {
      if (currentFilter == 'all') return setCurrentAllFilter('this month')
      if (currentFilter == 'available') setCurrentAvailableFilter('this month')
      setCurrentExpiredFilter('this month')
    }
  }]
  const allFilterRef = useRef<Menu | null>(null)
  const availableFilterRef = useRef<Menu | null>(null)
  const expiredFilterRef = useRef<Menu | null>(null)
  const getAllMembersDiff = () => {
    if (currentAllFilter == 'all') {
      return dashboardData?.summaryData.all.count ?? 0
    }
    if (currentAllFilter == 'this year') {
      if (!dashboardData) return 0
      return dashboardData.summaryData.all.current.year
    }
    return dashboardData?.summaryData.all.current.month ?? 0
  }
  const getAvailableMembersDiff = () => {
    if (currentAvailableFilter == 'all') {
      return dashboardData?.summaryData.available.count ?? 0
    }
    if (currentAvailableFilter == 'this year') {
      if (!dashboardData) return 0
      return dashboardData.summaryData.available.current.year
    }
    return dashboardData?.summaryData.available.current.month ?? 0
  }
  const getExpiredMembersDiff = () => {
    if (currentExpiredFilter == 'all') {
      return dashboardData?.summaryData.expired.count ?? 0
    }
    if (currentExpiredFilter == 'this year') {
      if (!dashboardData) return 0
      return dashboardData.summaryData.expired.current.year
    }
    return dashboardData?.summaryData.expired.current.month ?? 0
  }
  const getDiffSign = (filter: 'all' | 'available' | 'expired'): (TSign | undefined) => {
    if (!dashboardData) return
    switch (filter) {
      case 'all':
        if (currentAllFilter == 'all') return
        if (currentAllFilter == 'this year') {
          if (dashboardData.summaryData.all.current.year > 0) return 'ri-add-fill'
          if (dashboardData.summaryData.all.current.year < 0) return 'ri-minus-fill'
          return
        }
        if (dashboardData.summaryData.all.current.month > 0) return 'ri-add-fill'
        if (dashboardData.summaryData.all.current.month < 0) return 'ri-minus-fill'
        return
      case 'available':
        if (currentAvailableFilter == 'all') return
        if (currentAvailableFilter == 'this year') {
          if (dashboardData.summaryData.available.current.year > 0) return 'ri-add-fill'
          if (dashboardData.summaryData.available.current.year < 0) return 'ri-minus-fill'
          return
        }
        if (dashboardData.summaryData.available.current.month > 0) return 'ri-add-fill'
        if (dashboardData.summaryData.available.current.month < 0) return 'ri-minus-fill'
        return
      default:
        if (currentExpiredFilter == 'all') return
        if (currentExpiredFilter == 'this year') {
          if (dashboardData.summaryData.expired.current.year > 0) return 'ri-add-fill'
          if (dashboardData.summaryData.expired.current.year < 0) return 'ri-minus-fill'
          return
        }
        if (dashboardData.summaryData.expired.current.month > 0) return 'ri-add-fill'
        if (dashboardData.summaryData.expired.current.month < 0) return 'ri-minus-fill'
        return
    }
  }
  const getIncrSign = (filter: 'all' | 'available' | 'expired'): (TIncrSign | undefined) => {
    if (!dashboardData) return
    switch (filter) {
      case 'all':
        if (currentAllFilter == 'all') return
        if (currentAllFilter == 'this year') {
          if (dashboardData.summaryData.all.current.year > dashboardData.summaryData.all.previous.year)
            return { icon: 'ri-arrow-up-s-fill', color: 'lime' }
          if (dashboardData.summaryData.all.current.year < dashboardData.summaryData.all.previous.year)
            return { icon: 'ri-arrow-down-s-fill', color: 'pink' }
          return
        }
        if (dashboardData.summaryData.all.current.month > dashboardData.summaryData.all.previous.month)
          return { icon: 'ri-arrow-up-s-fill', color: 'lime' }
        if (dashboardData.summaryData.all.current.month < dashboardData.summaryData.all.previous.month)
          return { icon: 'ri-arrow-down-s-fill', color: 'pink' }
        return
      case 'available':
        if (currentAvailableFilter == 'all') return
        if (currentAvailableFilter == 'this year') {
          if (dashboardData.summaryData.available.current.year > dashboardData.summaryData.available.previous.year)
            return { icon: 'ri-arrow-up-s-fill', color: 'lime' }
          if (dashboardData.summaryData.available.current.year < dashboardData.summaryData.available.previous.year)
            return { icon: 'ri-arrow-down-s-fill', color: 'pink' }
          return
        }
        if (dashboardData.summaryData.available.current.month > dashboardData.summaryData.available.previous.month)
          return { icon: 'ri-arrow-up-s-fill', color: 'lime' }
        if (dashboardData.summaryData.available.current.month < dashboardData.summaryData.available.previous.month)
          return { icon: 'ri-arrow-down-s-fill', color: 'pink' }
        return
      default:
        if (currentExpiredFilter == 'all') return
        if (currentExpiredFilter == 'this year') {
          if (dashboardData.summaryData.expired.current.year > dashboardData.summaryData.expired.previous.year)
            return { icon: 'ri-arrow-up-s-fill', color: 'lime' }
          if (dashboardData.summaryData.expired.current.year < dashboardData.summaryData.expired.previous.year)
            return { icon: 'ri-arrow-down-s-fill', color: 'pink' }
          return
        }
        if (dashboardData.summaryData.expired.current.month > dashboardData.summaryData.expired.previous.month)
          return { icon: 'ri-arrow-up-s-fill', color: 'lime' }
        if (dashboardData.summaryData.expired.current.month < dashboardData.summaryData.expired.previous.month)
          return { icon: 'ri-arrow-down-s-fill', color: 'pink' }
        return
    }
  }

  const clear = () => {
    replace('')
    show()
  }
  useEffect(() => {
    dashboardReport()
    replace(words['loyalty program dashboard'])
    hide()
    // const d: WsDataReq<any> = {
    //   dataType: 'data',
    //   data: 'hello',
    //   sender: 'biztools',
    //   receivers: ['admin']
    // }
    // ws?.send(JSON.stringify(d))
    return clear
  }, [])
  useEffect(() => {
    if (!currentMember) return
    setStatisticLoading(true)
    memberStatistic({
      oid: currentMember,
      pointType: 'a'
    })
  }, [currentMember])
  return <BasePage hideTitle>
    <div className="dashboard-container">
      <img className="dashboard-bg" src={bg} alt="bg" />
      <div className="dashboard-front">
        <div className="summary-container">
          <div className="summary-card total-all">
            <div className="summary-card-bg">
              <div className="card-left">
                <div className="left-icon">
                  <i className="ri-team-fill"></i>
                </div>
                {currentAllFilter != 'all' ?
                  <div className="left-diff"
                    style={{
                      color: getDiffSign('all') == 'ri-add-fill' ? 'lime' :
                        getDiffSign('all') == 'ri-minus-fill' ? 'pink' : undefined
                    }}>
                    <span className="card-sign">
                      {getDiffSign('all') && <i className={getDiffSign('all')}></i>}
                    </span>
                    <span className="card-incr" >
                      <AnimatedNumber
                        animateToNumber={getAllMembersDiff()}
                        locale="en-US"
                        includeComma />
                    </span>
                    {getIncrSign('all') &&
                      <span style={{ color: getIncrSign('all')?.color }}>
                        <i className={getIncrSign('all')?.icon}></i>
                      </span>}
                  </div> :
                  < div className="left-diff">
                  </div>
                }
              </div>
              <div className="card-right">
                <div className="card-title" >{capitalize(words["total members"])}</div>
                <div className="card-value" >
                  <AnimatedNumber
                    animateToNumber={dashboardData?.summaryData.all.count ?? 0}
                    locale="en-US"
                    includeComma />
                </div>
                <div className="card-filter">
                  <ButtonComponent
                    onClick={e => {
                      allFilterRef.current?.toggle(e)
                      setCurrentFilter('all')
                    }}
                    cssClass="e-small e-flat"
                    content={firstUpper(words[currentAllFilter])}
                    iconCss="ri-filter-fill"
                    aria-controls='filter-items'
                    aria-haspopup
                    style={{ color: '#fff' }} />
                  <Menu
                    appendTo={document.body}
                    aria-controls="filter-items"
                    aria-haspopup
                    model={filterItems}
                    popup
                    ref={allFilterRef} />
                </div>
              </div>
            </div>
          </div>
          <div className="summary-card total-available">
            <div className="summary-card-bg">
              <div className="card-left">
                <div className="left-icon">
                  <i className="ri-team-fill"></i>
                </div>
                {currentAvailableFilter != 'all' ?
                  <div
                    className="left-diff"
                    style={{ color: getDiffSign('available') == 'ri-add-fill' ? 'lime' : 'pink' }}>
                    <span className="card-sign">
                      {getDiffSign('available') && <i className={getDiffSign('available')}></i>}
                    </span>
                    <span className="card-incr">
                      <AnimatedNumber
                        animateToNumber={getAvailableMembersDiff()}
                        locale="en-US"
                        includeComma />
                    </span>
                    {getIncrSign('available') &&
                      <span style={{ color: getIncrSign('available')?.color }}>
                        <i className={getIncrSign('available')?.icon}></i>
                      </span>
                    }
                  </div> : <div className="left-diff"></div>
                }
              </div>
              <div className="card-right">
                <div className="card-title">{capitalize(words["available members"])}</div>
                <div className="card-value">
                  <AnimatedNumber
                    animateToNumber={dashboardData?.summaryData.available.count ?? 0}
                    includeComma
                    locale="en-US" />
                </div>
                <div className="card-filter">
                  <Menu
                    model={filterItems}
                    appendTo={document.body}
                    popup
                    ref={availableFilterRef} />
                  <ButtonComponent onClick={e => {
                    availableFilterRef.current?.toggle(e)
                    setCurrentFilter('available')
                  }}
                    cssClass="e-small e-flat"
                    content={words[currentAvailableFilter]}
                    iconCss="ri-filter-fill"
                    style={{ color: '#fff' }} />
                </div>
              </div>
            </div>
          </div>
          <div className="summary-card total-expired">
            <div className="summary-card-bg">
              <div className="card-left">
                <div className="left-icon">
                  <i className="ri-team-fill"></i>
                </div>
                {currentExpiredFilter != 'all' ?
                  <div
                    className="left-diff"
                    style={{ color: getDiffSign('expired') == 'ri-add-fill' ? 'lime' : 'pink' }}>
                    <span className="card-sign">
                      {getDiffSign('expired') && <i className={getDiffSign('expired')}></i>}
                    </span>
                    <span className="card-incr">
                      <AnimatedNumber
                        animateToNumber={getExpiredMembersDiff()}
                        locale="en-US"
                        includeComma />
                    </span>
                    {getIncrSign('expired') &&
                      <span style={{ color: getIncrSign('expired')?.color }}>
                        <i className={getIncrSign('expired')?.icon}></i>
                      </span>
                    }
                  </div> :
                  <div className="left-diff"></div>
                }
              </div>
              <div className="card-right">
                <div className="card-title">{capitalize(words['expired members'])}</div>
                <div className="card-value">
                  <AnimatedNumber
                    animateToNumber={dashboardData?.summaryData.expired.count ?? 0}
                    locale="en-US"
                    includeComma />
                </div>
                <div className="card-filter">
                  <Menu
                    model={filterItems}
                    appendTo={document.body}
                    popup
                    ref={expiredFilterRef}
                    onChange={e => alert(e.currentTarget)} />
                  <ButtonComponent
                    onClick={e => {
                      expiredFilterRef.current?.toggle(e)
                      setCurrentFilter('expired')
                    }}
                    cssClass="e-small e-flat"
                    content={words[currentExpiredFilter]}
                    iconCss="ri-filter-fill"
                    style={{ color: '#fff' }} />
                </div>
              </div>
            </div>
          </div>
          <div className="summary-chart" style={{ minWidth: 200 }}>
            <div className="chart-content">
              <span style={{ fontSize: 12, color: '#fff' }}>
                {toAnnotateNumber(dashboardData?.summaryData.all.count ?? 0, true)}
              </span>
              <div style={{ position: 'absolute', transform: 'translateY(-4px)' }}>
                <Chart
                  type="doughnut"
                  data={membersPieChartData}
                  height="113px"
                  width="113px"
                  options={{
                    cutout: '70%',
                    elements: { arc: { borderWidth: 0 } },
                    animation: { duration: 1000 }
                  }} />
              </div>
            </div>
            <div className="chart-legend">
              <div className="legend-value">
                <span className="legend-bar all-color"></span>
                <span>{firstUpper(words['all'])}</span>
              </div>
              <div className="legend-value">
                <span className="legend-bar available-color"></span>
                <span>{firstUpper(words['available'])}</span>
              </div>
              <div className="legend-value">
                <span className="legend-bar expired-color"></span>
                <span>{firstUpper(words['expired'])}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="dashboard-body">
          <div className="dashboard-body-part">
            <div className="dashboard-body-card">
              <div className="dashboard-card-title">{capitalize(words['total points'])}</div>
              <div className="chart-details">
                <div className="chart-wrap">
                  <div className="chart-content"
                    style={{ backgroundColor: totalColor }}>
                    <div style={{ color: '#fff' }}>
                      {toAnnotateNumber((dashboardData?.points.earned ?? 0) + (dashboardData?.points.adjust ?? 0))}
                    </div>
                    <div style={{
                      position: 'absolute',
                      transform: 'translate(1px,-4px)'
                    }}>
                      <Chart
                        type="doughnut"
                        data={pointsPieChartData}
                        width="calc((100vw / 8) + 14px)"
                        height="calc((100vw / 8) + 14px)"
                        options={{
                          cutout: '70%',
                          elements: { arc: { borderWidth: 1 } },
                          animation: { duration: 1000 }
                        }} />
                    </div>
                  </div>
                </div>
                <div className="chart-legend">
                  <div className="legend-value">
                    <div className="legend-bar" style={{ backgroundColor: totalColor }}></div>
                    <span>{firstUpper(words['total'])}</span>
                  </div>
                  <div className="legend-value">
                    <div className="legend-bar" style={{ backgroundColor: earnColor }}></div>
                    <span>{firstUpper(words['earn'])}</span>
                  </div>
                  <div className="legend-value">
                    <div className="legend-bar" style={{ backgroundColor: adjustColor }}></div>
                    <span>{firstUpper(words['adjust'])}</span>
                  </div>
                  <div className="legend-value">
                    <div className="legend-bar" style={{ backgroundColor: spentColor }}></div>
                    <span>{firstUpper(words['spent'])}</span>
                  </div>
                  <div className="legend-value">
                    <div className="legend-bar" style={{ backgroundColor: remainColor }}></div>
                    <span>{firstUpper(words['remain'])}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="dashboard-body-card">
              <div className="dashboard-card-title">{capitalize(words["new members"])} {dashboardData && dashboardData.newMembers.length > 0 &&
                `(${dashboardData.newMembers.length} ${words['members']})`}</div>
              <div className="details-list"
                style={{ maxHeight: 'calc(100vh / 3)', overflowY: 'auto' }}>
                {dashboardData && dashboardData.newMembers.length > 0 ?
                  dashboardData.newMembers.map((d, i) =>
                  (<div className="item-wrap new-members-l" key={d.number + i}>
                    <div className="item-card">
                      <div className="left-side">
                        <div className="member-name">{d.name}</div>
                        <div className="member-info">
                          <div className="member-number">{d.number}</div>
                          <div className="member-date">
                            {d.registeredDate ?
                              '| ' +
                              // new Date(d.registeredDate).toCustomString('english', false, { dateOption: { splitter: '-' } })
                              textFromDate(new Date(d.registeredDate),
                                'english',
                                false,
                                { dateOption: { splitter: '-' } })
                              : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>)) : <div className="details-no-data">
                    <span>
                      {words["no data yet"]}
                    </span>
                  </div>}
              </div>
            </div>
          </div>
          <div className="dashboard-body-part">
            <div className="dashboard-body-card">
              <div className="dashboard-card-title">{capitalize(words["top 10 earn points members"])}</div>
              <div className="details-list"
                style={{ maxHeight: 'calc(100vh / 3)', overflowY: 'auto' }}>
                {dashboardData && dashboardData.topPointsMembers.length > 0 ?
                  dashboardData.topPointsMembers.map((d, i) =>
                  (<div key={d.number + i} className="item-wrap no-pointer">
                    <div className="item-card">
                      <div className="left-side">
                        <div className="member-name">
                          {d.name}
                        </div>
                        <div className="member-info">
                          <div className="member-number">{d.number}</div>
                          <div className="member-date">
                            {d.registeredDate ?
                              '| ' +
                              // new Date(d.registeredDate).toCustomString('english', false, { dateOption: { splitter: '-' } })
                              textFromDate(new Date(d.registeredDate),
                                'english',
                                false,
                                { dateOption: { splitter: '-' } })
                              : null}
                          </div>
                        </div>
                      </div>
                      <div className="right-side" style={{ color: earnColor }}>
                        {toAnnotateNumber(d.points)}
                      </div>
                    </div>
                  </div>)) : <div className="details-no-data">
                    <span>
                      {words["no data yet"]}
                    </span>
                  </div>}
              </div>
            </div>
            <div className="dashboard-body-card">
              <div className="dashboard-card-title">{capitalize(words["top 10 spent points members"])}</div>
              <div className="details-list" style={{ maxHeight: 'calc(100vh / 3)', overflowY: 'auto' }}>
                {dashboardData && dashboardData.topSpendingMembers.length > 0 ?
                  dashboardData.topSpendingMembers.map((d, i) =>
                  (<div key={d.number + i} className="item-wrap no-pointer">
                    <div className="item-card ">
                      <div className="left-side">
                        <div className="member-name">
                          {d.name}
                        </div>
                        <div className="member-info">
                          <div className="member-number">{d.number}</div>
                          <div className="member-date">
                            {d.registeredDate ? '| ' +
                              // new Date(d.registeredDate).toCustomString('english', false, { dateOption: { splitter: '-' } })
                              textFromDate(new Date(d.registeredDate),
                                'english',
                                false,
                                { dateOption: { splitter: '-' } })
                              : null}
                          </div>
                        </div>
                      </div>
                      <div className="right-side" style={{ color: spentColor }}>
                        {toAnnotateNumber(d.points)}
                      </div>
                    </div>
                  </div>)) : <div className="details-no-data">
                    <span>
                      {words["no data yet"]}
                    </span>
                  </div>}
              </div>
            </div>
          </div>
          <div className="dashboard-body-part">
            <div className="dashboard-body-card">
              <div className="dashboard-card-title">{capitalize(words["top 10 points members"])}</div>
              <div className="details-list"
                style={{ maxHeight: 'calc(100vh - 240px)', overflowY: 'auto' }}>
                {dashboardData && dashboardData.totalPointsMembers.length > 0 ?
                  dashboardData.totalPointsMembers.map((d, i) => (<div key={d.number + i}
                    onClick={() => {
                      setCurrentMember(d.oid)
                      setShowChartDialog(true)
                    }} className="item-wrap">
                    <div className="item-card">
                      <div className="left-side">
                        <div className="member-name">
                          {d.name}
                        </div>
                        <div className="member-info">
                          <div className="member-number">{d.number}</div>
                          <div className="member-date">
                            {d.registeredDate ? '| ' +
                              // new Date(d.registeredDate).toCustomString('english', false, { dateOption: { splitter: '-' } })
                              textFromDate(new Date(d.registeredDate),
                                'english',
                                false,
                                {
                                  dateOption: { splitter: '-' }
                                })
                              : null}
                          </div>
                        </div>
                      </div>
                      <div className="right-side">{
                        toAnnotateNumber(d.points)
                      }</div>
                    </div>
                  </div>)) : <div className="details-no-data">
                    <span>
                      {words["no data yet"]}
                    </span>
                  </div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Dialog
      resizable={false}
      closeIcon={<i className="ri-close-line"></i>}
      footer={<div>
        <ButtonComponent
          onClick={() => setShowDetailsDialog(true)}
          content={words['details']}
          cssClass="e-small e-success"
          iconCss="ri-external-link-fill" />
      </div>}
      style={{ minWidth: 400 }}
      visible={showChartDialog}
      onHide={() => setShowChartDialog(false)}
      header={<div style={{ display: 'flex' }}>
        {dashboardData?.totalPointsMembers.find(d => d.oid == currentMember)?.name}
      </div>
      }>
      <div
        className="chart-line"
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {statisticLoading ? <ProgressSpinner /> :
          (currentStatistic ? <Chart
            style={{ minWidth: 600 }}
            options={{ plugins: { legend: { display: false } } }}
            type="line"
            data={currentStatistic} /> :
            <div className="statistic-no-data"></div>)}
      </div>
    </Dialog>
    <Dialog
      resizable={false}
      closeIcon={<i className="ri-close-line"></i>}
      visible={showDetailsDialog}
      onHide={() => setShowDetailsDialog(false)}>
      <ClientDetails
        data={{
          oid: currentMember ?? '',
          years: 0,
          days: 0,
          months: 0,
          status: 'need-fetch',
          gender: '',
          clientGroup: '',
          createdBy: '',
          createdAt: new Date()
        }} />
    </Dialog>
  </BasePage >
}
export default Dashboard