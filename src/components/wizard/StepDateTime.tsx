import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { EventFormData } from '@/types/event';

interface StepDateTimeProps {
  data: Partial<EventFormData>;
  onChange: (data: Partial<EventFormData>) => void;
}

export default function StepDateTime({ data, onChange }: StepDateTimeProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-display font-bold">When is your event?</h2>
        <p className="text-muted-foreground mt-2">Select the date for your celebration</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Event Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !data.event_date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {data.event_date ? format(data.event_date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={data.event_date}
                onSelect={(date) => onChange({ event_date: date })}
                disabled={(date) => date < new Date()}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
