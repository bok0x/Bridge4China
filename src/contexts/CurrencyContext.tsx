"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from "react"

export type Currency = "USD" | "MAD" | "RMB"

const RATES: Record<Currency, number> = { USD: 1, MAD: 10.1, RMB: 7.2 }
const SYMBOLS: Record<Currency, string> = { USD: "$", MAD: "د.م.", RMB: "¥" }

interface CurrencyContextType {
  currency: Currency
  setCurrency: (c: Currency) => void
  convert: (usdAmount: number) => string   // returns formatted string e.g. "$400" or "د.م.4,040"
  symbol: string
  rate: number
}

const CurrencyContext = createContext<CurrencyContextType | null>(null)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("USD")

  useEffect(() => {
    const saved = localStorage.getItem("b4c_currency") as Currency | null
    if (saved && RATES[saved]) setCurrencyState(saved)
  }, [])

  function setCurrency(c: Currency) {
    setCurrencyState(c)
    localStorage.setItem("b4c_currency", c)
  }

  function convert(usdAmount: number): string {
    const converted = Math.round(usdAmount * RATES[currency])
    return `${SYMBOLS[currency]}${converted.toLocaleString()}`
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convert, symbol: SYMBOLS[currency], rate: RATES[currency] }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider")
  return ctx
}
