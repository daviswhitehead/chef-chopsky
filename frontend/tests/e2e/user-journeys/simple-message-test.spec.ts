import { test, expect } from '@playwright/test';

test.describe('Simple Message to LangSmith Test', () => {
  test('Send one message and verify it appears in LangSmith', async ({ page }) => {
    // Set a reasonable timeout for this simple test
    test.setTimeout(60000); // 1 minute
    
    console.log('🚀 Starting simple message test...');
    
    // Step 1: Navigate to main page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    console.log('✅ Navigated to main page');

    // Step 2: Create conversation
    const newConversationButton = page.locator('[data-testid="new-conversation-button"]');
    await newConversationButton.click();
    console.log('✅ Clicked "New Conversation"');

    // Fill form
    const titleInput = page.locator('[data-testid="conversation-title-input"]');
    await titleInput.fill('Simple Test Conversation');
    
    const startButton = page.locator('[data-testid="start-conversation-button"]');
    await startButton.click();
    console.log('✅ Created conversation');

    // Wait for navigation
    await page.waitForURL(/\/conversations\/.+/);
    console.log('✅ Navigated to chat page');

    // Step 3: Send message
    const testMessage = `Simple Test ${Date.now()}`;
    console.log(`📝 Sending message: "${testMessage}"`);
    
    const messageInput = page.locator('[data-testid="message-input"]');
    const sendButton = page.locator('[data-testid="send-button"]');
    
    await messageInput.fill(testMessage);
    await sendButton.click();
    console.log('✅ Message sent');

    // Step 4: Wait for AI response (simple wait)
    await page.waitForTimeout(15000); // Wait 15 seconds for AI
    console.log('⏳ Waited for AI response');

    // Step 5: Check LangSmith
    console.log('🔍 Checking LangSmith...');
    const response = await page.request.get('/api/test/langsmith');
    expect(response.status()).toBe(200);
    
    const langsmithData = await response.json();
    const recentRuns = langsmithData.monitoring?.recentRuns || [];
    console.log(`📊 Found ${recentRuns.length} recent runs`);

    // Step 6: Find our message
    let foundOurMessage = false;
    for (const run of recentRuns) {
      if (run.inputs && run.inputs.messages) {
        const messages = Array.isArray(run.inputs.messages) ? run.inputs.messages : [run.inputs.messages];
        for (const message of messages) {
          if (message.content && message.content.includes(testMessage)) {
            console.log(`🎉 FOUND OUR MESSAGE in run: ${run.id}`);
            console.log(`📊 Status: ${run.status}`);
            console.log(`📤 Has outputs: ${!!run.outputs}`);
            
            // Verify the exact message content
            expect(message.content).toContain(testMessage);
            foundOurMessage = true;
            break;
          }
        }
      }
      if (foundOurMessage) break;
    }

    // Step 7: Assert success
    expect(foundOurMessage).toBe(true);
    console.log('🎉 SUCCESS: Our message was found in LangSmith!');
  });
});
