"use client"

import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { CandlestickChart, ArrowLeftRight, Timer, ChevronDown, Search, RotateCcw } from "lucide-react"
import L2BookOrderBook from "./L2BookOrderBook"

// Example data for the chart
const chartData = Array.from({ length: 12 }, (_, i) => ({
  date: i,
  value: 5000 + Math.random() * 3000,
}))

export default function TradingInterface() {
  const [selectedCoin, setSelectedCoin] = useState("BTC")
  const [selectedInterval, setSelectedInterval] = useState("1h")

  const intervals = ["5m", "1h", "6m", "3m", "1m", "5d", "1d"]

  return (
    <div className="flex h-screen bg-[#1a1a1a] text-gray-200">
      {/* Left Toolbar */}
      <div className="w-14 bg-[#1f1f1f] flex flex-col border-r border-gray-800">
        <button className="p-3 hover:bg-gray-800 text-gray-400">
          <CandlestickChart className="w-5 h-5" />
        </button>
        <button className="p-3 hover:bg-gray-800 text-gray-400">
          <ArrowLeftRight className="w-5 h-5" />
        </button>
        <button className="p-3 hover:bg-gray-800 text-gray-400">
          <Timer className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#1f1f1f] border-b border-gray-800">
          <div className="flex gap-1">
            <div className="w-16 h-6 bg-red-600" />
            <div className="w-16 h-6 bg-red-600" />
            <div className="w-16 h-6 bg-red-600" />
            <div className="w-16 h-6 bg-green-500" />
            <div className="w-16 h-6 bg-green-500" />
            <div className="w-16 h-6 bg-green-500" />
          </div>
          <button className="bg-[#1d90f5] px-4 py-1.5 rounded text-sm hover:bg-blue-600 transition-colors">
            Connect wallet
          </button>
        </div>

        {/* Chart and Order Book */}
        <div className="flex flex-1 overflow-hidden">
          {/* Chart Area */}
          <div className="flex-1 flex flex-col">
            {/* Chart Controls */}
            <div className="flex items-center gap-4 p-2 border-b border-gray-800 bg-[#1f1f1f]">
              <div className="flex items-center gap-2">
                {intervals.map((interval) => (
                  <button
                    key={interval}
                    className={`px-2 py-1 text-sm rounded ${
                      selectedInterval === interval ? "bg-gray-700" : "hover:bg-gray-800"
                    }`}
                  >
                    {interval}
                  </button>
                ))}
              </div>
              <button className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-300">
                Indicators
                <ChevronDown className="w-4 h-4" />
              </button>
              <div className="ml-auto flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-400" />
                <RotateCcw className="w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Chart */}
            <div className="flex-1 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1f1f1f", border: "1px solid #333" }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Bar dataKey="value" fill="#1d90f5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Order Book */}
          <div className="w-80 border-l border-gray-800">
            <L2BookOrderBook coin={selectedCoin} />
          </div>
        </div>
      </div>
    </div>
  )
}

