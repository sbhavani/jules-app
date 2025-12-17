import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, provider, apiKey, model, threadId, assistantId } = body;

    if (!messages || !provider || !apiKey) {
      return NextResponse.json(
        { error: 'Missing required fields: messages, provider, or apiKey' },
        { status: 400 }
      );
    }

    // 1. OpenAI Assistants API Logic (Stateful)
    if (provider === 'openai-assistants' && messages.length > 0) {
      // We expect the *latest* user message to be the last one in the array
      const lastMessage = messages[messages.length - 1];
      const userContent = lastMessage.role === 'user' ? lastMessage.content : null;

      if (!userContent && !threadId) {
         return NextResponse.json({ content: '' });
      }

      // Create/Retrieve Assistant
      let activeAssistantId = assistantId;
      if (!activeAssistantId) {
        const assistantResp = await fetch('https://api.openai.com/v1/assistants', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'OpenAI-Beta': 'assistants=v2'
          },
          body: JSON.stringify({
            name: "Jules Supervisor",
            instructions: "You are a project supervisor. Your goal is to keep the AI agent 'Jules' on track. Identify if the agent is stuck, off-track, or needs guidance. Provide a concise, direct instruction or feedback to the agent. Do not be conversational. Be directive but polite. Focus on the next task.",
            model: model || "gpt-4o",
          })
        });
        if (!assistantResp.ok) throw new Error("Failed to create assistant");
        const assistantData = await assistantResp.json();
        activeAssistantId = assistantData.id;
      }

      // Create/Retrieve Thread
      let activeThreadId = threadId;
      if (!activeThreadId) {
        const threadResp = await fetch('https://api.openai.com/v1/threads', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'OpenAI-Beta': 'assistants=v2'
          },
          body: JSON.stringify({})
        });
        if (!threadResp.ok) throw new Error("Failed to create thread");
        const threadData = await threadResp.json();
        activeThreadId = threadData.id;
      }

      // Add Message
      if (userContent) {
        await fetch(`https://api.openai.com/v1/threads/${activeThreadId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'OpenAI-Beta': 'assistants=v2'
          },
          body: JSON.stringify({
            role: "user",
            content: userContent
          })
        });
      }

      // Run Assistant
      const runResp = await fetch(`https://api.openai.com/v1/threads/${activeThreadId}/runs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({
          assistant_id: activeAssistantId,
        })
      });
      if (!runResp.ok) throw new Error("Failed to run assistant");
      const runData = await runResp.json();
      const runId = runData.id;

      // Poll
      let runStatus = runData.status;
      let attempts = 0;
      while (runStatus !== 'completed' && runStatus !== 'failed' && attempts < 30) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const statusResp = await fetch(`https://api.openai.com/v1/threads/${activeThreadId}/runs/${runId}`, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'OpenAI-Beta': 'assistants=v2'
          }
        });
        const statusData = await statusResp.json();
        runStatus = statusData.status;
        attempts++;
      }

      if (runStatus !== 'completed') {
        throw new Error(`Assistant run failed or timed out: ${runStatus}`);
      }

      // Get Response
      const msgResp = await fetch(`https://api.openai.com/v1/threads/${activeThreadId}/messages`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'OpenAI-Beta': 'assistants=v2'
        }
      });
      const msgData = await msgResp.json();
      const lastMsg = msgData.data.filter((m: { role: string }) => m.role === 'assistant')[0];
      const content = lastMsg?.content?.[0]?.text?.value || '';

      return NextResponse.json({
        content,
        threadId: activeThreadId,
        assistantId: activeAssistantId
      });
    }

    // 2. Stateless Logic (Simulated State via Client History)
    let generatedContent = '';

    if (provider === 'openai') {
      // Standard Chat Completions API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model || 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are a project supervisor. Your goal is to keep the AI agent "Jules" on track. Read the conversation history provided by the user. Identify if the agent is stuck, off-track, or needs guidance. Provide a concise, direct instruction or feedback to the agent. Do not be conversational. Be directive but polite. Focus on the next task.'
            },
            ...messages.map((m: { role: string; content: string }) => ({
              role: m.role === 'user' ? 'user' : 'assistant', // Map role
              content: m.content
            }))
          ],
          max_tokens: 150,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      generatedContent = data.choices[0]?.message?.content || '';

    } else if (provider === 'anthropic') {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: model || 'claude-3-5-sonnet-20240620',
          system: 'You are a project supervisor. Your goal is to keep the AI agent "Jules" on track. Read the conversation history. Identify if the agent is stuck, off-track, or needs guidance. Provide a concise, direct instruction or feedback to the agent. Do not be conversational. Be directive but polite. Focus on the next task.',
          messages: messages.map((m: { role: string; content: string }) => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content
          })),
          max_tokens: 150,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Anthropic API error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      generatedContent = data.content[0]?.text || '';

    } else if (provider === 'gemini') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-1.5-flash'}:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: 'You are a project supervisor. Your goal is to keep the AI agent "Jules" on track. Read the conversation history. Identify if the agent is stuck, off-track, or needs guidance. Provide a concise, direct instruction or feedback to the agent. Do not be conversational. Be directive but polite. Focus on the next task.' }]
          },
          contents: messages.map((m: { role: string; content: string }) => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
          })),
          generationConfig: { maxOutputTokens: 150 }
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Gemini API error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      generatedContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else if (provider !== 'openai-assistants') {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
    }

    return NextResponse.json({ content: generatedContent });

  } catch (error) {
    console.error('Supervisor API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
