'use client';

import { useState } from 'react';
import { CreateQuestionDto, UrgencyLevel, URGENCY_LABELS } from '@/types/question';
import { Send, Loader2 } from 'lucide-react';

interface QuestionFormProps {
  onSubmit: (data: CreateQuestionDto) => Promise<void>;
  isLoading?: boolean;
}

export function QuestionForm({ onSubmit, isLoading = false }: QuestionFormProps) {
  const [formData, setFormData] = useState<CreateQuestionDto>({
    title: '',
    question: '',
    urgency: 'medium'
  });

  const [errors, setErrors] = useState<Partial<CreateQuestionDto>>({});

  const handleInputChange = (field: keyof CreateQuestionDto, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateQuestionDto> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.question.trim()) {
      newErrors.question = 'Question is required';
    }

    if (!formData.urgency) {
      newErrors.urgency = 'Urgency level is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      // Reset form on successful submission
      setFormData({
        title: '',
        question: '',
        urgency: 'medium'
      });
    } catch (error) {
      console.error('Error submitting question:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-card border rounded-lg p-6 shadow-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Submit a Question</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Field */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Question Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.title ? 'border-red-500' : 'border-input'
              } bg-background text-foreground`}
              placeholder="Enter a descriptive title for your question"
              disabled={isLoading}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Question Field */}
          <div>
            <label htmlFor="question" className="block text-sm font-medium mb-2">
              Your Question *
            </label>
            <textarea
              id="question"
              value={formData.question}
              onChange={(e) => handleInputChange('question', e.target.value)}
              rows={6}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none ${
                errors.question ? 'border-red-500' : 'border-input'
              } bg-background text-foreground`}
              placeholder="Describe your question in detail..."
              disabled={isLoading}
            />
            {errors.question && (
              <p className="mt-1 text-sm text-red-500">{errors.question}</p>
            )}
          </div>

          {/* Urgency Field */}
          <div>
            <label htmlFor="urgency" className="block text-sm font-medium mb-2">
              Urgency Level *
            </label>
            <select
              id="urgency"
              value={formData.urgency}
              onChange={(e) => handleInputChange('urgency', e.target.value as UrgencyLevel)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.urgency ? 'border-red-500' : 'border-input'
              } bg-background text-foreground`}
              disabled={isLoading}
            >
              {Object.entries(URGENCY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {errors.urgency && (
              <p className="mt-1 text-sm text-red-500">{errors.urgency}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Submit Question</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
