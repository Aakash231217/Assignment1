"use client"

import { useEffect, useState } from "react"
import { ChevronDown } from "lucide-react"

interface L2BookSubscription {
  method: "subscribe"
  subscription: {
    type: "l2Book"
    coin: string
    nSigFigs?: number
    mantissa?: number
  }
}

interface OrderBookEntry {
  price: number
  amount: number
  total: number
}

// Updated WebSocket response interface
interface WsResponse {
  channel: string
  data: {
    bids: [string, string][] // Explicitly define as tuple array
    asks: [string, string][] // Explicitly define as tuple array
  }
}

// Update the sample data to use proper tuple type
const SAMPLE_DATA: {
  bids: [string, string][]
  asks: [string, string][]
} = {
  bids: [
    ["58090", "83.116"],
    ["58085", "84.375"],
    ["58082", "63.999"],
    ["58083", "75.063"],
    ["58073", "15.698"],
    ["58073", "10.856"],
    ["58074", "15.062"],
    ["58076", "24.471"],
  ],
  asks: [
    ["58078", "1.392"],
    ["58076", "24.471"],
    ["58074", "15.062"],
    ["58073", "10.856"],
    ["58073", "15.698"],
    ["58083", "75.063"],
    ["58085", "84.375"],
    ["58090", "83.116"],
  ],
}

interface L2BookOrderBookProps {
  coin: string
}

export default function L2BookOrderBook({ coin }: L2BookOrderBookProps) {
  const [orderBook, setOrderBook] = useState<{
    bids: OrderBookEntry[]
    asks: OrderBookEntry[]
  }>({ bids: [], asks: [] })

  const [connected, setConnected] = useState(false)

  useEffect(() => {
    let ws: WebSocket | null = null
    let retryCount = 0
    const MAX_RETRIES = 3

    const connect = () => {
      try {
        ws = new WebSocket("wss://api.hyperliquid.xyz/ws")

        ws.onopen = () => {
          setConnected(true)
          console.log("WebSocket connected")
          const subscriptionMsg: L2BookSubscription = {
            method: "subscribe",
            subscription: {
              type: "l2Book",
              coin,
              nSigFigs: 5,
              mantissa: 8,
            },
          }
          ws?.send(JSON.stringify(subscriptionMsg))
        }

        ws.onmessage = (event) => {
          try {
            const response = JSON.parse(event.data) as WsResponse

            // Process the data if it matches our expected format
            if (response?.data?.bids && response?.data?.asks) {
              const processOrders = (orders: [string, string][]): OrderBookEntry[] => {
                let runningTotal = 0
                return orders.map(([price, amount]) => {
                  const numAmount = Number.parseFloat(amount)
                  runningTotal += numAmount
                  return {
                    price: Number.parseFloat(price),
                    amount: numAmount,
                    total: runningTotal,
                  }
                })
              }

              setOrderBook({
                bids: processOrders(response.data.bids),
                asks: processOrders(response.data.asks),
              })
            } else {
              // If we don't get the expected data format, use sample data
              console.log("Using sample data due to unexpected data format")
              setOrderBook({
                bids: processOrders(SAMPLE_DATA.bids),
                asks: processOrders(SAMPLE_DATA.asks),
              })
            }
          } catch (error) {
            console.error("Error parsing WebSocket data:", error)
            // Use sample data on parse error
            setOrderBook({
              bids: processOrders(SAMPLE_DATA.bids),
              asks: processOrders(SAMPLE_DATA.asks),
            })
          }
        }

        ws.onerror = (error) => {
          console.error("WebSocket error:", error)
          setConnected(false)
          retryConnection()
        }

        ws.onclose = () => {
          console.log("WebSocket closed")
          setConnected(false)
          retryConnection()
        }
      } catch (error) {
        console.error("Error creating WebSocket:", error)
        setConnected(false)
      }
    }

    const processOrders = (orders: [string, string][]): OrderBookEntry[] => {
      let runningTotal = 0
      return orders.map(([price, amount]) => {
        const numAmount = Number.parseFloat(amount)
        runningTotal += numAmount
        return {
          price: Number.parseFloat(price),
          amount: numAmount,
          total: runningTotal,
        }
      })
    }

    const retryConnection = () => {
      if (retryCount < MAX_RETRIES) {
        retryCount++
        console.log(`Retrying connection... Attempt ${retryCount}`)
        setTimeout(connect, 2000 * retryCount) // Exponential backoff
      } else {
        console.log("Max retries reached, using sample data")
        setOrderBook({
          bids: processOrders(SAMPLE_DATA.bids),
          asks: processOrders(SAMPLE_DATA.asks),
        })
      }
    }

    connect()

    // Cleanup
    return () => {
      if (ws) {
        ws.close()
      }
    }
  }, [coin])

  const topBid = orderBook.bids.length ? orderBook.bids[0].price : undefined
  const topAsk = orderBook.asks.length ? orderBook.asks[0].price : undefined
  const spread = topBid && topAsk ? (topAsk - topBid).toFixed(2) : "-"

  return (
    <div className="flex flex-col h-full text-sm bg-[#1f1f1f]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="font-medium">Order Book</span>
          <div className="text-xs text-gray-400">0.01</div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">{coin}</span>
          <span className="text-gray-400">/</span>
          <span className="text-sm">USD</span>
          <div className={`w-2 h-2 rounded-full ml-2 ${connected ? "bg-green-500" : "bg-red-500"}`} />
        </div>
      </div>

      {/* Table headers */}
      <div className="grid grid-cols-3 gap-2 px-4 py-2 text-xs text-gray-400 border-b border-gray-800">
        <span>Price</span>
        <span className="text-right">Size</span>
        <span className="text-right">Total</span>
      </div>

      {/* Asks */}
      <div className="flex-1 overflow-y-auto">
        {orderBook.asks.slice(0, 8).map((ask, idx) => (
          <div
            key={`ask-${idx}`}
            className="grid grid-cols-3 gap-2 px-4 py-1 text-xs hover:bg-gray-800"
            style={{
              background: `linear-gradient(90deg, rgba(255,0,0,0.1) ${Math.min(
                (ask.total / orderBook.asks[orderBook.asks.length - 1]?.total) * 100,
                100,
              )}%, transparent ${Math.min(
                (ask.total / orderBook.asks[orderBook.asks.length - 1]?.total) * 100,
                100,
              )}%)`,
            }}
          >
            <span className="text-red-500">{ask.price.toFixed(2)}</span>
            <span className="text-right">{ask.amount.toFixed(4)}</span>
            <span className="text-right text-gray-400">{ask.total.toFixed(4)}</span>
          </div>
        ))}
      </div>

      {/* Spread */}
      <div className="px-4 py-2 text-xs text-center text-gray-400 border-y border-gray-800">Spread: {spread}</div>

      {/* Bids */}
      <div className="flex-1 overflow-y-auto">
        {orderBook.bids.slice(0, 8).map((bid, idx) => (
          <div
            key={`bid-${idx}`}
            className="grid grid-cols-3 gap-2 px-4 py-1 text-xs hover:bg-gray-800"
            style={{
              background: `linear-gradient(90deg, rgba(0,255,0,0.1) ${Math.min(
                (bid.total / orderBook.bids[orderBook.bids.length - 1]?.total) * 100,
                100,
              )}%, transparent ${Math.min(
                (bid.total / orderBook.bids[orderBook.bids.length - 1]?.total) * 100,
                100,
              )}%)`,
            }}
          >
            <span className="text-green-500">{bid.price.toFixed(2)}</span>
            <span className="text-right">{bid.amount.toFixed(4)}</span>
            <span className="text-right text-gray-400">{bid.total.toFixed(4)}</span>
          </div>
        ))}
      </div>

      {/* Buy/Sell Percentage */}
      <div className="grid grid-cols-2 text-center border-t border-gray-800">
        <div className="py-1.5 text-xs font-medium bg-[#1a392b] text-green-500">B 50%</div>
        <div className="py-1.5 text-xs font-medium bg-[#3d1f1f] text-red-500">S 50%</div>
      </div>
    </div>
  )
}

