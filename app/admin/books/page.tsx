'use client';

import { useState } from 'react';
import { List, LayoutGrid, Star } from 'lucide-react';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import BookCover from '@/components/BookCover';

interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  difficulty?: string;
  rating?: number;
}

const mockBooks: Book[] = [
  {
    id: '1',
    title: 'El Segundo Sexo',
    author: 'Simone de Beauvoir',
    genre: 'Ensayo',
    difficulty: 'advanced',
    rating: 4.8,
  },
  {
    id: '2',
    title: 'Cien años de soledad',
    author: 'Gabriel García Márquez',
    genre: 'Ficción',
    difficulty: 'intermediate',
    rating: 4.9,
  },
  {
    id: '3',
    title: '1984',
    author: 'George Orwell',
    genre: 'Ciencia Ficción',
    difficulty: 'intermediate',
    rating: 4.7,
  },
];

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>(mockBooks);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: '',
    difficulty: 'intermediate',
    synopsis: '',
  });

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = !selectedGenre || book.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const genres = [...new Set(books.map((b) => b.genre))];

  const handleAddBook = () => {
    if (formData.title && formData.author && formData.genre) {
      const newBook: Book = {
        id: Date.now().toString(),
        title: formData.title,
        author: formData.author,
        genre: formData.genre,
        difficulty: formData.difficulty as any,
        rating: 0,
      };
      setBooks([...books, newBook]);
      setFormData({
        title: '',
        author: '',
        genre: '',
        difficulty: 'intermediate',
        synopsis: '',
      });
      setIsModalOpen(false);
    }
  };

  const handleDeleteBook = (id: string) => {
    setBooks(books.filter((book) => book.id !== id));
  };

  return (
    <div className="min-h-screen bg-(--surface) py-8 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-primary font-bold text-[32px] text-(--foreground)">
            Gestión de libros
          </h1>
          <div className="flex gap-4">
            <div className="flex gap-1 bg-(--secondary) p-1 rounded-lg">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded transition-colors text-sm ${
                  viewMode === 'list' ? 'bg-(--card) shadow-sm text-(--foreground)' : 'text-(--muted-foreground)'
                }`}
                title="Vista de lista"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded transition-colors text-sm ${
                  viewMode === 'grid' ? 'bg-(--card) shadow-sm text-(--foreground)' : 'text-(--muted-foreground)'
                }`}
                title="Vista de rejilla"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              + Añadir libro
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Input
            placeholder="Buscar por título o autor..."
            value={searchTerm}
            onChange={(e: any) => setSearchTerm(e.target.value)}
          />
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="h-11 px-4 py-3 rounded-md border border-(--border) bg-(--background) text-(--foreground) focus:outline-none focus:ring-1 focus:ring-(--primary)"
          >
            <option value="">Todos los géneros</option>
            {genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>

        {/* Books Display */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((book) => (
              <Card key={book.id} className="p-6 flex flex-col">
                <BookCover
                  title={book.title}
                  author={book.author}
                  className="w-full h-48 mb-4"
                />
                <h3 className="font-primary font-bold text-lg text-(--foreground) mb-2">
                  {book.title}
                </h3>
                <p className="text-sm text-(--muted-foreground) mb-3">{book.author}</p>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="primary">{book.genre}</Badge>
                  {book.rating !== undefined && book.rating > 0 && (
                    <span className="text-(--warning) text-sm flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-current" /> {book.rating}
                    </span>
                  )}
                </div>
                {book.difficulty && (
                  <Badge variant="secondary" className="mb-4 w-fit">
                    {book.difficulty}
                  </Badge>
                )}
                <div className="flex gap-2 mt-auto">
                  <Button variant="outline" size="sm" className="flex-1">
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDeleteBook(book.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBooks.map((book) => (
              <Card key={book.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-primary font-bold text-lg text-(--foreground)">
                      {book.title}
                    </h3>
                    <p className="text-sm text-(--muted-foreground)">{book.author}</p>
                  </div>
                  <Badge variant="primary" className="mx-4">
                    {book.genre}
                  </Badge>
                  {book.rating !== undefined && book.rating > 0 && (
                    <span className="text-(--warning) mx-4 text-sm flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-current" /> {book.rating}
                    </span>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteBook(book.id)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {filteredBooks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-(--muted-foreground) text-lg">No hay libros que coincidan con tu búsqueda.</p>
          </div>
        )}

        {/* Add Book Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl p-6">
              <h2 className="font-primary font-bold text-2xl text-(--foreground) mb-6">
                Añadir nuevo libro
              </h2>
              <form className="space-y-4">
                <Input
                  placeholder="Título del libro"
                  value={formData.title}
                  onChange={(e: any) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
                <Input
                  placeholder="Autor"
                  value={formData.author}
                  onChange={(e: any) =>
                    setFormData({ ...formData, author: e.target.value })
                  }
                />
                <select
                  value={formData.genre}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                  className="w-full h-11 px-4 py-3 rounded-md border border-(--border) bg-(--background) text-(--foreground) focus:outline-none focus:ring-1 focus:ring-(--primary)"
                >
                  <option value="">Selecciona un género</option>
                  {genres.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full h-11 px-4 py-3 rounded-md border border-(--border) bg-(--background) text-(--foreground) focus:outline-none focus:ring-1 focus:ring-(--primary)"
                >
                  <option value="beginner">Principiante</option>
                  <option value="intermediate">Intermedio</option>
                  <option value="advanced">Avanzado</option>
                </select>
                <textarea
                  className="w-full px-4 py-3 rounded-md border border-(--border) bg-(--background) text-(--foreground) focus:outline-none focus:ring-1 focus:ring-(--primary)"
                  placeholder="Sinopsis (opcional)"
                  rows={3}
                  value={formData.synopsis}
                  onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
                />
              </form>
              <div className="flex gap-3 mt-6 pt-6 border-t border-(--border)">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsModalOpen(false);
                    setFormData({
                      title: '',
                      author: '',
                      genre: '',
                      difficulty: 'intermediate',
                      synopsis: '',
                    });
                  }}
                >
                  Cancelar
                </Button>
                <Button variant="primary" className="flex-1" onClick={handleAddBook}>
                  Guardar libro
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
