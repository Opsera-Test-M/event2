import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEvent, useEventThemes, useEventItems, useEvents } from '@/hooks/useEvents';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  MapPin, 
  DollarSign, 
  Loader2, 
  PartyPopper,
  ShoppingBag,
  Gift,
  UtensilsCrossed,
  Minus,
  Plus,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { OCCASION_LABELS, CATEGORY_LABELS, ItemCategory, EventItem } from '@/types/event';

const CATEGORY_GROUPS = {
  shopping: ['decor', 'tableware', 'lighting', 'party_supplies'] as ItemCategory[],
  gifts: ['return_gifts'] as ItemCategory[],
  food: ['starters', 'main_course', 'desserts', 'beverages'] as ItemCategory[],
};

function ItemRow({ item, onUpdate, onDelete }: { 
  item: EventItem; 
  onUpdate: (updates: Partial<EventItem>) => void;
  onDelete: () => void;
}) {
  const [quantity, setQuantity] = useState(item.quantity);

  const handleQuantityChange = (delta: number) => {
    const newQty = Math.max(0, quantity + delta);
    setQuantity(newQty);
    onUpdate({ quantity: newQty });
  };

  const itemTotal = (item.estimated_price || 0) * (item.is_owned ? 0 : quantity);

  return (
    <div className={cn(
      "flex items-center gap-4 p-4 rounded-lg transition-all",
      item.is_owned ? "bg-muted/50 opacity-60" : "bg-card"
    )}>
      <Checkbox
        checked={item.is_owned}
        onCheckedChange={(checked) => onUpdate({ is_owned: checked as boolean })}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn(
            "font-medium truncate",
            item.is_owned && "line-through"
          )}>
            {item.name}
          </p>
          {item.is_veg !== null && (
            <Badge variant="outline" className="text-xs">
              {item.is_veg ? '🌱 Veg' : '🍖 Non-veg'}
            </Badge>
          )}
        </div>
        {item.description && (
          <p className="text-sm text-muted-foreground truncate">{item.description}</p>
        )}
        {item.notes && (
          <p className="text-xs text-primary mt-1">💡 {item.notes}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => handleQuantityChange(-1)}
        >
          <Minus className="w-3 h-3" />
        </Button>
        <Input
          type="number"
          value={quantity}
          onChange={(e) => {
            const val = parseInt(e.target.value) || 0;
            setQuantity(val);
            onUpdate({ quantity: val });
          }}
          className="w-16 text-center h-8"
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => handleQuantityChange(1)}
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>
      <div className="text-right w-24">
        <p className="font-medium">
          ${itemTotal.toFixed(2)}
        </p>
        <p className="text-xs text-muted-foreground">
          ${item.estimated_price?.toFixed(2) || '0.00'}/ea
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive hover:text-destructive"
        onClick={onDelete}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

function ItemsSection({ 
  title, 
  icon: Icon, 
  items, 
  onUpdateItem, 
  onDeleteItem 
}: { 
  title: string; 
  icon: React.ElementType;
  items: EventItem[];
  onUpdateItem: (id: string, updates: Partial<EventItem>) => void;
  onDeleteItem: (id: string) => void;
}) {
  const total = items.reduce((sum, item) => {
    return sum + (item.is_owned ? 0 : (item.estimated_price || 0) * item.quantity);
  }, 0);

  if (items.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-primary" />
          <h3 className="font-display font-semibold">{title}</h3>
          <Badge variant="secondary">{items.length} items</Badge>
        </div>
        <p className="font-semibold text-primary">${total.toFixed(2)}</p>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            onUpdate={(updates) => onUpdateItem(item.id, updates)}
            onDelete={() => onDeleteItem(item.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default function EventDetails() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  
  const { data: event, isLoading: eventLoading } = useEvent(eventId);
  const { data: themes } = useEventThemes(eventId);
  const { items, isLoading: itemsLoading, updateItem, deleteItem } = useEventItems(eventId);
  const { updateEvent } = useEvents();

  const selectedTheme = themes?.find(t => t.id === event?.selected_theme_id);

  const shoppingItems = items.filter(i => CATEGORY_GROUPS.shopping.includes(i.category));
  const giftItems = items.filter(i => CATEGORY_GROUPS.gifts.includes(i.category));
  const foodItems = items.filter(i => CATEGORY_GROUPS.food.includes(i.category));

  const totalCost = items.reduce((sum, item) => {
    return sum + (item.is_owned ? 0 : (item.estimated_price || 0) * item.quantity);
  }, 0);

  const budgetDiff = (event?.budget || 0) - totalCost;

  if (eventLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-hero">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-hero">
        <p>Event not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <PartyPopper className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-semibold">Plan & Joy</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Event Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold">{event.name}</h1>
              <p className="text-muted-foreground mt-1">{OCCASION_LABELS[event.occasion]}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={cn(
                event.status === 'complete' && "bg-success/10 text-success",
                event.status === 'planning' && "bg-primary/10 text-primary",
                event.status === 'draft' && "bg-muted text-muted-foreground"
              )}>
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </Badge>
              {event.status === 'planning' && (
                <Button
                  onClick={() => updateEvent({ id: event.id, status: 'complete' })}
                  className="gradient-primary"
                >
                  Mark Complete
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg">Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{format(new Date(event.event_date), 'EEEE, MMMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{event.guest_count} guests</span>
                </div>
              </CardContent>
            </Card>

            {/* Theme Card */}
            {selectedTheme && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-lg">Theme</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="font-medium">{selectedTheme.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedTheme.description}</p>
                  <div className="flex gap-2">
                    {selectedTheme.color_palette.map((color, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full border-2 border-background shadow-sm"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Budget Card */}
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg">Budget</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Budget</span>
                  <span className="font-medium">${event.budget.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Estimated Cost</span>
                  <span className="font-medium">${totalCost.toFixed(2)}</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {budgetDiff >= 0 ? 'Remaining' : 'Over Budget'}
                  </span>
                  <span className={cn(
                    "font-bold",
                    budgetDiff >= 0 ? "text-success" : "text-destructive"
                  )}>
                    {budgetDiff >= 0 ? '+' : ''}${Math.abs(budgetDiff).toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {itemsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : items.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <p className="text-muted-foreground">No items yet. Select a theme to generate your event plan.</p>
                  <Button 
                    onClick={() => navigate(`/event/${eventId}/themes`)}
                    className="mt-4 gradient-primary"
                  >
                    Choose Theme
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Tabs defaultValue="shopping" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="shopping" className="gap-2">
                    <ShoppingBag className="w-4 h-4" />
                    Shopping
                  </TabsTrigger>
                  <TabsTrigger value="gifts" className="gap-2">
                    <Gift className="w-4 h-4" />
                    Gifts
                  </TabsTrigger>
                  <TabsTrigger value="food" className="gap-2">
                    <UtensilsCrossed className="w-4 h-4" />
                    Food
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="shopping" className="space-y-6">
                  {CATEGORY_GROUPS.shopping.map((category) => {
                    const categoryItems = shoppingItems.filter(i => i.category === category);
                    if (categoryItems.length === 0) return null;
                    return (
                      <ItemsSection
                        key={category}
                        title={CATEGORY_LABELS[category]}
                        icon={ShoppingBag}
                        items={categoryItems}
                        onUpdateItem={(id, updates) => updateItem({ id, ...updates })}
                        onDeleteItem={deleteItem}
                      />
                    );
                  })}
                </TabsContent>

                <TabsContent value="gifts">
                  <ItemsSection
                    title="Return Gifts & Favors"
                    icon={Gift}
                    items={giftItems}
                    onUpdateItem={(id, updates) => updateItem({ id, ...updates })}
                    onDeleteItem={deleteItem}
                  />
                </TabsContent>

                <TabsContent value="food" className="space-y-6">
                  {CATEGORY_GROUPS.food.map((category) => {
                    const categoryItems = foodItems.filter(i => i.category === category);
                    if (categoryItems.length === 0) return null;
                    return (
                      <ItemsSection
                        key={category}
                        title={CATEGORY_LABELS[category]}
                        icon={UtensilsCrossed}
                        items={categoryItems}
                        onUpdateItem={(id, updates) => updateItem({ id, ...updates })}
                        onDeleteItem={deleteItem}
                      />
                    );
                  })}
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
