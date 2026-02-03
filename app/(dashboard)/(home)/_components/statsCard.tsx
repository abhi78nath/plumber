import { LucideIcon } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ReactCountUpWrapper from '@/components/ReactCountUpWrapper';


interface Props {
  title: string;
  value: number;
  icon: LucideIcon;
}

export default function StatsCard(props: Props) {
  return (
    <Card className="relative overflow-hidden h-full dark:shadow-[2px_-2px_10px_0px_hsl(var(--primary-foreground)/0.5)]">
      <div className="absolute top-[-37px] right-[-46px] h-32 w-32 rounded-full bg-cyan-100/20 blur-3xl pointer-events-none dark:bg-cyan-400/5 dark:mix-blend-screen" />
      <CardHeader className="flex pb-2">
        <CardTitle className='text-sm tracking-[0.2em] uppercase dark:text-[#7D8B96] font-medium'>{props.title}</CardTitle>
        {/* <props.icon
          size={120}
          className="text-muted-foreground absolute -bottom-4 -right-8 stroke-primary opacity-10"
        /> */}
      </CardHeader>
      <CardContent>
        <div className="text-5xl font-bold">
          <ReactCountUpWrapper value={props.value} />
        </div>
      </CardContent>
    </Card>
  );
}