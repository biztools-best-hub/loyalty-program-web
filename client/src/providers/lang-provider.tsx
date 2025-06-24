import { FC, ReactNode, createContext, useContext, useEffect, useState } from "react"
import { get, set } from "../utils/local-storage-util"
import { useQuery } from "react-query"
import initialLang from "../utils/lang-util"
import LoadingScreen from "../pages/loading-screen"
import { useApi } from "./api-provider"
import { apiKey } from "../constants"

export type TLangContextProps = {
  lang: 'english' | 'khmer',
  words?: any,
  fetched: boolean,
  toggleLang: () => void
}

export type TLanguage = {
  en: string,
  kh: string
}

export const LangContext = createContext<TLangContextProps>({
  lang: get('conical-lang') != 'khmer' ? 'english' : 'khmer',
  toggleLang: () => { },
  fetched: false
})

async function fetchLang(api: string): Promise<any> {
  const res = await fetch(api, { headers: { "conical-api-key": apiKey } })
  if (res.status != 200) throw res.status;
  const data: any = await res.json()
  return data
}
const LangProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { apiUrl } = useApi()
  const [lang, setLang] = useState<'english' | 'khmer'>(get('conical-lang') != 'khmer' ?
    'english' : 'khmer')
  const [words, setWords] = useState<any>(initialLang[lang])
  const [fetched, setFetched] = useState(false)
  const { refetch } = useQuery('FETCH_LANG',
    () => fetchLang(`${apiUrl}/api/get-language`),
    {
      retry: false,
      enabled: false,
      refetchOnMount: true,
      onError: () => setFetched(true),
      onSuccess: (r) => {
        try {
          const wordsJsonFromLocal = get('conical-words')
          const wordsFromLocal = JSON.parse(wordsJsonFromLocal)[lang]
          for (let w in wordsFromLocal) {
            if (!r[w]) {
              r[w] = wordsFromLocal[w];
              continue
            }
            for (let ww in wordsFromLocal[w]) {
              if (r[w][ww]) continue
              r[w][ww] = wordsFromLocal[w][ww]
            }
          }
        } catch (error) {
        }
        set({ key: 'conical-words', value: r })
        setFetched(true)
        triggerWords(r[lang])
      }
    })
  const toggleLang = () => {
    setLang(_ => lang === 'english' ? 'khmer' : 'english')
    set({ key: 'conical-lang', value: lang === 'khmer' ? 'english' : 'khmer' })
  }
  function triggerWords(words?: any) {
    if (words) {
      if (initialLang[lang]) {
        for(let w in initialLang[lang]){
          if(words[w]) continue;
          words[w]=initialLang[lang][w]
        }
      }
      setWords(() => words)
      return
    }
    try {
      const wordsJsonFromLocal = get('conical-words')
      const wordsFromLocal = JSON.parse(wordsJsonFromLocal)[lang]
      if (initialLang[lang]) {
        if (!wordsFromLocal[lang]) wordsFromLocal[lang] = initialLang[lang];
        else {
          for (let w in initialLang[lang]) {
            if (wordsFromLocal[lang][w]) continue
            wordsFromLocal[lang][w] = initialLang[lang][w]
          }
        }
      }
      setWords(() => wordsFromLocal[lang])
    } catch (error) {
      setWords(() => initialLang[lang])
    }
  }
  useEffect(() => {
    if (apiUrl) refetch()
  }, [apiUrl])
  useEffect(() => {
    triggerWords()
  }, [lang])
  return (
    <LangContext.Provider
      value={{
        lang,
        toggleLang,
        words,
        fetched
      }}>
      {!fetched ? <LoadingScreen /> : children}
    </LangContext.Provider>
  )
}
export default LangProvider
export const useLang = () => useContext(LangContext)