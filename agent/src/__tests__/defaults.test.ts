import { describe, it, expect } from '@jest/globals';
import { Client } from '@langchain/langgraph-sdk';

// This test verifies that running without a configurable uses our defaults
// (retrieverProvider=memory, models=openai/gpt-4o-mini) and returns a response.

describe('Defaults behavior (no configurable passed)', () => {
  const client = new Client({ apiUrl: 'http://localhost:2024' });

  it('should produce a response and retrieve docs using memory retriever', async () => {
    const stream = client.runs.stream(
      null,
      'retrieval_graph',
      {
        input: { messages: [{ role: 'user', content: 'Quick idea for kale and quinoa?' }] },
        streamMode: 'values'
      }
    );

    let finalResponse = '';
    let hasRetrievedDocs = false;

    for await (const chunk of stream) {
      if (chunk.event === 'values' && chunk.data) {
        const data = chunk.data as any;
        const messages = data.messages || [];
        const last = messages[messages.length - 1];
        if (last && last.type === 'ai' && last.content) {
          finalResponse = last.content;
        }
        if (Array.isArray(data.retrievedDocs) && data.retrievedDocs.length > 0) {
          hasRetrievedDocs = true;
        }
      }
    }

    expect(finalResponse).toBeTruthy();
    expect(finalResponse.length).toBeGreaterThan(10);
    expect(hasRetrievedDocs).toBe(true);
  }, 30000);
});


