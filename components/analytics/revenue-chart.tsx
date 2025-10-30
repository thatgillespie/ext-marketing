import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/types/invoice"

interface RevenueChartProps {
  title: string
  data: Array<{
    month: string
    revenue: number
    paidRevenue: number
  }>
}

export function RevenueChart({ title, data }: RevenueChartProps) {
  const maxValue = Math.max(...data.map(d => d.revenue), 1)
  const chartHeight = 200

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="space-y-6">
            {/* Chart */}
            <div className="relative" style={{ height: chartHeight }}>
              <div className="absolute inset-0 flex items-end justify-between gap-2">
                {data.map((item, index) => {
                  const totalHeight = (item.revenue / maxValue) * chartHeight
                  const paidHeight = (item.paidRevenue / maxValue) * chartHeight

                  return (
                    <div
                      key={index}
                      className="flex-1 flex flex-col items-center gap-1"
                    >
                      <div className="w-full relative" style={{ height: chartHeight }}>
                        {/* Total revenue bar (background) */}
                        <div
                          className="absolute bottom-0 w-full bg-blue-200 rounded-t transition-all"
                          style={{ height: `${totalHeight}px` }}
                        />
                        {/* Paid revenue bar (foreground) */}
                        <div
                          className="absolute bottom-0 w-full bg-blue-600 rounded-t transition-all"
                          style={{ height: `${paidHeight}px` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Labels */}
            <div className="flex items-center justify-between gap-2">
              {data.map((item, index) => (
                <div key={index} className="flex-1 text-center">
                  <div className="text-xs text-gray-600 font-medium">
                    {new Date(item.month + '-01').toLocaleString('default', { month: 'short' })}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatCurrency(item.revenue)}
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-200 rounded" />
                <span className="text-gray-600">Total Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded" />
                <span className="text-gray-600">Paid Revenue</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 text-sm">
            No revenue data available
          </div>
        )}
      </CardContent>
    </Card>
  )
}
