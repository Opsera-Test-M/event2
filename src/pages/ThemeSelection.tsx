import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEvent, useEventThemes } from '@/hooks/useEvents';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Sparkles, Check, Loader2, PartyPopper } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';

export default function ThemeSelection() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: event, isLoading: eventLoading } = useEvent(eventId);
  const { data: themes, isLoading: themesLoading } = useEventThemes(eventId);
  
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [selecting, setSelecting] = useState(false);

  const generateThemes = async () => {
    if (!event) return;
    
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-themes', {
        body: { event },
      });

      if (error) throw error;

      // Save themes to database
      const themesToInsert = data.themes.map((theme: any) => ({
        event_id: eventId,
        name: theme.name,
        description: theme.description,
        color_palette: theme.color_palette,
        decor_vibe: theme.decor_vibe,
      }));

      const { error: insertError } = await supabase
        .from('event_themes')
        .insert(themesToInsert);

      if (insertError) throw insertError;

      queryClient.invalidateQueries({ queryKey: ['event-themes', eventId] });
      toast({ title: 'Themes generated!', description: 'Select a theme to continue.' });
    } catch (error: any) {
      toast({ 
        title: 'Failed to generate themes', 
        description: error.message, 
        variant: 'destructive' 
      });
    } finally {
      setGenerating(false);
    }
  };

  const selectTheme = async (themeId: string) => {
    setSelectedThemeId(themeId);
    setSelecting(true);
    
    try {
      // Update event with selected theme
      const { error: updateError } = await supabase
        .from('events')
        .update({ 
          selected_theme_id: themeId,
          status: 'planning'
        })
        .eq('id', eventId);

      if (updateError) throw updateError;

      // Generate event plan
      const selectedTheme = themes?.find(t => t.id === themeId);
      const { data, error } = await supabase.functions.invoke('generate-event-plan', {
        body: { event, theme: selectedTheme },
      });

      if (error) throw error;

      // Save items to database
      const itemsToInsert = data.items.map((item: any) => ({
        event_id: eventId,
        name: item.name,
        description: item.description,
        category: item.category,
        quantity: item.quantity,
        estimated_price: item.estimated_price,
        is_veg: item.is_veg ?? null,
        notes: item.notes,
        is_owned: false,
      }));

      const { error: insertError } = await supabase
        .from('event_items')
        .insert(itemsToInsert);

      if (insertError) throw insertError;

      toast({ title: 'Event plan created!', description: 'Review your complete event plan.' });
      navigate(`/event/${eventId}`);
    } catch (error: any) {
      toast({ 
        title: 'Failed to create plan', 
        description: error.message, 
        variant: 'destructive' 
      });
      setSelecting(false);
    }
  };

  if (eventLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-hero">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold">{event?.name}</h1>
          <p className="text-muted-foreground mt-2">Choose a theme for your event</p>
        </div>

        {themesLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !themes || themes.length === 0 ? (
          <Card className="border-dashed border-2 bg-transparent">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">Generate AI Themes</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Let AI create unique theme ideas based on your event details
              </p>
              <Button 
                onClick={generateThemes}
                disabled={generating}
                className="gradient-primary hover:opacity-90"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Themes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {themes.map((theme) => (
                <Card 
                  key={theme.id}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-lg border-2",
                    selectedThemeId === theme.id 
                      ? "border-primary shadow-glow" 
                      : "border-transparent hover:-translate-y-1"
                  )}
                  onClick={() => !selecting && selectTheme(theme.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="font-display text-lg">{theme.name}</CardTitle>
                      {selectedThemeId === theme.id && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          {selecting ? (
                            <Loader2 className="w-3 h-3 animate-spin text-primary-foreground" />
                          ) : (
                            <Check className="w-3 h-3 text-primary-foreground" />
                          )}
                        </div>
                      )}
                    </div>
                    <CardDescription>{theme.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        {theme.color_palette.map((color, i) => (
                          <div
                            key={i}
                            className="w-8 h-8 rounded-full border-2 border-background shadow-sm"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {theme.decor_vibe}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selecting && (
              <div className="text-center py-4">
                <div className="inline-flex items-center gap-2 text-primary">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating your complete event plan...</span>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
