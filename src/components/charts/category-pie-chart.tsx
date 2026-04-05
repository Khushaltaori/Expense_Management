"use client";

import { motion } from "framer-motion";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { name: "Travel", value: 38, color: "#22d3ee" },
  { name: "SaaS", value: 24, color: "#6366f1" },
  { name: "Meals", value: 19, color: "#38bdf8" },
  { name: "Office", value: 11, color: "#a78bfa" },
  { name: "Other", value: 8, color: "#818cf8" },
];

export function CategoryPieChart() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55 }}
      className="h-72 w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius={62}
            outerRadius={98}
            paddingAngle={4}
            dataKey="value"
            isAnimationActive
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid rgba(148,163,184,0.25)",
              backgroundColor: "rgba(2,6,23,0.92)",
              color: "#e2e8f0",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
