import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export default function WizardProgress({ currentStep, totalSteps, stepLabels }: WizardProgressProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {stepLabels.map((label, index) => {
          const stepNumber = index + 1;
          const isComplete = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="flex items-center w-full">
                {index > 0 && (
                  <div 
                    className={cn(
                      "h-0.5 flex-1 transition-colors",
                      isComplete ? "bg-primary" : "bg-border"
                    )}
                  />
                )}
                <div 
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                    isComplete && "bg-primary text-primary-foreground",
                    isCurrent && "bg-primary text-primary-foreground shadow-glow",
                    !isComplete && !isCurrent && "bg-muted text-muted-foreground"
                  )}
                >
                  {isComplete ? <Check className="w-4 h-4" /> : stepNumber}
                </div>
                {index < totalSteps - 1 && (
                  <div 
                    className={cn(
                      "h-0.5 flex-1 transition-colors",
                      isComplete ? "bg-primary" : "bg-border"
                    )}
                  />
                )}
              </div>
              <span 
                className={cn(
                  "text-xs mt-2 text-center hidden sm:block transition-colors",
                  isCurrent ? "text-primary font-medium" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
