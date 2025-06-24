import { InputText } from "primereact/inputtext";
import { ChangeEvent, FC, useEffect, useRef } from "react";

const StateInput: FC<{
  disabled: boolean,
  initialValue?: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
}> = ({ disabled, initialValue, onChange }) => {
  let inputRef = useRef<HTMLInputElement | null>(null)
  useEffect(() => {
    if (initialValue && inputRef.current) {
      inputRef.current.value = initialValue;
    }
  }, [])
  return (
    <InputText
      disabled={disabled}
      ref={inputRef}
      onChange={onChange}
      id="event-title" />

  )
}
export default StateInput;