import { InputTextarea } from "primereact/inputtextarea";
import { ChangeEvent, FC, useEffect, useRef } from "react";

const StateTextArea: FC<{
  disabled: boolean,
  initialValue?: string,
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void,
  style?: any
}> = ({
  disabled,
  initialValue,
  onChange,
  style
}) => {
    const inputRef = useRef<HTMLTextAreaElement | null>(null)
    useEffect(() => {
      if (initialValue && inputRef.current) {
        inputRef.current.value = initialValue;
      }
    }, [])
    return (
      <InputTextarea
        className="no-resize"
        ref={inputRef}
        disabled={disabled}
        onChange={onChange}
        style={style ?? { flex: 1 }}
      />
    )
  }
export default StateTextArea;