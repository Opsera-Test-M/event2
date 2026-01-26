import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EventFormData, OCCASION_LABELS, EventOccasion } from '@/types/event';

interface StepBasicInfoProps {
  data: Partial<EventFormData>;
  onChange: (data: Partial<EventFormData>) => void;
}

export default function StepBasicInfo({ data, onChange }: StepBasicInfoProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-display font-bold">Let's start with the basics</h2>
        <p className="text-muted-foreground mt-2">Tell us about your event</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Event Name</Label>
          <Input
            id="name"
            placeholder="e.g., Emma's 5th Birthday"
            value={data.name || ''}
            onChange={(e) => onChange({ name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="occasion">Occasion Type</Label>
          <Select
            value={data.occasion}
            onValueChange={(value) => onChange({ occasion: value as EventOccasion })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select occasion" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(OCCASION_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location (City or Zip Code)</Label>
          <Input
            id="location"
            placeholder="e.g., San Francisco, CA"
            value={data.location || ''}
            onChange={(e) => onChange({ location: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
