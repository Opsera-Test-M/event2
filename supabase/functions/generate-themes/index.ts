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
    const { event } = await req.json();
    
    const prompt = `You are an expert event planner. Generate 4 unique and creative theme ideas for this event:

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

For each theme, provide:
1. A creative theme name
2. A brief description (2-3 sentences)
3. A color palette (array of 4-5 hex colors)
4. A decor vibe description (1-2 sentences about the overall aesthetic)

Respond with a JSON array of 4 themes in this exact format:
[
  {
    "name": "Theme Name",
    "description": "Theme description here",
    "color_palette": ["#hex1", "#hex2", "#hex3", "#hex4"],
    "decor_vibe": "Decor vibe description"
  }
]

Only respond with the JSON array, no other text.`;

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
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`AI API error: ${error}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse the JSON from the response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Failed to parse themes from AI response');
    }
    
    const themes = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify({ themes }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error generating themes:', error);
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
