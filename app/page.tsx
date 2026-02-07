'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Check,
  Smile,
  Frown,
  Brain,
  AlertCircle,
  Minus,
  Drama,
  BookOpen,
  Moon,
  X,
} from 'lucide-react'
import Button from '@/components/Button'
import Card from '@/components/Card'

const moods = [
  { value: 'feliz', icon: Smile, label: 'Feliz' },
  { value: 'triste', icon: Frown, label: 'Triste' },
  { value: 'reflexivo', icon: Brain, label: 'Reflexivo' },
  { value: 'ansioso', icon: AlertCircle, label: 'Ansioso' },
  { value: 'neutral', icon: Minus, label: 'Neutral' },
]

const readerTypes = [
  { value: 'novato', label: 'Novato' },
  { value: 'intermedio', label: 'Intermedio' },
  { value: 'avanzado', label: 'Avanzado' },
  { value: 'experto', label: 'Experto' },
]

const genres = [
  'Ficción', 'Historia', 'Filosofía', 'Desarrollo Personal',
  'Ciencia', 'Romance', 'Misterio', 'Poesía',
]

const intentions = [
  { value: 'evasión', icon: Drama, label: 'Evasión' },
  { value: 'aprendizaje', icon: BookOpen, label: 'Aprendizaje' },
  { value: 'relax', icon: Moon, label: 'Relax' },
]

interface FormData {
  mood: string
  moodIntensity: number
  readerType: string
  favoriteGenres: string[]
  avoidedGenres: string[]
  intention: string
}

interface FormErrors {
  [key: string]: string
}

export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    mood: '',
    moodIntensity: 3,
    readerType: '',
    favoriteGenres: [],
    avoidedGenres: [],
    intention: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})

  const handleGenreToggle = (genre: string) => {
    const updated = formData.favoriteGenres.includes(genre)
      ? formData.favoriteGenres.filter((g) => g !== genre)
      : [...formData.favoriteGenres, genre]
    setFormData({ ...formData, favoriteGenres: updated })
    if (updated.length > 0) setErrors({ ...errors, favoriteGenres: '' })
  }

  const handleAvoidedGenreToggle = (genre: string) => {
    const updated = formData.avoidedGenres.includes(genre)
      ? formData.avoidedGenres.filter((g) => g !== genre)
      : [...formData.avoidedGenres, genre]
    setFormData({ ...formData, avoidedGenres: updated })
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.mood) newErrors.mood = 'Por favor selecciona tu estado de ánimo'
    if (!formData.readerType) newErrors.readerType = 'Por favor selecciona tu perfil lector'
    if (!formData.intention) newErrors.intention = 'Por favor selecciona tu intención de lectura'
    if (formData.favoriteGenres.length === 0) newErrors.favoriteGenres = 'Por favor selecciona al menos un género'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    try {
      const queryParams = new URLSearchParams({
        mood: formData.mood,
        moodIntensity: String(formData.moodIntensity),
        readerType: formData.readerType,
        intention: formData.intention,
        favoriteGenres: formData.favoriteGenres.join(','),
        avoidedGenres: formData.avoidedGenres.join(','),
      })

      router.push(`/recommendations?${queryParams}`)
    } catch (error) {
      console.error('Error submitting form:', error)
      setErrors({ form: 'Error al procesar tu solicitud' })
    } finally {
      setIsLoading(false)
    }
  }

  const availableGenresToAvoid = genres.filter((g) => !formData.favoriteGenres.includes(g))

  return (
    <div className="min-h-screen bg-(--background)">
      {/* Hero Section */}
      <section
        className="py-20 px-6 lg:px-12"
        style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-primary font-bold text-5xl text-white mb-6">
            Descubre tu próximo libro favorito
          </h1>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto leading-relaxed">
            Cuéntanos cómo te sientes hoy, y encontraremos los libros perfectos para ti.
            Nuestro sistema inteligente analiza tu contexto emocional para recomendaciones personalizadas.
          </p>
          <Button variant="ghost" size="lg" onClick={() => document.getElementById('context-form')?.scrollIntoView({ behavior: 'smooth' })}>
            Empezar
          </Button>
        </div>
      </section>

      {/* Form Section */}
      <section id="context-form" className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-200 mx-auto">
          <Card className="p-8">
            <div className="mb-8">
              <h2 className="font-primary font-semibold text-[28px] text-(--foreground) mb-2">
                Cuéntanos sobre ti
              </h2>
              <p className="text-sm text-(--muted-foreground) leading-relaxed">
                Responde estas preguntas para que podamos encontrar los libros ideales para ti.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {errors.form && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {errors.form}
                </div>
              )}

              {/* Mood Selection */}
              <div>
                <label className="block text-sm font-medium text-(--foreground) mb-4">
                  ¿Cómo te sientes hoy?
                </label>
                <div className="flex flex-wrap gap-3">
                  {moods.map((mood) => {
                    const Icon = mood.icon
                    return (
                      <button
                        key={mood.value}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, mood: mood.value })
                          setErrors({ ...errors, mood: '' })
                        }}
                        className={`w-30 h-25 flex flex-col items-center justify-center gap-2 rounded-lg transition-all ${
                          formData.mood === mood.value
                            ? 'border-2 border-(--primary) bg-(--primary)/8 text-(--primary)'
                            : 'border border-(--border) bg-(--background) text-(--foreground) hover:border-(--primary)/40'
                        }`}
                      >
                        <Icon className="w-7 h-7" />
                        <span className={`text-sm ${formData.mood === mood.value ? 'font-semibold' : 'font-medium'}`}>
                          {mood.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
                {errors.mood && <p className="mt-2 text-sm text-(--danger)">{errors.mood}</p>}
              </div>

              {/* Mood Intensity */}
              {formData.mood && (
                <div>
                  <label className="block text-sm font-medium text-(--foreground) mb-3">
                    Nivel de intensidad del estado de ánimo
                  </label>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-(--muted-foreground) w-12">Leve</span>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={formData.moodIntensity}
                      onChange={(e) => setFormData({ ...formData, moodIntensity: Number(e.target.value) })}
                      className="flex-1 accent-(--primary) h-2"
                    />
                    <span className="text-xs text-(--muted-foreground) w-12 text-right">Intenso</span>
                  </div>
                  <div className="flex justify-between mt-1 px-12">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span
                        key={n}
                        className={`text-xs ${formData.moodIntensity === n ? 'text-(--primary) font-bold' : 'text-(--muted-foreground)'}`}
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Reader Type */}
              <div>
                <label className="block text-sm font-medium text-(--foreground) mb-4">
                  ¿Qué tipo de lector eres?
                </label>
                <div className="flex flex-wrap gap-3">
                  {readerTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, readerType: type.value })
                        setErrors({ ...errors, readerType: '' })
                      }}
                      className={`px-6 py-3 rounded-lg transition-all ${
                        formData.readerType === type.value
                          ? 'border-2 border-(--primary) bg-(--primary)/8 text-(--primary) font-semibold'
                          : 'border border-(--border) bg-(--background) text-(--foreground) hover:border-(--primary)/40'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
                {errors.readerType && <p className="mt-2 text-sm text-(--danger)">{errors.readerType}</p>}
              </div>

              {/* Genre Selection - Checkboxes */}
              <div>
                <label className="block text-sm font-medium text-(--foreground) mb-4">
                  Géneros que te interesan
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {genres.map((genre) => {
                    const isSelected = formData.favoriteGenres.includes(genre)
                    return (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => handleGenreToggle(genre)}
                        className="flex items-center gap-2 text-left"
                      >
                        <span
                          className={`w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-(--primary)'
                              : 'border-[1.5px] border-(--border) bg-(--background)'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                        </span>
                        <span className={`text-sm ${isSelected ? 'font-medium' : ''} text-(--foreground)`}>
                          {genre}
                        </span>
                      </button>
                    )
                  })}
                </div>
                {errors.favoriteGenres && <p className="mt-2 text-sm text-(--danger)">{errors.favoriteGenres}</p>}
              </div>

              {/* Avoided Genres */}
              <div>
                <label className="block text-sm font-medium text-(--foreground) mb-2">
                  Géneros a evitar
                </label>
                <p className="text-xs text-(--muted-foreground) mb-4">
                  Opcional: selecciona los géneros que no te interesan para mejorar las recomendaciones.
                </p>
                {availableGenresToAvoid.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {availableGenresToAvoid.map((genre) => {
                      const isAvoided = formData.avoidedGenres.includes(genre)
                      return (
                        <button
                          key={genre}
                          type="button"
                          onClick={() => handleAvoidedGenreToggle(genre)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all ${
                            isAvoided
                              ? 'bg-(--danger) text-white'
                              : 'border border-(--border) text-(--muted-foreground) hover:border-(--danger)/40'
                          }`}
                        >
                          {isAvoided && <X className="w-3 h-3" />}
                          {genre}
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-(--muted-foreground) italic">
                    Selecciona géneros favoritos primero.
                  </p>
                )}
              </div>

              {/* Reading Intention */}
              <div>
                <label className="block text-sm font-medium text-(--foreground) mb-4">
                  Intención de lectura
                </label>
                <div className="flex flex-wrap gap-3">
                  {intentions.map((intention) => {
                    const Icon = intention.icon
                    return (
                      <button
                        key={intention.value}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, intention: intention.value })
                          setErrors({ ...errors, intention: '' })
                        }}
                        className={`w-30 h-25 flex flex-col items-center justify-center gap-2 rounded-lg transition-all ${
                          formData.intention === intention.value
                            ? 'border-2 border-(--primary) bg-(--primary)/8 text-(--primary)'
                            : 'border border-(--border) bg-(--background) text-(--foreground) hover:border-(--primary)/40'
                        }`}
                      >
                        <Icon className="w-7 h-7" />
                        <span className={`text-sm ${formData.intention === intention.value ? 'font-semibold' : 'font-medium'}`}>
                          {intention.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
                {errors.intention && <p className="mt-2 text-sm text-(--danger)">{errors.intention}</p>}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full">
                  Encontrar mis libros
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </section>
    </div>
  )
}
