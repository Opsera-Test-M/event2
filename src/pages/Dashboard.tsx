import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEvents } from '@/hooks/useEvents';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Calendar, 
  Users, 
  MapPin, 
  DollarSign, 
  LogOut, 
  PartyPopper,
  Loader2,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { OCCASION_LABELS, Event } from '@/types/event';

function EventCard({ event, onDelete }: { event: Event; onDelete: (id: string) => void }) {
  const navigate = useNavigate();
  
  const statusColors = {
    draft: 'bg-muted text-muted-foreground',
    planning: 'bg-primary/10 text-primary',
    complete: 'bg-success/10 text-success',
  };

  return (
    <Card 
      className="group cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 border-0 shadow-md"
      onClick={() => navigate(`/event/${event.id}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="font-display text-xl group-hover:text-primary transition-colors">
              {event.name}
            </CardTitle>
            <CardDescription className="mt-1">
              {OCCASION_LABELS[event.occasion]}
            </CardDescription>
          </div>
          <Badge className={statusColors[event.status]}>
            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {format(new Date(event.event_date), 'MMM d, yyyy')}
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            {event.guest_count} guests
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {event.location}
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            ${event.budget.toLocaleString()}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(event.id);
          }}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { events, isLoading, deleteEvent } = useEvents();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-hero">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <PartyPopper className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-semibold">Plan & Joy</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.email}
            </span>
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold">Your Events</h1>
            <p className="text-muted-foreground mt-1">Plan and manage all your celebrations</p>
          </div>
          <Button 
            onClick={() => navigate('/create-event')}
            className="gradient-primary hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : events.length === 0 ? (
          <Card className="border-dashed border-2 bg-transparent">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <PartyPopper className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">No events yet</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Create your first event and let AI help you plan the perfect celebration!
              </p>
              <Button 
                onClick={() => navigate('/create-event')}
                className="gradient-primary hover:opacity-90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Event
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard 
                key={event.id} 
                event={event} 
                onDelete={deleteEvent}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
