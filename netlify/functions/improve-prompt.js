// Netlify Function: improve-prompt
// Calls Claude API to analyze and improve user prompts

exports.handler = async (event, context) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Parse request body
  let prompt;
  try {
    const body = JSON.parse(event.body);
    prompt = body.prompt;
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid request body' })
    };
  }

  if (!prompt || prompt.length > 2000) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid prompt' })
    };
  }

  // Get API key from environment
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API key not configured' })
    };
  }

  // System prompt for the improver
  const systemPrompt = `You are an expert prompt engineer helping executives write better prompts for AI tools like ChatGPT and Claude.

Your task is to take a user's original prompt and:
1. Improve it to be clearer, more specific, and more effective
2. Explain what you changed and why

Guidelines for improving prompts:
- Add specificity (audience, format, length, tone)
- Include relevant context
- Break complex requests into steps
- Add constraints when helpful
- Request specific output formats when appropriate
- Remove ambiguity

Respond in this exact JSON format:
{
  "improvedPrompt": "The improved version of their prompt goes here",
  "explanation": "<p>Brief intro about the improvements.</p><ul><li><strong>Change 1:</strong> What you changed and why</li><li><strong>Change 2:</strong> What you changed and why</li><li><strong>Change 3:</strong> What you changed and why</li></ul><p>Closing tip or insight.</p>"
}

Keep the improved prompt practical and usable. Keep explanations concise but educational. Use HTML formatting in the explanation for readability.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: `Please improve this prompt:\n\n${prompt}`
          }
        ],
        system: systemPrompt
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', errorText);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to process prompt' })
      };
    }

    const data = await response.json();
    const content = data.content[0].text;
    
    // Parse the JSON response
    let result;
    try {
      // Extract JSON from potential markdown code blocks
      let jsonStr = content;
      if (content.includes('```json')) {
        jsonStr = content.split('```json')[1].split('```')[0];
      } else if (content.includes('```')) {
        jsonStr = content.split('```')[1].split('```')[0];
      }
      result = JSON.parse(jsonStr.trim());
    } catch (parseErr) {
      // If parsing fails, create a structured response from the text
      result = {
        improvedPrompt: content,
        explanation: '<p>Your prompt has been improved. See the enhanced version above.</p>'
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(result)
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
