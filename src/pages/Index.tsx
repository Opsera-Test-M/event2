import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { PartyPopper, Sparkles, Calendar, Gift, ChefHat, ArrowRight } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  if (!loading && user) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen gradient-hero">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <PartyPopper className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-semibold">Plan & Joy</span>
        </div>
        <Button 
          onClick={() => navigate('/auth')}
          variant="outline"
        >
          Sign In
        </Button>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-4 py-16 sm:py-24">
        <div className="text-center max-w-3xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm mb-8">
            <Sparkles className="w-4 h-4" />
            AI-Powered Event Planning
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-display font-bold leading-tight">
            Plan unforgettable events with{' '}
            <span className="text-gradient">AI magic</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground mt-6 max-w-2xl mx-auto">
            From birthdays to weddings, let AI create personalized themes, shopping lists, 
            menus, and gift ideas tailored to your budget and style.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Button 
              size="lg"
              onClick={() => navigate('/auth')}
              className="gradient-primary hover:opacity-90 text-lg px-8"
            >
              Start Planning Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-3 gap-6 mt-24 max-w-4xl mx-auto">
          {[
            {
              icon: Calendar,
              title: 'Smart Event Setup',
              description: 'Tell us about your event and we\'ll handle the rest'
            },
            {
              icon: Gift,
              title: 'AI Theme Generator',
              description: 'Get unique theme ideas with color palettes and decor vibes'
            },
            {
              icon: ChefHat,
              title: 'Complete Planning',
              description: 'Shopping lists, menus, and gift ideas with budget tracking'
            }
          ].map((feature, i) => (
            <div 
              key={i}
              className="p-6 rounded-2xl bg-card border border-border/50 text-center animate-fade-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg">{feature.title}</h3>
              <p className="text-muted-foreground text-sm mt-2">{feature.description}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
        <p>© 2024 Plan & Joy. Made with ❤️ for event planners everywhere.</p>
      </footer>
    </div>
  );
}
