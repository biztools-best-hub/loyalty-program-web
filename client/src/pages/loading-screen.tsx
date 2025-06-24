import { FC } from "react";
import { ProgressBar } from 'primereact/progressbar'
import '../assets/css/loading-screen.css'

const LoadingScreen: FC = () => {
  return <div className="loading-screen-container">
    <div className="loading-screen-logo-title">
      loyalty program
    </div>
    <ProgressBar
      mode='indeterminate'
      className="loading-screen-progress" />
  </div>
}
export default LoadingScreen