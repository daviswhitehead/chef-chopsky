# Manual Testing Guide - User Story 5

This guide provides step-by-step instructions for manually testing the complete frontend-agent integration.

## Prerequisites

1. **Services Running**: Both frontend and agent services must be running
2. **Environment Variables**: All required environment variables must be configured
3. **Supabase Database**: Database must be accessible and properly configured
4. **OpenAI API Key**: Valid API key for AI functionality

## Setup Instructions

### 1. Start Services

**Option A: Start both services together (for normal development)**
```bash
# Start both services
npm run dev

# Verify services are running
npm run health:check
```

**Note**: When using `npm run dev`, the services are managed by `concurrently` with `--kill-others` flag. This means if one service stops, both will stop. For error testing, use Option B.

**Option B: Start services separately (for testing error scenarios)**
```bash
# Start frontend service
npm run dev:frontend

# In another terminal, start agent service
npm run dev:agent

# Verify services are running
npm run health:check
```

### 2. Verify Service Health
- Frontend: http://localhost:3000
- Agent Service: http://localhost:3001/health

## Manual Test Scenarios

### Test 1: Complete User Journey (Smoke Test)

**Objective**: Verify the complete user journey works end-to-end

**Steps**:
1. **Open Browser**: Navigate to http://localhost:3000
2. **Create Conversation**: 
   - Click "New Conversation" or "Create Conversation"
   - Fill in conversation details (title, description)
   - Click "Create" or "Save"
3. **Send Message**:
   - Type a message in the chat input: "Give me a simple dinner idea"
   - Click "Send" or press Enter
4. **Verify Response**:
   - Loading indicator should appear
   - Assistant response should appear within 10-30 seconds
   - Response should be relevant to the cooking/food domain

**Expected Results**:
- ✅ Conversation is created successfully
- ✅ Message is sent and appears in chat
- ✅ Loading indicator shows during processing
- ✅ Assistant response appears with relevant content
- ✅ Both messages persist after page refresh

### Test 2: Different Message Types and Lengths

**Objective**: Test various message types and lengths

**Test Cases**:

#### Short Messages
- "Hi"
- "Help"
- "Recipe"

#### Medium Messages
- "Give me a healthy dinner recipe for tonight"
- "What are the benefits of quinoa?"
- "How do I meal prep for the week?"

#### Long Messages
- "I need a comprehensive meal plan for the week that includes breakfast, lunch, and dinner. I prefer plant-based proteins and want to focus on longevity nutrition. Please include shopping lists and prep instructions."

#### Question Types
- "What are the health benefits of quinoa?"
- "How do I store fresh herbs?"
- "What's the difference between baking and roasting?"

#### Request Types
- "Can you help me plan meals for a family of 4 with dietary restrictions?"
- "I need a 30-minute dinner recipe using chicken and vegetables"

#### Complex Requests (Timeout Testing)
- "Create a comprehensive meal plan for the week with detailed recipes, shopping lists, and prep instructions."
- "I need a detailed nutritional analysis and meal plan for a family of 4 with specific dietary restrictions including gluten-free and dairy-free options."

**Expected Results**:
- ✅ All message types are processed successfully
- ✅ Responses are appropriate for the message type
- ✅ Long messages don't cause timeouts (should complete within 60-90 seconds)
- ✅ Questions receive informative answers
- ✅ Requests are fulfilled appropriately
- ✅ Complex requests show progress indicators with elapsed time
- ✅ Loading message changes to "working on a complex request" after 30 seconds

### Test 3: Loading States and Error Handling

**Objective**: Verify loading states and error handling work correctly

**Prerequisites**: Start services separately for this test
```bash
# Terminal 1: Start frontend
npm run dev:frontend

# Terminal 2: Start agent
npm run dev:agent
```

**Steps**:
1. **Normal Loading**:
   - Send a message and observe loading indicator
   - Verify loading indicator disappears when response arrives
2. **Error Scenarios**:
   - Stop the agent service: `kill $(lsof -ti:3001)`
   - Send a message
   - Verify "Service Unavailable" error popup appears
   - Verify error message appears in chat: "Sorry, I'm having trouble connecting right now..."
   - Restart agent service: `npm run dev:agent`
   - Send another message
   - Verify it works again

**Expected Results**:
- ✅ Loading indicator appears during processing
- ✅ Loading indicator disappears when response arrives
- ✅ "Service Unavailable" error popup appears when agent is down
- ✅ Error message appears in chat: "Sorry, I'm having trouble connecting right now..." (appears immediately for connection errors)
- ✅ System recovers when agent service is restored
- ✅ No infinite loading states

### Test 4: Browser Network Tab Verification

**Objective**: Verify proper API calls are made

**Automated Testing**: ✅ **NOW AVAILABLE**
- Use `npm run test:e2e:network` to run automated network verification
- Captures all network requests automatically during E2E tests
- Validates API calls, status codes, and payloads
- Provides detailed logging of all network activity

**Manual Testing** (fallback):
1. **Open Developer Tools**: Press F12 or right-click → Inspect
2. **Go to Network Tab**: Click on "Network" tab
3. **Send a Message**: Send a message in the chat
4. **Analyze Network Calls**:
   - Look for calls to `/api/ai/chat`
   - Look for calls to `/api/conversations/*`
   - Check response status codes
   - Verify request/response payloads

**Expected API Calls**:
- `POST /api/ai/chat` - Send message to agent
- `GET /api/conversations/:id/messages` - Retrieve messages
- `POST /api/conversations` - Create conversation (if applicable)

**Expected Results**:
- ✅ API calls are made with correct methods and endpoints
- ✅ Request payloads contain required fields
- ✅ Response status codes are 200 for successful requests
- ✅ Error responses have appropriate status codes (400, 503, etc.)
- ✅ No unnecessary or duplicate API calls

### Test 5: Message Persistence

**Objective**: Verify messages persist correctly

**Steps**:
1. **Send Multiple Messages**:
   - Send 3-4 different messages in a conversation
   - Wait for responses
2. **Refresh Page**: Press F5 or Ctrl+R
3. **Verify Persistence**:
   - All messages should still be visible
   - Message order should be preserved
   - Both user and assistant messages should persist

**Expected Results**:
- ✅ All messages persist after page refresh
- ✅ Message order is preserved
- ✅ Both user and assistant messages are saved
- ✅ No duplicate messages appear

### Test 6: Timeout Scenarios and Complex Requests

**Objective**: Verify system handles complex requests and timeout scenarios gracefully

**Steps**:
1. **Complex Request Testing**:
   - Send a comprehensive meal planning request
   - Observe loading indicator with elapsed time
   - Verify loading message changes after 30 seconds
   - Confirm request completes within 60-90 seconds
2. **Timeout Behavior**:
   - Send multiple complex requests simultaneously
   - Verify each request gets appropriate timeout handling
   - Check that retry mechanisms work if needed
3. **Progress Indicators**:
   - Send a complex request and observe:
     - Initial "Chef Chopsky is thinking..." message
     - Elapsed time counter
     - Message change to "working on a complex request" after 30 seconds
     - Final response or timeout handling

**Expected Results**:
- ✅ Complex requests complete successfully within timeout limits
- ✅ Progress indicators show elapsed time accurately
- ✅ Loading messages update appropriately for long requests
- ✅ Timeout handling is graceful with retry options
- ✅ No duplicate messages during retries
- ✅ System recovers from timeout scenarios

### Test 7: LangSmith Trace Verification

**Objective**: Verify LangSmith traces are created (if configured)

**Steps**:
1. **Check LangSmith Dashboard**: 
   - Go to https://smith.langchain.com/
   - Look for project "chef chopsky"
2. **Send Test Message**: Send a message in the chat
3. **Check Traces**:
   - Look for new traces in the dashboard
   - Verify trace metadata includes:
     - conversation_id
     - message_id
     - environment
     - model
     - latency_ms

**Expected Results**:
- ✅ Traces appear in LangSmith dashboard
- ✅ Trace metadata includes required fields
- ✅ Traces show proper timing information
- ✅ Project name is "chef chopsky"

## Error Scenarios to Test

### Agent Service Down
1. Stop agent service
2. Send message
3. Verify error message appears
4. Restart agent service
5. Send message again
6. Verify it works

### Network Issues
1. Disconnect internet
2. Send message
3. Verify error handling
4. Reconnect internet
5. Send message again
6. Verify recovery

### Invalid Data
1. Try to send empty messages
2. Try to send messages without conversation ID
3. Verify proper error messages

## Performance Testing

### Response Time
- Measure time from message send to response received
- Should be under 30 seconds for most messages
- Longer messages may take more time

### Concurrent Users
- Open multiple browser tabs
- Send messages simultaneously
- Verify all work correctly

## Browser Compatibility

Test in multiple browsers:
- Chrome
- Firefox
- Safari
- Edge

## Mobile Testing

Test on mobile devices:
- iOS Safari
- Android Chrome
- Responsive design
- Touch interactions

## Troubleshooting

### Common Issues

1. **Services Not Starting**:
   - Check if ports 3000 and 3001 are available
   - Verify environment variables are set
   - Check console for error messages

2. **Messages Not Sending**:
   - Check browser console for errors
   - Verify API endpoints are accessible
   - Check network tab for failed requests

3. **No AI Responses**:
   - Verify OpenAI API key is valid
   - Check agent service logs
   - Verify LangSmith configuration (if used)

4. **Messages Not Persisting**:
   - Check Supabase connection
   - Verify database permissions
   - Check browser console for errors

### Debug Commands

```bash
# Check service health
npm run health:check

# Check logs
npm run dev  # Check console output

# Test API directly
curl -X POST http://localhost:3001/chat \
  -H "Content-Type: application/json" \
  -d '{"conversation_id": "test", "messages": [{"role": "user", "content": "Hello"}]}'
```

## Success Criteria

All tests should pass with:
- ✅ Complete user journey works end-to-end
- ✅ All message types are handled correctly
- ✅ Loading states work properly
- ✅ Error handling is graceful
- ✅ API calls are correct and efficient
- ✅ Messages persist correctly
- ✅ LangSmith traces are created (if configured)
- ✅ Performance is acceptable (< 30 seconds response time)
- ✅ Works across different browsers and devices

## Test Results Template

```
Manual Test Results - [Date]

Test 1: Complete User Journey
- [ ] Conversation creation works
- [ ] Message sending works
- [ ] AI response received
- [ ] Messages persist after refresh

Test 2: Message Types
- [ ] Short messages work
- [ ] Medium messages work
- [ ] Long messages work
- [ ] Questions work
- [ ] Requests work

Test 3: Loading States
- [ ] Loading indicator appears
- [ ] Loading indicator disappears
- [ ] Error handling works
- [ ] Recovery works

Test 4: Network Tab
- [ ] Correct API calls made
- [ ] Proper status codes
- [ ] Correct payloads
- [ ] No duplicate calls

Test 5: Message Persistence
- [ ] Messages persist
- [ ] Order preserved
- [ ] No duplicates

Test 6: Timeout Scenarios
- [ ] Complex requests complete successfully
- [ ] Progress indicators work correctly
- [ ] Loading messages update appropriately
- [ ] Timeout handling is graceful
- [ ] No duplicate messages during retries

Test 7: LangSmith Traces
- [ ] Traces created
- [ ] Metadata correct
- [ ] Timing accurate

Overall Result: [PASS/FAIL]
Notes: [Any issues or observations]
```
