import { FC, ReactNode, createContext, useContext, useState } from "react"

type TSearchBoxContextProps = {
  search: (v: string) => void
  defineOnSearch: (fn: (v: string) => void) => void
  hide: () => void
  show: () => void
  visibility: 'hide' | 'show'
  clear: (thenSearch?: boolean) => void
  onChange: (v: string) => void
  replacement?: string
  replace: (v: string) => void
  value: string
}
const SearchBoxContext = createContext<TSearchBoxContextProps>({
  search: _ => { },
  clear: (_) => { },
  hide: () => { },
  show: () => { },
  visibility: 'show',
  value: '',
  onChange: _ => { },
  replace: _ => { },
  defineOnSearch: _ => { }
})
export const SearchBoxProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [value, setValue] = useState('')
  const [search, setSearch] = useState<(v: string) => void>(_ => { })
  const [visibility, setVisibility] = useState<'hide' | 'show'>('show')
  const [replacement, setReplacement] = useState<string>()
  const onChange = (v: string) => setValue(_ => v)
  const defineOnSearch = (fn: (v: string) => void) => setSearch(() => fn)
  const clear = (thenSearch?: boolean) => {
    setValue(_ => '')
    if (thenSearch) search('')
  }
  const hide = () => setVisibility('hide')
  const show = () => setVisibility('show')
  const replace = (v: string) => setReplacement(_ => v)
  return <SearchBoxContext.Provider
    value={{
      value,
      hide,
      visibility,
      show,
      clear,
      onChange,
      defineOnSearch,
      search,
      replacement,
      replace
    }} >
    {children}
  </SearchBoxContext.Provider>
}
export const useSearchBox = () => useContext(SearchBoxContext)