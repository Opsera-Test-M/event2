import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Sparkles, PartyPopper } from 'lucide-react';
import WizardProgress from '@/components/wizard/WizardProgress';
import StepBasicInfo from '@/components/wizard/StepBasicInfo';
import StepDateTime from '@/components/wizard/StepDateTime';
import StepGuestsBudget from '@/components/wizard/StepGuestsBudget';
import StepFoodStyle from '@/components/wizard/StepFoodStyle';
import { useEvents } from '@/hooks/useEvents';
import { EventFormData } from '@/types/event';

const STEPS = ['Basics', 'Date', 'Guests', 'Preferences'];

export default function CreateEvent() {
  const navigate = useNavigate();
  const { createEvent, isCreating } = useEvents();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<EventFormData>>({
    budget: 500,
  });

  const updateFormData = (data: Partial<EventFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.name && formData.occasion && formData.location;
      case 2:
        return formData.event_date;
      case 3:
        return formData.guest_count && formData.guest_count > 0 && formData.guest_type && formData.budget;
      case 4:
        return formData.food_preference && formData.style_preference;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/dashboard');
    }
  };

  const handleSubmit = async () => {
    if (!canProceed()) return;
    
    const event = await createEvent(formData as EventFormData);
    navigate(`/event/${event.id}/themes`);
  };

  return (
    <div className="min-h-screen gradient-hero">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <PartyPopper className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-semibold">Plan & Joy</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <WizardProgress 
            currentStep={currentStep} 
            totalSteps={STEPS.length} 
            stepLabels={STEPS} 
          />
        </div>

        {/* Form Card */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6 sm:p-8">
            {currentStep === 1 && (
              <StepBasicInfo data={formData} onChange={updateFormData} />
            )}
            {currentStep === 2 && (
              <StepDateTime data={formData} onChange={updateFormData} />
            )}
            {currentStep === 3 && (
              <StepGuestsBudget data={formData} onChange={updateFormData} />
            )}
            {currentStep === 4 && (
              <StepFoodStyle data={formData} onChange={updateFormData} />
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button variant="ghost" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              
              {currentStep < STEPS.length ? (
                <Button 
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="gradient-primary hover:opacity-90"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  disabled={!canProceed() || isCreating}
                  className="gradient-primary hover:opacity-90"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isCreating ? 'Creating...' : 'Generate Themes'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
