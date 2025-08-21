'use client'

import { PieLabelRenderProps } from 'recharts'

export default function PercentageLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: PieLabelRenderProps) {
  const RADIAN = Math.PI / 180
  const radius = Number(innerRadius) + (Number(outerRadius) - Number(innerRadius)) * 0.5
  const angle = Number(midAngle)
  const x = Number(cx) + radius * Math.cos(-angle * RADIAN)
  const y = Number(cy) + radius * Math.sin(-angle * RADIAN)

  return (
    <text
      x={x}
      y={y}
      fill="#000"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      style={{ pointerEvents: 'none' }}
    >
      {`${(percent! * 100).toFixed(1)}%`}
    </text>
  )
}
