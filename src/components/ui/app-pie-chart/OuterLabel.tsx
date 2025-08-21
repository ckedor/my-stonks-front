'use client'

import { PieLabelRenderProps } from 'recharts'

type OuterLabelProps = PieLabelRenderProps & {
  labels: string[]
}

export default function OuterLabel({
  cx,
  cy,
  midAngle,
  outerRadius,
  index,
  labels,
}: OuterLabelProps) {
  if (
    typeof index !== 'number' ||
    typeof cx !== 'number' ||
    typeof cy !== 'number' ||
    typeof midAngle !== 'number' ||
    typeof outerRadius !== 'number'
  ) {
    return null
  }

  const RADIAN = Math.PI / 180
  const radius = outerRadius + 16
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text
      x={x}
      y={y}
      fill="#555"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={14}
      style={{ pointerEvents: 'none' }}
    >
      {labels[index]}
    </text>
  )
}
