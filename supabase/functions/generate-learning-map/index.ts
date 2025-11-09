// Edge runtime types are automatically available

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LearningMapRequest {
  topic: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, level = 'beginner' }: LearningMapRequest = await req.json();
    
    if (!topic || topic.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Topic is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are an expert educational content structurer. Your task is to create a comprehensive, well-organized learning roadmap for any given topic.

Generate a structured learning map with:
- 3-5 main branches (core areas of study)
- 2-4 subtopics under each branch
- Brief, clear descriptions for each node
- Logical progression from fundamentals to advanced concepts
- Consider the learning level: ${level}

Return ONLY valid JSON in this exact format:
{
  "topic": "Main Topic Name",
  "branches": [
    {
      "id": "unique-id-1",
      "name": "Branch Name",
      "description": "Brief description of this learning area",
      "subtopics": [
        {
          "id": "unique-id-1-1",
          "name": "Subtopic Name",
          "description": "What you'll learn in this subtopic"
        }
      ]
    }
  ]
}`;

    const userPrompt = `Create a comprehensive learning roadmap for: "${topic}"
    
Learning level: ${level}

Please structure it as a learning map with clear branches and subtopics. Make it practical and actionable.`;

    console.log('Calling Lovable AI for topic:', topic);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Failed to generate learning map' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const generatedContent = data.choices?.[0]?.message?.content;

    if (!generatedContent) {
      console.error('No content in AI response:', data);
      return new Response(
        JSON.stringify({ error: 'No content generated' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract JSON from markdown code blocks if present
    let jsonContent = generatedContent;
    const jsonMatch = generatedContent.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1];
    }

    let learningMap;
    try {
      learningMap = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('Raw content:', generatedContent);
      return new Response(
        JSON.stringify({ error: 'Failed to parse learning map structure' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully generated learning map for:', topic);

    return new Response(
      JSON.stringify(learningMap),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-learning-map function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});