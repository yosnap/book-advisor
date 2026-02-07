'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { ArrowLeft, Heart, Sparkles } from 'lucide-react';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import BookCover from '@/components/BookCover';

interface BookData {
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
  book: BookData;
  matchScore: number;
  justification: string;
  keyReasons?: string[];
  scoreBreakdown?: {
    interestMatch: number;
    difficultyMatch: number;
    moodMatch: number;
  };
}

export default function RecommendationsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-(--background) flex items-center justify-center">
        <svg className="animate-spin h-12 w-12 text-(--primary)" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    }>
      <RecommendationsContent />
    </Suspense>
  );
}

function RecommendationsContent() {
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

        const payload = {
          context: {
            mood,
            profile: readerType,
            interests: favoriteGenres,
            intent: intention,
          },
        };

        const response = await fetch('/api/v1/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
            keyReasons: book.keyReasons || [],
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

  return (
    <div className="min-h-screen bg-(--background)">
      {/* Results Header */}
      <div className="bg-(--surface) py-10 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-(--primary) text-sm font-medium mb-6 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </button>

          <h1 className="font-primary font-bold text-[32px] text-(--foreground) mb-4">
            Tus recomendaciones personalizadas
          </h1>

          <p className="text-sm text-(--muted-foreground) max-w-2xl">
            Basadas en tu estado actual de ánimo y preferencias de lectura, aquí están los libros que te recomendamos.
          </p>
        </div>
      </div>

      {/* Context Bar */}
      {context && (
        <div className="px-6 lg:px-12 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap items-center gap-3 bg-(--background) border border-(--border) rounded-md px-5 py-3">
              <Badge variant="primary">{context.mood}</Badge>
              <Badge variant="secondary">{context.readerType}</Badge>
              <Badge variant="success">{context.intention}</Badge>
              {context.favoriteGenres?.map((genre: string) => (
                <span key={genre} className="text-xs text-(--muted-foreground)">{genre}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="px-6 lg:px-12 py-10">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <svg
                className="animate-spin h-12 w-12 text-(--primary)"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
              <p className="font-semibold mb-2">Error</p>
              <p>{error}</p>
              <Button variant="outline" onClick={() => router.push('/')} className="mt-4">
                Intentar de nuevo
              </Button>
            </div>
          ) : recommendations.length > 0 ? (
            <div className="space-y-8">
              {recommendations.map((rec) => (
                <div key={rec.book.id}>
                  {/* Book label */}
                  <p className="text-sm font-bold tracking-wider text-(--primary) mb-3">
                    LIBRO {rec.rank}
                  </p>

                  <Card className="p-6">
                    <div className="flex gap-6">
                      {/* Book cover */}
                      <BookCover
                        title={rec.book.title}
                        author={rec.book.author}
                        className="w-30 h-45 shrink-0"
                      />

                      {/* Book info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h2 className="font-primary font-semibold text-base text-(--foreground) leading-tight">
                            {rec.book.title}
                          </h2>
                          <Badge variant="score">
                            {Math.round(rec.matchScore * 100)}%
                          </Badge>
                        </div>

                        <p className="text-[13px] text-(--muted-foreground) mb-3">
                          por <span className="font-medium text-(--foreground)">{rec.book.author}</span>
                        </p>

                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="primary">{rec.book.genre}</Badge>
                          {rec.book.publicationYear && (
                            <Badge variant="secondary">{rec.book.publicationYear}</Badge>
                          )}
                          {rec.book.difficulty && (
                            <Badge variant="success">Nivel: {rec.book.difficulty}</Badge>
                          )}
                        </div>

                        {rec.book.synopsis && (
                          <p className="text-[13px] text-(--muted-foreground) leading-relaxed mb-4 line-clamp-3">
                            {rec.book.synopsis}
                          </p>
                        )}

                        {/* Justification */}
                        <div className="bg-(--surface) rounded-md p-3 mb-4">
                          <p className="text-xs font-medium text-(--foreground) mb-2 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-(--primary)" />
                            Por qué te lo recomendamos
                          </p>
                          <p className="text-xs text-(--muted-foreground) leading-relaxed">
                            {rec.justification}
                          </p>
                          {rec.keyReasons && rec.keyReasons.length > 0 && (
                            <ul className="mt-2 space-y-1">
                              {rec.keyReasons.map((reason: string, i: number) => (
                                <li key={i} className="text-xs text-(--muted-foreground) flex items-start gap-1.5">
                                  <span className="text-(--primary) mt-0.5 shrink-0">•</span>
                                  {reason}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {rec.scoreBreakdown && (
                          <div className="bg-(--surface) rounded-md p-3 mb-4">
                            <p className="text-xs font-medium text-(--foreground) mb-2">Desglose de puntuación</p>
                            <div className="grid grid-cols-3 gap-3">
                              <div>
                                <p className="text-xs text-(--muted-foreground)">Intereses</p>
                                <p className="text-sm font-bold text-(--foreground)">
                                  {Math.round(rec.scoreBreakdown.interestMatch * 100)}%
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-(--muted-foreground)">Dificultad</p>
                                <p className="text-sm font-bold text-(--foreground)">
                                  {Math.round(rec.scoreBreakdown.difficultyMatch * 100)}%
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-(--muted-foreground)">Estado anímico</p>
                                <p className="text-sm font-bold text-(--foreground)">
                                  {Math.round(rec.scoreBreakdown.moodMatch * 100)}%
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-4 pt-3 border-t border-(--border)">
                          <a href="#" className="text-[13px] font-medium text-(--primary) hover:opacity-80">
                            Ver detalles
                          </a>
                          <button className="flex items-center gap-1.5 border border-(--border) rounded-md px-2.5 py-1.5 text-xs text-(--foreground) hover:bg-(--surface) transition-colors">
                            <Heart className="w-3.5 h-3.5" />
                            Guardar
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-(--muted-foreground) text-lg mb-6">
                No encontramos recomendaciones que se ajusten a tus criterios.
              </p>
              <Button variant="primary" onClick={() => router.push('/')}>
                Probar con otros criterios
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
