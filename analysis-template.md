# ChatGPT Cooking Questions - Quick Analysis Template

## Step 1: Add Your URLs
Edit `chatgpt-extractor.js` and add all your ChatGPT URLs to the `urls` array.

## Step 2: Extract Questions
```bash
node chatgpt-extractor.js
```

## Step 3: Analyze Categories
```bash
node analyze-questions.js
```

## Step 4: Manual Review & Prioritization

### Category Frequency (from analysis)
- [ ] Recipe: ___ questions
- [ ] Ingredients: ___ questions  
- [ ] Techniques: ___ questions
- [ ] Planning: ___ questions
- [ ] Troubleshooting: ___ questions

### Quick Priority Scoring (1-5 scale)
Rate each category on:
- **Frequency**: How often you ask this type? (1=rare, 5=very common)
- **Importance**: How critical is getting a good answer? (1=nice to have, 5=essential)

| Category | Frequency | Importance | Priority Score |
|----------|-----------|------------|----------------|
| Recipe | ___ | ___ | ___ |
| Ingredients | ___ | ___ | ___ |
| Techniques | ___ | ___ | ___ |
| Planning | ___ | ___ | ___ |
| Troubleshooting | ___ | ___ | ___ |

### Top Use Cases for Chef Chopsky
Based on your analysis, list the top 3-5 use cases:

1. **Use Case**: [Category] - [Brief description]
   - **Why**: [Why this is important to you]
   - **Current Pain**: [What's frustrating about ChatGPT's answers]

2. **Use Case**: [Category] - [Brief description]
   - **Why**: [Why this is important to you]
   - **Current Pain**: [What's frustrating about ChatGPT's answers]

3. **Use Case**: [Category] - [Brief description]
   - **Why**: [Why this is important to you]
   - **Current Pain**: [What's frustrating about ChatGPT's answers]

### Unique/Interesting Questions
List any particularly unique or interesting questions that stood out:

- [Question 1]
- [Question 2]
- [Question 3]

## Next Steps
1. Focus Chef Chopsky development on the top 2-3 use cases
2. Design features that specifically address the "Current Pain" points
3. Test early prototypes against these specific use cases
