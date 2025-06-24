import { FC } from "react";
import SideBar from "./components/side-bar";
import '../../assets/css/home.css'
import TopBar from "./components/top-bar";
import { DrawerProvider } from "../../providers";
import Drawer from "./components/drawer";
import { useSidebar } from "../../providers/side-bar-provider";
import BottomBar from "./components/bottom-bar";
import RoutesProvider from "../../providers/routes-provider";
import { SearchBoxProvider } from "../../providers/search-box-provider";

const Home: FC = () => {
  const { isOpen } = useSidebar()
  return (
    <DrawerProvider>
      <SearchBoxProvider>
        <div className={`home-container ${isOpen ? 'side-bar-open' : 'side-bar-close'}`}>
          <SideBar />
          <Drawer />
          <div className={`home-body ${isOpen ? 'side-bar-open' : 'side-bar-close'}`}>
            <TopBar />
            <div className="home-content">
              <RoutesProvider />
            </div>
            <BottomBar />
          </div>
        </div>
      </SearchBoxProvider>
    </DrawerProvider>
  )
}
export default Home