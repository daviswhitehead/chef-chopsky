import { test, expect } from '@playwright/test';

test.describe('Complete User Journey', () => {
  test('Full conversation flow: Open site → Create conversation → Send message → Verify tracing', async ({ page }) => {
    test.setTimeout(120000); // 2 minutes
    
    const testMessage = `Hello Chef Chopsky! Can you help me plan a simple dinner? (Test ${Date.now()})`;
    const conversationTitle = `E2E Test Conversation ${Date.now()}`;

    // Step 1: Open the site
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toHaveText('Chef Chopsky Dashboard');
    console.log('✅ Step 1: Site opened');

    // Step 2: Create a new conversation
    await page.getByTestId('new-conversation-button').click();
    await expect(page.getByRole('heading', { name: 'Start New Conversation' })).toBeVisible();
    await page.getByTestId('conversation-title-input').fill(conversationTitle);
    await page.getByTestId('start-conversation-button').click();

    // Wait for navigation to chat page
    await page.waitForURL(/\/conversations\/.+/);
    console.log('✅ Step 2: Conversation created');

    // Step 3: Send a message
    await page.getByTestId('message-input').fill(testMessage);
    await page.getByTestId('send-button').click();
    await expect(page.locator(`text="${testMessage}"`)).toBeVisible();
    console.log('✅ Step 3: Message sent');

    // Step 4: Wait for AI response (not loading state)
    let aiResponseFound = false;
    let attempts = 0;
    const maxAttempts = 12; // 2 minutes total

    while (attempts < maxAttempts && !aiResponseFound) {
      attempts++;
      const aiMessageContainers = await page.locator('.bg-gray-100').all();

      for (const container of aiMessageContainers) {
        const messageText = await container.textContent();
        if (messageText && messageText.trim().length > 10) {
          const isNotLoading = !messageText.includes('Chef Chopsky is thinking') &&
                              !messageText.includes('Loading') &&
                              !messageText.includes('animate-spin');

          const looksLikeAIResponse = messageText.includes('Hello') ||
                                      messageText.includes('help') ||
                                      messageText.includes('plan') ||
                                      messageText.includes('dinner') ||
                                      messageText.includes('meal') ||
                                      messageText.includes('ingredients') ||
                                      messageText.includes('dietary') ||
                                      messageText.includes('preferences') ||
                                      messageText.includes('assist') ||
                                      messageText.includes('share');

          if (isNotLoading && looksLikeAIResponse) {
            aiResponseFound = true;
            break;
          }
        }
      }

      if (!aiResponseFound) {
        await page.waitForTimeout(10000);
      }
    }

    expect(aiResponseFound).toBe(true);
    console.log('✅ Step 4: AI response received');

    // Step 5: Verify LangSmith tracing with retry mechanism
    console.log(`⏰ Test timestamp: ${new Date().toISOString()}`);
    
    let messageFoundInLangSmith = false;
    let ourRun = null;
    let langsmithAttempts = 0;
    const maxLangsmithAttempts = 6; // Increased to 6 attempts (30 seconds total)

    while (langsmithAttempts < maxLangsmithAttempts && !messageFoundInLangSmith) {
      langsmithAttempts++;
      console.log(`🔍 LangSmith verification attempt ${langsmithAttempts}/${maxLangsmithAttempts}`);
      
      await page.waitForTimeout(5000); // Wait between attempts

      const response = await page.request.get('/api/test/langsmith/monitoring');
      expect(response.status()).toBe(200);

      const langsmithData = await response.json();
      const recentRuns = langsmithData.monitoring?.recentRuns || [];

      console.log(`📊 Found ${recentRuns.length} recent runs in LangSmith`);
      console.log(`🔍 Test message we're looking for: "${testMessage}"`);
      console.log(`🔍 Test timestamp: ${new Date().toISOString()}`);

      // Look for our exact test message
      for (const run of recentRuns) {
        if (run.inputs && run.inputs.messages) {
          const messages = Array.isArray(run.inputs.messages) ? run.inputs.messages : [run.inputs.messages];
          for (const message of messages) {
            if (message.content && message.content.includes(testMessage)) {
              console.log(`🎉 FOUND EXACT MATCH in run: ${run.id}`);
              ourRun = run;
              messageFoundInLangSmith = true;
              break;
            }
          }
        }
        if (messageFoundInLangSmith) break;
      }

      if (!messageFoundInLangSmith) {
        console.log(`⏳ Attempt ${langsmithAttempts}: Test message not found, retrying...`);
        if (langsmithAttempts < maxLangsmithAttempts) {
          console.log(`📊 Recent runs on attempt ${langsmithAttempts}:`);
          recentRuns.slice(0, 2).forEach((run, index) => {
            const startTime = new Date(run.startTime).toLocaleString();
            console.log(`  ${index + 1}. Run ID: ${run.id}, Status: ${run.status}, Start: ${startTime}`);
          });
        }
      }
    }

    // STRICT VALIDATION: Must find exact message and successful run
    if (!messageFoundInLangSmith) {
      console.log(`❌ CRITICAL: Our exact test message "${testMessage}" was NOT found in LangSmith after ${maxLangsmithAttempts} attempts!`);
      console.log(`❌ This could mean:`);
      console.log(`   - LangSmith integration is broken`);
      console.log(`   - LangSmith API has significant delays (runs not immediately queryable)`);
      console.log(`   - Test is looking in wrong project or using wrong credentials`);
      console.log(`   - Manual verification in LangSmith UI shows the run exists`);
    }

    expect(messageFoundInLangSmith).toBe(true);
    expect(ourRun).not.toBeNull();
    expect(ourRun.status).toBe('success');
    console.log('✅ Step 5: LangSmith tracing verified');
  });
});