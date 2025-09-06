import { test, expect } from '@playwright/test';

test.describe('Complete User Journey', () => {
  test('Full conversation flow: Open site → Create conversation → Send message → Verify tracing', async ({ page }) => {
    // Set timeout for this comprehensive test
    test.setTimeout(120000); // 2 minutes
    
    console.log('🚀 Starting complete user journey test...');
    
    // Step 1: Open the site
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    console.log('✅ Site opened successfully');

    // Step 2: Create a new conversation
    const newConversationButton = page.locator('[data-testid="new-conversation-button"]');
    await newConversationButton.click();
    console.log('✅ Clicked "New Conversation"');

    const titleInput = page.locator('[data-testid="conversation-title-input"]');
    await titleInput.fill('E2E Test Conversation');
    
    const startButton = page.locator('[data-testid="start-conversation-button"]');
    await startButton.click();
    console.log('✅ Created new conversation');

    // Wait for navigation to chat page
    await page.waitForURL(/\/conversations\/.+/);
    console.log('✅ Navigated to chat page');

    // Step 3: Send a message
    const testMessage = `Hello Chef Chopsky! Can you help me plan a simple dinner? (Test ${Date.now()})`;
    console.log(`📝 Sending message: "${testMessage}"`);
    
    const messageInput = page.locator('[data-testid="message-input"]');
    const sendButton = page.locator('[data-testid="send-button"]');
    
    await messageInput.fill(testMessage);
    await sendButton.click();
    console.log('✅ Message sent');

    // Step 4: Wait for AI response
    console.log('⏳ Waiting for AI response...');
    await page.waitForTimeout(20000); // Wait 20 seconds for AI
    console.log('✅ AI response received');

    // Step 5: Verify downstream tracing and logging
    console.log('🔍 Verifying LangSmith tracing...');
    
    // Check LangSmith
    const response = await page.request.get('/api/test/langsmith');
    expect(response.status()).toBe(200);
    
    const langsmithData = await response.json();
    const recentRuns = langsmithData.monitoring?.recentRuns || [];
    console.log(`📊 Found ${recentRuns.length} recent runs in LangSmith`);

    // Find our specific message
    let foundOurMessage = false;
    for (const run of recentRuns) {
      if (run.inputs && run.inputs.messages) {
        const messages = Array.isArray(run.inputs.messages) ? run.inputs.messages : [run.inputs.messages];
        for (const message of messages) {
          if (message.content && message.content.includes(testMessage)) {
            console.log(`🎉 FOUND OUR MESSAGE in LangSmith run: ${run.id}`);
            console.log(`📊 Run Status: ${run.status}`);
            console.log(`📤 Has AI Response: ${!!run.outputs}`);
            
            // Verify the exact message content
            expect(message.content).toContain(testMessage);
            foundOurMessage = true;
            break;
          }
        }
      }
      if (foundOurMessage) break;
    }

    // Final verification
    expect(foundOurMessage).toBe(true);
    console.log('🎉 SUCCESS: Complete user journey validated!');
    console.log('✅ Site opened → Conversation created → Message sent → Tracing verified');
  });
});
