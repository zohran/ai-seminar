# AI Seminar Question Management System

A modern web application built with Next.js for managing and tracking questions with urgency levels. The system stores data in Excel (.xlsx) files and provides a clean, responsive interface with dark/light theme support.

## Features

- **Question Submission**: Submit questions with title, description, and urgency level
- **Question Management**: View, edit, and delete submitted questions
- **Excel Storage**: All data is stored in .xlsx files for easy export and analysis
- **Theme Support**: Light and dark theme toggle
- **Responsive Design**: Works on desktop and mobile devices
- **Git Hooks**: Husky integration for code quality checks

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Storage**: Excel files (.xlsx) using xlsx library
- **Icons**: Lucide React
- **Theme**: next-themes
- **Git Hooks**: Husky + lint-staged

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── questions/
│   │       ├── route.ts          # GET, POST endpoints
│   │       └── [id]/
│   │           └── route.ts      # GET, PUT, DELETE endpoints
│   ├── questions/
│   │   └── page.tsx              # Questions list page
│   ├── layout.tsx                # Root layout with theme provider
│   └── page.tsx                  # Home page with question form
├── components/
│   ├── navigation.tsx            # Navigation component
│   ├── question-form.tsx         # Question submission form
│   ├── theme-provider.tsx        # Theme context provider
│   └── theme-toggle.tsx          # Theme toggle button
├── lib/
│   └── storage.ts                # Excel file storage utilities
└── types/
    └── question.ts               # TypeScript interfaces and types
```

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: 20+)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-seminar
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Submitting Questions

1. Navigate to the home page
2. Fill in the question title, description, and select urgency level
3. Click "Submit Question"
4. The question will be stored in the Excel file and displayed in the questions list

### Viewing Questions

1. Click "View Questions" in the navigation
2. See all submitted questions with their details
3. Use the edit/delete buttons to manage questions

### Theme Toggle

Click the sun/moon icon in the navigation to switch between light and dark themes.

## API Endpoints

- `GET /api/questions` - Retrieve all questions
- `POST /api/questions` - Create a new question
- `GET /api/questions/[id]` - Get a specific question
- `PUT /api/questions/[id]` - Update a question
- `DELETE /api/questions/[id]` - Delete a question

## Data Storage

Questions are stored in Excel format at `storage/questions.xlsx`. The file is automatically created when the first question is submitted.

## Git Hooks

The project includes Husky for git hooks:
- **Pre-commit**: Runs ESLint and lint-staged to ensure code quality
- **Lint-staged**: Automatically fixes linting issues before commit

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Quality

The project uses:
- TypeScript for type safety
- ESLint for code linting
- Prettier (via ESLint) for code formatting
- Husky for git hooks

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Commit your changes (Husky will run pre-commit hooks)
6. Push to your fork
7. Create a pull request

## License

This project is licensed under the MIT License.
