import { FC } from "react";
import best from '../../../assets/images/best.png'
import { useApi } from "../../../providers/api-provider";
import { useSidebar } from "../../../providers/side-bar-provider";

const BiztoolsLogo: FC = () => {
  const { companyName } = useApi()
  const { isOpen } = useSidebar()
  if (companyName.toLowerCase().startsWith('biztools'))
    return (
      <div className="biztools-logo">
        <div className="best">
          B E S T
        </div>
        <div className="full">
          iztools nterprise olution echnology
        </div>
        <div className="kh-container">
          <div className="kh-val">
            <img
              className="best-img"
              src={best} />
          </div>
          <div className="kh-bot"></div>
        </div>
      </div>
    );
  else return (
    <div>
      <img src={`/images/sidebar-logo-${isOpen ? 'full' : 'small'}.png`} alt="sidebar-logo" style={{ maxHeight: 70 }} />
    </div>
  );
}
export default BiztoolsLogo