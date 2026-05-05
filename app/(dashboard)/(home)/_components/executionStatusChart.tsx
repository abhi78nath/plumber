'use client';

import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { Layers2Icon } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { getWorkflowExecutionStats } from '@/actions/analytics/getWorkflowExecutionCharts';



type ChartData = Awaited<ReturnType<typeof getWorkflowExecutionStats>>;

const chartConfig = {
  success: {
    label: 'Success',
    color: 'hsl(var(--chart-2))',
  },
  failed: {
    label: 'Failed',
    color: 'hsl(var(--chart-1))',
  },
};

export default function ExecutionStatusChart({ data }: { data: ChartData }) {
  const hasFailures = data.some(d => d.failed > 0);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <Layers2Icon className="w-6 h-6 text-primary" />
          Workflow execution status
        </CardTitle>
        <CardDescription>Daily number of successfull nd failed workflow executions</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="max-h-[400px] w-full">
          <AreaChart data={data} height={400} margin={{ top: 20 }}>
            <defs>
              <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0} />
              </linearGradient>

              <linearGradient id="failedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-failed)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--color-failed)" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#1e293b"
            />

            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });
              }}
            />

            <ChartLegend content={<ChartLegendContent />} />
            <ChartTooltip content={<ChartTooltipContent className="w-[250px]" />} />

            <Area
              type="monotone"
              dataKey="success"
              stroke="var(--color-success)"
              strokeWidth={2.5}
              fill="url(#successGradient)"
              connectNulls={false}
              stackId="a"
            />
            <Area
              type="monotone"
              dataKey="failed"
              connectNulls={false}
              stroke="var(--color-failed)"
              strokeWidth={2.5}
              fill="url(#failedGradient)"
              stackId="b"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}