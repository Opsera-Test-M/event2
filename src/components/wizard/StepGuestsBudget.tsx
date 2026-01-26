import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { EventFormData, GUEST_TYPE_LABELS, GuestType } from '@/types/event';

interface StepGuestsBudgetProps {
  data: Partial<EventFormData>;
  onChange: (data: Partial<EventFormData>) => void;
}

export default function StepGuestsBudget({ data, onChange }: StepGuestsBudgetProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-display font-bold">Guests & Budget</h2>
        <p className="text-muted-foreground mt-2">Help us size your event perfectly</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="guest_count">Number of Guests</Label>
          <Input
            id="guest_count"
            type="number"
            min={1}
            placeholder="e.g., 25"
            value={data.guest_count || ''}
            onChange={(e) => onChange({ guest_count: parseInt(e.target.value) || 0 })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="guest_type">Guest Type</Label>
          <Select
            value={data.guest_type}
            onValueChange={(value) => onChange({ guest_type: value as GuestType })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select guest type" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(GUEST_TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Budget</Label>
            <span className="text-lg font-semibold text-primary">
              ${(data.budget || 500).toLocaleString()}
            </span>
          </div>
          <Slider
            value={[data.budget || 500]}
            onValueChange={([value]) => onChange({ budget: value })}
            min={100}
            max={50000}
            step={100}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>$100</span>
            <span>$50,000</span>
          </div>
        </div>
      </div>
    </div>
  );
}
