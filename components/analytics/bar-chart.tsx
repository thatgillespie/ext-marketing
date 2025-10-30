import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface BarChartData {
  label: string
  value: number
  color?: string
}

interface BarChartProps {
  title: string
  data: BarChartData[]
  valueFormatter?: (value: number) => string
}

export function BarChart({ title, data, valueFormatter = (v) => v.toString() }: BarChartProps) {
  const maxValue = Math.max(...data.map(d => d.value), 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium truncate flex-1">{item.label}</span>
                <span className="text-gray-600 ml-2">{valueFormatter(item.value)}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(item.value / maxValue) * 100}%`,
                    backgroundColor: item.color || '#3b82f6'
                  }}
                />
              </div>
            </div>
          ))}
          {data.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">
              No data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
