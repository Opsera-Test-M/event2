import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Event, EventFormData, EventTheme, EventItem } from '@/types/event';
import { useToast } from '@/hooks/use-toast';

export function useEvents() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const eventsQuery = useQuery({
    queryKey: ['events', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Event[];
    },
    enabled: !!user,
  });

  const createEventMutation = useMutation({
    mutationFn: async (eventData: EventFormData) => {
      const { data, error } = await supabase
        .from('events')
        .insert({
          user_id: user!.id,
          name: eventData.name,
          occasion: eventData.occasion,
          event_date: eventData.event_date.toISOString(),
          location: eventData.location,
          guest_count: eventData.guest_count,
          budget: eventData.budget,
          guest_type: eventData.guest_type,
          food_preference: eventData.food_preference,
          allergies: eventData.allergies || null,
          style_preference: eventData.style_preference,
          status: 'draft',
        })
        .select()
        .single();

      if (error) throw error;
      return data as Event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({ title: 'Event created!', description: 'Now let\'s generate some themes.' });
    },
    onError: (error) => {
      toast({ 
        title: 'Failed to create event', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Event> & { id: string }) => {
      const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error) => {
      toast({ 
        title: 'Failed to update event', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({ title: 'Event deleted' });
    },
    onError: (error) => {
      toast({ 
        title: 'Failed to delete event', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });

  return {
    events: eventsQuery.data ?? [],
    isLoading: eventsQuery.isLoading,
    createEvent: createEventMutation.mutateAsync,
    updateEvent: updateEventMutation.mutateAsync,
    deleteEvent: deleteEventMutation.mutateAsync,
    isCreating: createEventMutation.isPending,
  };
}

export function useEvent(eventId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId!)
        .single();
      
      if (error) throw error;
      return data as Event;
    },
    enabled: !!user && !!eventId,
  });
}

export function useEventThemes(eventId: string | undefined) {
  return useQuery({
    queryKey: ['event-themes', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_themes')
        .select('*')
        .eq('event_id', eventId!)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as EventTheme[];
    },
    enabled: !!eventId,
  });
}

export function useEventItems(eventId: string | undefined) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const itemsQuery = useQuery({
    queryKey: ['event-items', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_items')
        .select('*')
        .eq('event_id', eventId!)
        .order('category', { ascending: true });
      
      if (error) throw error;
      return data as EventItem[];
    },
    enabled: !!eventId,
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EventItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('event_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as EventItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-items', eventId] });
    },
    onError: (error) => {
      toast({ 
        title: 'Failed to update item', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('event_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-items', eventId] });
    },
  });

  return {
    items: itemsQuery.data ?? [],
    isLoading: itemsQuery.isLoading,
    updateItem: updateItemMutation.mutateAsync,
    deleteItem: deleteItemMutation.mutateAsync,
  };
}
