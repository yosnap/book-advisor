'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Badge from '@/components/Badge';

interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  synopsis: string;
  difficulty?: string;
  publicationYear?: number;
  tags?: string[];
}

interface Recommendation {
  rank: number;
  book: Book;
  matchScore: number;
  justification: string;
  scoreBreakdown?: {
    interestMatch: number;
    difficultyMatch: number;
    moodMatch: number;
  };
}

export default function RecommendationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [context, setContext] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);
        const mood = searchParams.get('mood');
        const readerType = searchParams.get('readerType');
        const intention = searchParams.get('intention');
        const favoriteGenres = searchParams.get('favoriteGenres')?.split(',') || [];

        setContext({
          mood,
          readerType,
          intention,
          favoriteGenres,
        });

        // Create request payload
        const payload = {
          context: {
            mood,
            profile: readerType,
            interests: favoriteGenres,
            intent: intention,
          },
        };

        // Fetch recommendations from API
        const response = await fetch('/api/v1/recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch recommendations');
        }

        const data = await response.json();

        if (data.books && Array.isArray(data.books)) {
          const formattedRecommendations = data.books.map((book: any, idx: number) => ({
            rank: idx + 1,
            book: {
              id: book.id,
              title: book.title,
              author: book.author,
              genre: book.genre,
              synopsis: book.synopsis,
              difficulty: book.difficulty,
              publicationYear: book.publicationYear,
              tags: book.tags || [],
            },
            matchScore: book.score || book.matchScore || 0,
            justification: book.justification || 'Este libro coincide con tus preferencias',
            scoreBreakdown: book.scoreBreakdown,
          }));
          setRecommendations(formattedRecommendations);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching recommendations');
        console.error('Error fetching recommendations:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [searchParams]);

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600';
    if (score >= 0.75) return 'text-yellow-600';
    return 'text-orange-600';
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="secondary"
            onClick={() => router.push('/')}
            className="mb-4"
          >
            ← Volver
          </Button>

          <h1 className="font-primary font-bold text-4xl text-gray-900 mb-4">
            Tus recomendaciones personalizadas
          </h1>

          {context && (
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="primary">{context.mood}</Badge>
              <Badge variant="secondary">{context.readerType}</Badge>
              <Badge variant="success">{context.intention}</Badge>
            </div>
          )}

          <p className="text-gray-600 max-w-2xl">
            Basadas en tu estado actual de ánimo y preferencias de lectura, aquí están los libros que te recomendamos especialmente para ti.
          </p>
        </div>

        {/* Recommendations */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <svg
              className="animate-spin h-12 w-12 text-indigo-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
            <p className="font-semibold mb-2">Error</p>
            <p>{error}</p>
            <Button
              variant="secondary"
              onClick={() => router.push('/')}
              className="mt-4"
            >
              Intentar de nuevo
            </Button>
          </div>
        ) : recommendations.length > 0 ? (
          <div className="space-y-6">
            {recommendations.map((rec) => (
              <Card key={rec.book.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <Badge variant="primary">#{rec.rank}</Badge>
                      <span className={`text-3xl font-bold ${getScoreColor(rec.matchScore)}`}>
                        {Math.round(rec.matchScore * 100)}%
                      </span>
                    </div>

                    <h2 className="font-primary font-bold text-2xl text-gray-900 mb-2">
                      {rec.book.title}
                    </h2>

                    <p className="text-gray-600 mb-3">
                      por <span className="font-semibold">{rec.book.author}</span>
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="primary">{rec.book.genre}</Badge>
                      {rec.book.publicationYear && (
                        <Badge variant="secondary">{rec.book.publicationYear}</Badge>
                      )}
                      {rec.book.difficulty && (
                        <Badge variant="success">Nivel: {rec.book.difficulty}</Badge>
                      )}
                    </div>

                    {rec.book.synopsis && (
                      <p className="text-gray-700 mb-4 line-clamp-3">
                        {rec.book.synopsis}
                      </p>
                    )}

                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
                      <p className="text-sm font-semibold text-indigo-900 mb-2">
                        Por qué te recomendamos este libro:
                      </p>
                      <p className="text-indigo-800">
                        {rec.justification}
                      </p>
                    </div>

                    {rec.scoreBreakdown && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
                        <p className="font-semibold text-gray-700 mb-2">Desglose de puntuación:</p>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <p className="text-gray-600">Intereses</p>
                            <p className="font-bold text-gray-900">
                              {Math.round(rec.scoreBreakdown.interestMatch * 100)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Dificultad</p>
                            <p className="font-bold text-gray-900">
                              {Math.round(rec.scoreBreakdown.difficultyMatch * 100)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Estado anímico</p>
                            <p className="font-bold text-gray-900">
                              {Math.round(rec.scoreBreakdown.moodMatch * 100)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                  <Button variant="primary" size="sm">
                    Ver más información
                  </Button>
                  <Button variant="outline" size="sm">
                    Guardar para después
                  </Button>
                  <Button variant="ghost" size="sm">
                    Compartir
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-6">
              No encontramos recomendaciones que se ajusten a tus criterios.
            </p>
            <Button variant="primary" onClick={() => router.push('/')}>
              Probar con otros criterios
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
