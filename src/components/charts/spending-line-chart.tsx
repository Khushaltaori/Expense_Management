"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const baseData = [
  { month: "Jan", amount: 22000 },
  { month: "Feb", amount: 26400 },
  { month: "Mar", amount: 23500 },
  { month: "Apr", amount: 31100 },
  { month: "May", amount: 34700 },
  { month: "Jun", amount: 32100 },
  { month: "Jul", amount: 37600 },
];

export function SpendingLineChart() {
  const data = useMemo(
    () =>
      baseData.map((item) => ({
        ...item,
        forecast: Math.round(item.amount * 1.09),
      })),
    [],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="h-72 w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 15, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="amountLine" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#67e8f9" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.15} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke="rgba(148,163,184,0.16)" />
          <XAxis
            dataKey="month"
            tick={{ fill: "#cbd5e1", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `$${Math.round(value / 1000)}k`}
          />
          <Tooltip
            cursor={{ stroke: "rgba(34,211,238,0.4)", strokeWidth: 1 }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid rgba(148,163,184,0.25)",
              backgroundColor: "rgba(2,6,23,0.92)",
              color: "#e2e8f0",
            }}
          />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="url(#amountLine)"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, stroke: "#67e8f9", fill: "#0f172a" }}
            isAnimationActive
          />
          <Line
            type="monotone"
            dataKey="forecast"
            stroke="#6366f1"
            strokeWidth={2}
            strokeDasharray="6 6"
            dot={false}
            opacity={0.6}
            isAnimationActive
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
