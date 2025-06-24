import { FC } from "react";
import BasePage from "../../base-page";
import UnderDevelopmentSign from "../../others/under-dev";
const Application: FC = () => {
  return <BasePage hideTitle>
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
      <UnderDevelopmentSign />
    </div>
  </BasePage>
}
export default Application