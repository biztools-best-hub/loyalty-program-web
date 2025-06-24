import { FC, useState } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Dashboard from "../pages/dashboard/dashboard";
import ClientList from "../pages/users/client-list/client-list";
import UserAccount from "../pages/settings/user-account/user-account";
import UserList from "../pages/users/user-list/user-list";
import PointsReport from "../pages/points/points-report";
import EventsSetup from "../pages/broadcast/events-setup/events-setup";
import AccessRight from "../pages/settings/access-right/access-right";
import { useUser } from "./user-provider";
import Announcement from "../pages/broadcast/announcement/announcement";
const routItems = [{
  id: "home",
  path: "/",
  element: <Dashboard />
}, {
  id: "user-list",
  path: "/user-list",
  element: <UserList />
}, {
  id: "client-list",
  path: "/client-list",
  element: <ClientList />,
}, {
  id: "points-report",
  path: "/points-report",
  element: <PointsReport />
}, {
  id: "announcement",
  path: "/announcement",
  element: <Announcement />
}, {
  id: "event-setup",
  path: "/event-setup",
  element: <EventsSetup />
},
{
  id: "user-account",
  path: "/user-account",
  element: <UserAccount />
},
//  {
//   id: "app",
//   path: "/app",
//   element: <Application />
// }, 
{
  id: 'access-right',
  path: '/access-right',
  element: <AccessRight />
},
{
  id: "not-found",
  path: "*",
  element: <Dashboard />
}]

const RoutesProvider: FC = () => {
  const { user } = useUser()
  const [routes] = useState(createBrowserRouter(user?.currentRole &&
    user.currentRole.toLowerCase() == 'admin' ?
    routItems : routItems.filter(v => v.id != 'access-right')))
  // useEffect(() => {
  //   setRoutes(createBrowserRouter(user?.currentRole && user.currentRole.toLowerCase() == 'admin' ? routItems : routItems.filter(v => v.id != 'access-right')))
  // }, [user])
  return <RouterProvider router={routes} />
}
export default RoutesProvider