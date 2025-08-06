# AlgoViz Coach

An interactive algorithm learning platform that generates step-by-step explanations and visualizations for LeetCode-style problems using AI.

## Features

- **Problem Input**: Enter any LeetCode-style coding problem with examples and constraints
- **AI-Powered Solutions**: Generate comprehensive algorithm explanations and Python implementations using OpenAI GPT-4
- **Interactive Visualizations**: Step-by-step visual representations of algorithm execution (arrays, trees, graphs)
- **Chat Interface**: Ask follow-up questions about the algorithm, complexity, and implementation details
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 14, React 19, TypeScript, Tailwind CSS
- **State Management**: Zustand
- **Visualizations**: Custom SVG components, @visx libraries, @xyflow/react
- **AI Integration**: OpenAI API (GPT-4)
- **Testing**: Jest, Playwright, React Testing Library
- **Type Safety**: Zod schemas for data validation

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd algoviz-coach
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Enter a Problem**: Fill in the problem title, description, examples, and constraints
2. **Generate Solution**: Click "Generate Algorithm Solution" to get AI-powered analysis
3. **Explore Tabs**: 
   - **Explanation**: Read the algorithm breakdown and complexity analysis
   - **Code**: View and copy the Python implementation
   - **Visualization**: Watch step-by-step algorithm execution
4. **Ask Questions**: Use the chat interface for follow-up questions about the solution

## Testing

Run the test suites:

```bash
# Unit tests
npm run test

# E2E tests (requires running dev server)
npm run test:e2e

# Build verification
npm run build
```

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── chat/              # Chat interface components
│   ├── ui/                # General UI components
│   └── visualization/     # Visualization components
├── lib/                   # Utility libraries
│   ├── api/               # OpenAI integration
│   ├── schemas/           # Zod validation schemas
│   ├── store/             # Zustand state management
│   └── utils/             # Helper functions
└── tests/                 # Test suites
    ├── e2e/               # Playwright end-to-end tests
    └── unit/              # Jest unit tests
```

## Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key (required)
- `NODE_ENV`: Environment mode (development/production)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

This project is built for educational purposes. Please ensure you comply with OpenAI's usage policies when using the API.

## Deployment

The application can be deployed on Vercel, Netlify, or any platform supporting Next.js:

```bash
npm run build
npm start
```

Make sure to set the `OPENAI_API_KEY` environment variable in your deployment environment.
