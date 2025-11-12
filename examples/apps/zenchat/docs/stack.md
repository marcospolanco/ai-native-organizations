# Layout Stack & Architecture

### Core Framework

- **Next.js 15.4.6** - App Router with server-side rendering
- **React 19.1.0** - Modern React with concurrent features
- **TypeScript 5** - Type-safe development

### AI Integration

- **AI SDK 5.0.8** - Core AI streaming and model management
- **@ai-sdk/openai 2.0.64** - OpenAI provider
- **@ai-sdk/react 2.0.8** - React chat hooks

### UI Components

- **Tailwind CSS 4** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **next-themes** - Theme management

### Content Rendering

- **react-markdown 10.1.0** - Markdown rendering
- **react-syntax-highlighter** - Code highlighting
- **rehype-katex** - LaTeX math rendering
- **remark-gfm** - GitHub Flavored Markdown
- **harden-react-markdown** - Security hardening

### Development

- **ESLint 9** - Code linting
- **Turbopack** - Fast development bundler

## Architecture

### Directory Structure

```
app/
├── api/chat/route.ts     # Chat API with streaming
├── layout.tsx           # Root layout
└── page.tsx            # Main app

components/
├── ai-chat.tsx         # Main chat interface
├── ai-elements/        # Chat components
└── ui/                 # Base UI components
```

### Data Flow

1. **Client**: User input → Model selection → API request
2. **Server**: `/api/chat` route → Model resolution → AI processing
3. **Response**: Streaming data → Component rendering → UI update

### Key Features

- **Streaming**: Real-time AI responses via AI SDK
- **Markdown**: Enhanced rendering with math/code support
- **Models**: Pluggable AI model architecture
- **Security**: Server-side API keys, hardened markdown
