import { FC } from "react";
import '../../assets/css/under-dev.css'

const UnderDevelopmentSign: FC = () => {
  return <div className="under-dev">
    <div>
      <i className="pi pi-cog c1" />
      <i className="pi pi-cog c2" />
    </div>
    <span className="under-dev-title">
      Under Development
    </span>
    <span className="under-dev-description">
      This feature isn't yet available. So, please stay tune.
    </span>
  </div>
}
export default UnderDevelopmentSign