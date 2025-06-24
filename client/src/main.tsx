import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import {
  LangProvider,
  ThemeProvider,
  ToastProvider,
  TokenProvider,
  UserProvider
} from './providers'
import { QueryClient, QueryClientProvider } from 'react-query'
import ApiProvider from './providers/api-provider'
// import WsProvider from './providers/ws-provider'
import { PrimeReactProvider } from 'primereact/api'
import WsProvider from './providers/ws-provider'
// import { createSignalRContext } from 'react-signalr'
const clientQuery = new QueryClient()
// const SignalRContext = createSignalRContext();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <PrimeReactProvider value={{ appendTo: 'self', cssTransition: true, ripple: true, autoZIndex: true }}>
      <QueryClientProvider client={clientQuery}>
        <ThemeProvider>
          <ToastProvider>
            <TokenProvider>
              <ApiProvider>
                <WsProvider>
                  <LangProvider>
                    <UserProvider>
                      {/* <SignalRContext.Provider connectEnabled={true} > */}
                      <App />
                      {/* </SignalRContext.Provider> */}
                    </UserProvider>
                  </LangProvider>
                </WsProvider>
              </ApiProvider>
            </TokenProvider>
          </ToastProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </PrimeReactProvider>
  </React.StrictMode>,
)
type FullOption = {
  dateOption: DateOption
  timeOption?: TimeOption
}
type DateOption = {
  monthMode?: 'name' | 'number'
  withDayName?: boolean
  format?: '00' | '0'
  splitter?: '-' | '/' | '.' | ',' | ' '
}
type TimeOption = {
  format?: 'h' | 'hh' | 'h m' | 'h mm' | 'hh mm' | 'hh m' | 'h m s' | 'h m ss' | 'h mm s' |
  'hh m s' | 'h mm ss' | 'hh mm s' | 'hh m ss' | 'hh mm ss',
  mode?: '24h' | '12h'
  splitter?: ':' | '-' | ',' | ' '
}
declare global {
  interface String {
    isCurrentDate(): boolean
    firstUpper(): string
    toAmPmTime(): string
  }
  interface Date {
    toCustomString(lang: 'english' | 'khmer', withTime: boolean, opt: FullOption): string
  }
}
