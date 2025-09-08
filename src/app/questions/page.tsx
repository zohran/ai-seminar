'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/navigation';
import { Question, URGENCY_LABELS, URGENCY_COLORS } from '@/types/question';
import { Loader2, AlertCircle, Calendar, Clock, Trash2, Edit } from 'lucide-react';

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ title: string; question: string; urgency: Question['urgency'] } | null>(null);

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/questions');
      const result = await response.json();
      
      if (result.success) {
        type RawQuestion = Omit<Question, 'createdAt' | 'updatedAt'> & {
          createdAt: string | Date;
          updatedAt: string | Date;
        };
        const normalized = (result.data || []).map((q: RawQuestion) => ({
          ...q,
          createdAt: new Date(q.createdAt),
          updatedAt: new Date(q.updatedAt)
        }));
        setQuestions(normalized);
      } else {
        setError(result.error || 'Failed to fetch questions');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      const response = await fetch(`/api/questions/${id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        setQuestions(prev => prev.filter(q => q.id !== id));
      } else {
        alert(result.error || 'Failed to delete question');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    }
  };

  const startEditing = (q: Question) => {
    setEditingId(q.id);
    setEditForm({ title: q.title, question: q.question, urgency: q.urgency });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const saveEdit = async (id: string) => {
    if (!editForm) return;
    try {
      const response = await fetch(`/api/questions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editForm.title,
          question: editForm.question,
          urgency: editForm.urgency
        })
      });
      const result = await response.json();
      if (result.success) {
        const updated: Question = {
          ...result.data,
          createdAt: new Date(result.data.createdAt),
          updatedAt: new Date(result.data.updatedAt)
        };
        setQuestions(prev => prev.map(q => (q.id === id ? updated : q)));
        cancelEditing();
      } else {
        alert(result.error || 'Failed to update question');
      }
    } catch (e) {
      alert('Network error. Please try again.');
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading questions...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Error Loading Questions</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <button
                onClick={fetchQuestions}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
              >
                Try Again
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Submitted Questions</h1>
          <p className="text-muted-foreground text-lg">
            View and manage all submitted questions
          </p>
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Questions Yet</h2>
            <p className="text-muted-foreground">
              No questions have been submitted yet. Be the first to submit one!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((question) => (
              <div
                key={question.id}
                className="bg-card border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    {editingId === question.id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editForm?.title || ''}
                          onChange={(e) => setEditForm(v => v ? { ...v, title: e.target.value } : v)}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary border-input bg-background text-foreground"
                          placeholder="Title"
                        />
                        <textarea
                          value={editForm?.question || ''}
                          onChange={(e) => setEditForm(v => v ? { ...v, question: e.target.value } : v)}
                          rows={5}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary border-input bg-background text-foreground resize-none"
                          placeholder="Question"
                        />
                        <select
                          value={editForm?.urgency || 'medium'}
                          onChange={(e) => setEditForm(v => v ? { ...v, urgency: e.target.value as Question['urgency'] } : v)}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary border-input bg-background text-foreground"
                        >
                          <option value="low">Low Priority</option>
                          <option value="medium">Medium Priority</option>
                          <option value="high">High Priority</option>
                        </select>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => saveEdit(question.id)}
                            className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="px-4 py-2 rounded-md border hover:bg-accent"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-xl font-semibold mb-2">{question.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {question.question}
                        </p>
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => (editingId === question.id ? cancelEditing() : startEditing(question))}
                      className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                      title="Edit question"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteQuestion(question.id)}
                      className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                      title="Delete question"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${URGENCY_COLORS[question.urgency]}`}
                    >
                      {URGENCY_LABELS[question.urgency]}
                    </span>
                    
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Created: {formatDate(question.createdAt)}</span>
                    </div>
                    
                    {question.updatedAt.getTime() !== question.createdAt.getTime() && (
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Updated: {formatDate(question.updatedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
