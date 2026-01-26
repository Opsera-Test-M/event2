import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { EventFormData, FOOD_LABELS, STYLE_LABELS, FoodPreference, StylePreference } from '@/types/event';
import { cn } from '@/lib/utils';

interface StepFoodStyleProps {
  data: Partial<EventFormData>;
  onChange: (data: Partial<EventFormData>) => void;
}

const styleIcons: Record<StylePreference, string> = {
  minimal: '✨',
  luxury: '💎',
  fun: '🎉',
  traditional: '🏛️',
  modern: '🔷',
};

export default function StepFoodStyle({ data, onChange }: StepFoodStyleProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-display font-bold">Food & Style Preferences</h2>
        <p className="text-muted-foreground mt-2">Let's personalize your event</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <Label>Food Preference</Label>
          <RadioGroup
            value={data.food_preference}
            onValueChange={(value) => onChange({ food_preference: value as FoodPreference })}
            className="grid grid-cols-3 gap-3"
          >
            {Object.entries(FOOD_LABELS).map(([value, label]) => (
              <div key={value}>
                <RadioGroupItem
                  value={value}
                  id={`food-${value}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`food-${value}`}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer transition-all",
                    "hover:bg-secondary/50",
                    "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-secondary"
                  )}
                >
                  <span className="text-sm font-medium">{label}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="allergies">Allergies or Dietary Restrictions (Optional)</Label>
          <Textarea
            id="allergies"
            placeholder="e.g., nut-free, gluten-free, dairy-free..."
            value={data.allergies || ''}
            onChange={(e) => onChange({ allergies: e.target.value })}
            rows={2}
          />
        </div>

        <div className="space-y-3">
          <Label>Style Preference</Label>
          <RadioGroup
            value={data.style_preference}
            onValueChange={(value) => onChange({ style_preference: value as StylePreference })}
            className="grid grid-cols-2 sm:grid-cols-5 gap-3"
          >
            {Object.entries(STYLE_LABELS).map(([value, label]) => (
              <div key={value}>
                <RadioGroupItem
                  value={value}
                  id={`style-${value}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`style-${value}`}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer transition-all",
                    "hover:bg-secondary/50",
                    "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-secondary"
                  )}
                >
                  <span className="text-2xl mb-1">{styleIcons[value as StylePreference]}</span>
                  <span className="text-xs font-medium text-center">{label}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}
