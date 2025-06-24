import { TApiRoutes, TMenuItem } from "../types"
export const linkColors = {
  light: {
    main: '#673AB7',
    disabled: '#ddd'
  },
  dark: {
    main: '#CE93D8',
    disabled: '#777'
  }
}
export const rowsPerPage = [20, 50, 100]
export const syncFusionThemes = {
  light: '/themes/material.css',
  dark: '/themes/material-dark.css'
}
export const themes = {
  light: '/themes/lara-light-purple/theme.css',
  dark: '/themes/lara-dark-purple/theme.css',
}
export const headerKeys = {
  token: 'conical-access-token',
  refresh: 'conical-refresh-token',
  device: 'conical-device-id',
  api: 'conical-api-key'
}
const authApi = `/api/auth/`
const posClientApi = `/api/POSClient/`
const pointApi = `/api/LoyaltyProgram/`
const userApi = `/api/user/`
const eventApi = '/api/event/'
const permissionApi = '/api/permission/'
const messageApi = '/api/message/'
export const apiKey = "s24eBL77FCuik/d8BsD9vk+0xnmGK8mNxrWRQT9JfQ0="
export const syncFusionClaimKey = "Mgo+DSMBaFt+QHFqVkNrXVNbdV5dVGpAd0N3RGlcdlR1fUUmHVdTRHRcQlljSn5Rd01gUX9ZcHY=;Mgo+DSMBPh8sVXJ1S0d+X1RPd11dXmJWd1p/THNYflR1fV9DaUwxOX1dQl9gSXpTdUVhWHddeHRdQWI=;ORg4AjUWIQA/Gnt2VFhhQlJBfV5AQmBIYVp/TGpJfl96cVxMZVVBJAtUQF1hSn5XdkZjW35Wc3xURmZe;MTU5MTYwN0AzMjMxMmUzMTJlMzMzNUVRMFpzaHVpaDBER0puaWd2UUp4NGVuL240STNRWXZTcCtvWnFUbmJ2b0k9;MTU5MTYwOEAzMjMxMmUzMTJlMzMzNVVWbnVoZ2Y5Smg0aWY2bEJobjZjOU9UTmcvbnlCZHZ0Rnl4RDZWWitHL1k9;NRAiBiAaIQQuGjN/V0d+XU9Hc1RDX3xKf0x/TGpQb19xflBPallYVBYiSV9jS31TckVgWX1feHddR2lZUw==;MTU5MTYxMEAzMjMxMmUzMTJlMzMzNW55RnE2MnVDcDFBZjJWOTlncXcrNlhXUkxaSDZlQkRBZXlUQWx2QkNvRlE9;MTU5MTYxMUAzMjMxMmUzMTJlMzMzNVVaOTFTdTVSOFRzS3JoTUh0ZFNCeGNjMi9hOTY2TSt3clFyT0ZTa1JQRFk9;Mgo+DSMBMAY9C3t2VFhhQlJBfV5AQmBIYVp/TGpJfl96cVxMZVVBJAtUQF1hSn5XdkZjW35Wc3xXQWle;MTU5MTYxM0AzMjMxMmUzMTJlMzMzNWVlODhScXRYL2tYZzl4R3o2SVZqVEpxcHpZT2VIdjlFcEhGa3RTUHFjZG89;MTU5MTYxNEAzMjMxMmUzMTJlMzMzNWdLMVd3dnE3VVNDRUQrcy9laUNRWWxTOUlrbzEzNElGbzFDd3hkbDlxUDA9;MTU5MTYxNUAzMjMxMmUzMTJlMzMzNW55RnE2MnVDcDFBZjJWOTlncXcrNlhXUkxaSDZlQkRBZXlUQWx2QkNvRlE9"
export const syncFusionLicenseKey = "ORg4AjUWIQA/Gnt2VFhhQlJBfV5AQmBIYVp/TGpJfl96cVxMZVVBJAtUQF1hSn5XdkZjW31ac3VTQmNY"
export const api: TApiRoutes = {
  auth: {
    login: {
      name: 'LOGIN',
      url: `${authApi}login`,
      method: 'POST'
    },
    register: {
      name: 'REGISTER',
      url: `${authApi}register`,
      method: 'POST'
    },
    refresh: {
      name: 'REFRESH',
      url: `${authApi}refresh`,
      method: 'GET'
    },
    me: {
      name: 'ME',
      url: `${authApi}me`,
      method: 'GET'
    },
    changePassword: {
      name: 'CHANGE_PASSWORD',
      url: `${authApi}change-password`,
      method: 'POST'
    }
  },
  posClient: {
    filter: {
      name: 'POS_CLIENT_FILTER',
      url: `${posClientApi}filter`,
      method: 'POST'
    },
    all: {
      name: "POS_CLIENT_ALL",
      url: `${posClientApi}all`,
      method: 'GET'
    },
    get: {
      name: "POS_CLIENT_GET",
      url: posClientApi.substring(0, posClientApi.length - 1),
      method: 'GET'
    },
    remove: {
      name: "POS_CLIENT_REMOVE",
      url: `${posClientApi}remove`,
      method: 'GET'
    },
    update: {
      name: "POS_CLIENT_UPDATE",
      url: `${posClientApi}update`,
      method: 'POST'
    },
    add: {
      name: "POS_CLIENT_ADD",
      url: `${posClientApi}add`,
      method: 'POST'
    },
    briefFilter: {
      name: "BRIEF_POS_CLIENT_FILTER",
      url: `${posClientApi}brief-filter`,
      method: 'POST'
    }
  },
  point: {
    offSetAsync: {
      name: 'OFFSET',
      url: pointApi,
      method: 'POST'
    },
    getPointHistoryAsync: {
      name: 'GET_POINT_HISTORY',
      url: `${pointApi}getPointHistory-v2`,
      method: 'POST'
    },
    pointsSummaryAsync: {
      name: 'POINTS_SUMMARY',
      url: `${pointApi}getPointHistorySummary-v2`,
      method: 'POST'
    },
    singlePointSummaryAsync: {
      name: 'SINGLE_POINT_SUMMARY',
      url: `${pointApi}singlePointHistorySummary`,
      method: 'POST'
    }
  },
  user: {
    usersAsync: {
      url: `${userApi}filter`,
      method: 'POST',
      name: 'USERS'
    },
    switchUserTypeAsync: {
      url: `${userApi}switch-user-type`,
      method: 'GET',
      name: 'SWITCH_USER_TYPE'
    },
    userAsync: {
      url: `${userApi}`,
      method: 'GET',
      name: 'USER'
    },
    updateUserAsync: {
      url: `${userApi}update`,
      method: 'POST',
      name: 'UPDATE_USER'
    },
    addUserAsync: {
      url: `${userApi}add`,
      method: 'PUT',
      name: 'ADD_USER'
    }
  },
  event: {
    filter: {
      url: `${eventApi}filter`,
      method: 'POST',
      name: "FILTER_EVENTS"
    },
    upload: {
      url: `/api/file/upload-event`,
      method: 'POST',
      name: 'UPLOAD_EVENT'
    },
    add: {
      url: `${eventApi}add`,
      method: 'POST',
      name: 'ADD_EVENT'
    },
    remove: {
      url: `${eventApi}remove`,
      method: 'GET',
      name: 'REMOVE_EVENT'
    }
  },
  dashboard: {
    dashboardReportAsync: {
      url: `${pointApi}web-dashboard`,
      name: 'DASHBOARD_DATA',
      method: 'GET'
    },
    memberStatisticAsync: {
      url: `${pointApi}member-statistic`,
      name: 'MEMBER_STATISTIC',
      method: 'POST'
    }
  },
  permission: {
    addOrRemovePermissionsOfUserAsync: {
      url: `${permissionApi}add-or-remove-permissions-of-user`,
      name: 'ADD_OR_REMOVE_PERMISSIONS_OF_USER',
      method: 'POST'
    },
    addOrRemoveUsersOfPermissionAsync: {
      url: `${permissionApi}add-or-remove-users-of-permission`,
      name: 'ADD_OR_REMOVE_USERS_OF_PERMISSION',
      method: 'POST'
    },
    usersOfPermissionAsync: {
      url: `${permissionApi}users-of-permission`,
      name: 'USERS_OF_PERMISSION',
      method: 'GET'
    },
    permissionsOfUserAsync: {
      url: `${permissionApi}permission-of-user`,
      name: 'PERMISSIONS_OF_USER',
      method: 'GET'
    },
    allPermissionsAsync: {
      url: `${permissionApi}all-permissions`,
      name: 'ALL_PERMISSIONS',
      method: 'GET'
    },
    webUsersAsync: {
      url: `${permissionApi}web-users`,
      name: 'WEB_USERS',
      method: 'GET'
    }
  },
  message: {
    getAnnouncements: {
      name: 'GET_ANNOUNCEMENTS',
      url: `${messageApi}get-announcements`,
      method: 'GET'
    },
    uploadAnnouncementImage: {
      name: 'UPLOAD_ANNOUNCEMENT_IMAGE',
      url: `/api/file/upload-announcement-image`,
      method: 'POST'
    },
    broadcast: {
      name: 'BROADCAST',
      url: `${messageApi}broadcast`,
      method: 'POST'
    },
    getLastAnnouncementsCount: {
      name: 'GET_LAST_ANNOUNCEMENTS_COUNT',
      url: `${messageApi}get-last-announcements-count`,
      method: 'GET'
    },
    setLastAnnouncements: {
      name: 'SET_LAST_ANNOUNCEMENTS',
      url: `${messageApi}set-last-announcements`,
      method: 'GET'
    },
    removeAnnouncements: {
      name: 'REMOVE_ANNOUNCEMENTS',
      url: `${messageApi}remove-announcements`,
      method: 'POST'
    }
  }
}
export const initialItems: TMenuItem[] = [{
  label: 'Home',
  icon: 'pi pi-home',
  id: 'home',
  isChild: false,
  expanded: false,
  active: true
},
{
  label: 'Users',
  icon: 'pi pi-users',
  id: 'users',
  expanded: false,
  isChild: false,
  active: false,
  children: [{
    label: 'user list',
    icon: 'pi pi-list',
    id: 'user-list',
    expanded: false,
    isChild: true,
    active: false
  }, {
    label: 'Client List',
    icon: 'pi pi-sitemap',
    id: 'client-list',
    expanded: false,
    isChild: true,
    active: false
  }]
},
{
  label: 'Points',
  icon: 'e-icons e-number-formatting',
  id: 'points',
  expanded: false,
  isChild: false,
  active: false,
  children: [{
    label: 'Points Report',
    icon: 'e-icons e-description',
    id: 'points-report',
    expanded: false,
    isChild: true,
    active: false
  }]
},
{
  label: 'Broadcast',
  icon: 'ri-megaphone-line',
  id: 'broadcast',
  isChild: false,
  active: false,
  expanded: false,
  children: [
    {
      label: 'Announcement',
      icon: 'ri-notification-2-line',
      id: 'announcement',
      isChild: true,
      active: false,
      expanded: false
    },
    {
      label: 'Event Setup',
      icon: 'ri-cake-2-line',
      id: 'event-setup',
      isChild: true,
      active: false,
      expanded: false
    },
  ]
},
{
  label: 'Settings',
  icon: 'pi pi-cog',
  id: 'settings',
  expanded: false,
  isChild: false,
  active: false,
  children: [

    {
      label: 'User Account',
      icon: 'pi pi-user',
      id: 'user-account',
      isChild: true,
      active: false,
      expanded: false
    }, {
      label: 'Access Right',
      icon: 'ri-shield-user-fill',
      id: 'access-right',
      isChild: true,
      active: false,
      expanded: false
    }
    // , {
    //   label: 'Application',
    //   icon: 'pi pi-microsoft',
    //   id: 'app',
    //   isChild: true,
    //   active: false,
    //   expanded: false
    // }
  ]
}]