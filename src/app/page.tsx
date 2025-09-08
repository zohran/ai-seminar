'use client';

import { useState } from 'react';
import { Navigation } from '@/components/navigation';
import { QuestionForm } from '@/components/question-form';
import { CreateQuestionDto } from '@/types/question';
import { CheckCircle, AlertCircle } from 'lucide-react';

/**
 * Client-side React page component that renders the AI Seminar Question Management UI.
 *
 * Renders navigation, a header, a question submission form, and a contextual success/error
 * banner. Handles form submissions by POSTing the provided CreateQuestionDto to `/api/questions`,
 * showing a success or error message based on the API response, and managing a loading state
 * while the request is in progress.
 *
 * @returns The page's JSX element.
 */
export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  console.log("message", message);
  
  const handleSubmit = async (data: CreateQuestionDto) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({
          type: 'success',
          text: 'Question submitted successfully!'
        });
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Failed to submit question'
        });
      }
    } catch {
      setMessage({
        type: 'error',
        text: 'Network error. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">AI Seminar Question Management</h1>
          <p className="text-muted-foreground text-lg">
            Submit your questions and track their urgency levels
          </p>
        </div>

      

        {/* Message Display */}
        {message && (
          <div className={`max-w-2xl mx-auto mb-6 p-4 rounded-md flex items-center space-x-2 ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <QuestionForm onSubmit={handleSubmit} isLoading={isLoading} />
      </main>
    </div>
  );
}
