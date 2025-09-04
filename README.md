# Chef Chopski - AI Sous Chef with Conversation Monitoring

Chef Chopski is an AI-powered sous chef that helps with CSA-based meal planning, high-protein plant-based recipes, and longevity-focused cooking. This application extends beyond a simple custom GPT by providing comprehensive conversation tracking, feedback collection, and monitoring capabilities.

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js + React + TypeScript
- **Database**: Supabase (PostgreSQL)
- **AI Provider**: OpenAI GPT-5-nano
- **Styling**: Tailwind CSS

### Key Features
1. **Conversation Tracking**: All user-AI interactions are stored with detailed metadata
2. **Feedback System**: User satisfaction tracking with tags and comments
3. **Review Dashboard**: Web interface for manually reviewing conversations
4. **Performance Metrics**: Track key success indicators over time
5. **Scalable Architecture**: Designed to support multiple users and AI providers

## Project Structure

```
chef-chopsky/
├── frontend/               # Next.js React application
│   ├── app/               # Next.js app directory
│   ├── components/        # React components
│   ├── lib/               # Database and AI services
│   └── package.json
├── ai/                    # Original custom GPT configuration
└── package.json           # Root package.json
```

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- Supabase account (free tier)
- OpenAI API key

### 1. Clone and Install Dependencies
```bash
git clone <repository-url>
cd chef-chopsky
npm run install:all
```

### 2. Database Setup (Supabase)
1. Create a Supabase account at https://supabase.com/
2. Create a new project named "chef-chopsky"
3. Go to SQL Editor in your Supabase dashboard
4. Copy and paste the contents of `backend/src/database/schema.sql`
5. Click "Run" to execute the schema

### 3. Environment Configuration
1. Copy `backend/env.example` to `backend/.env`
2. Copy `frontend/env.example` to `frontend/.env.local`
3. Update the environment variables:
   - Set your PostgreSQL credentials
   - Add your OpenAI API key
   - Configure server ports if needed

### 4. Start Development Server
```bash
# Start the frontend
npm run dev

# The app will be available at http://localhost:3000
```

## API Endpoints

The application uses Next.js API routes for AI integration:

### AI
- `POST /api/ai/chat` - Generate AI responses using OpenAI

All other operations (conversations, messages, feedback) are handled directly through Supabase client in the frontend.

## Usage

### Starting a Conversation
1. Navigate to the dashboard at `http://localhost:3000`
2. Click "New Conversation"
3. Fill in conversation details (title, CSA items, dietary preferences)
4. Start chatting with Chef Chopsky

### Reviewing Conversations
1. View all conversations on the dashboard
2. Click "View" on any conversation to see the full exchange
3. Submit feedback after completing a conversation

### Monitoring Quality
- Track satisfaction scores over time
- Review conversation metadata (tokens used, processing time)
- Analyze feedback patterns and tags

## Deployment

### Frontend Deployment (Vercel)
1. Connect your repository to Vercel
2. Configure environment variables (Supabase and OpenAI)
3. Deploy

## Future Enhancements

### Phase 2: Advanced Monitoring
- Automated conversation quality scoring
- A/B testing different AI prompts
- Integration with multiple AI providers
- Real-time conversation analytics

### Phase 3: Mobile App
- React Native mobile application
- Offline conversation caching
- Push notifications for meal reminders

### Phase 4: Advanced Features
- Recipe recommendation engine
- Nutritional analysis
- Meal planning calendar integration
- Social sharing features

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
