import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { event, theme } = await req.json();
    
    const prompt = `You are an expert event planner. Generate a complete event plan for this event:

Event Details:
- Name: ${event.name}
- Occasion: ${event.occasion}
- Location: ${event.location}
- Guest Count: ${event.guest_count}
- Guest Type: ${event.guest_type}
- Budget: $${event.budget}
- Food Preference: ${event.food_preference}
- Style Preference: ${event.style_preference}
${event.allergies ? `- Allergies/Restrictions: ${event.allergies}` : ''}

Selected Theme:
- Name: ${theme.name}
- Description: ${theme.description}
- Color Palette: ${theme.color_palette.join(', ')}
- Decor Vibe: ${theme.decor_vibe}

Generate a comprehensive event plan with:

1. DECOR & SUPPLIES - Items categorized as:
   - decor (balloons, banners, centerpieces, etc.)
   - tableware (plates, cups, napkins, cutlery)
   - lighting (string lights, candles, etc.)
   - party_supplies (favors, games, etc.)

2. RETURN GIFTS - 4-5 gift ideas categorized as "return_gifts"

3. FOOD MENU - Items categorized as:
   - starters
   - main_course
   - desserts
   - beverages

For each item provide:
- name: item name
- category: one of the categories above
- quantity: recommended quantity based on guest count
- estimated_price: price per unit in USD
- description: brief description
- is_veg: true/false (for food items only)
- notes: any helpful tips

Respond with a JSON object in this exact format:
{
  "items": [
    {
      "name": "Item name",
      "category": "category",
      "quantity": 10,
      "estimated_price": 5.99,
      "description": "Brief description",
      "is_veg": true,
      "notes": "Optional tips"
    }
  ]
}

Generate at least 25-30 items total across all categories. Only respond with the JSON object, no other text.`;

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`AI API error: ${error}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse the JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse plan from AI response');
    }
    
    const plan = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(plan), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error generating plan:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
