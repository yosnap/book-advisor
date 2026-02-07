'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Card from '@/components/Card'
import Badge from '@/components/Badge'

const moods = ['feliz', 'triste', 'reflexivo', 'ansioso', 'neutral']
const readerTypes = ['novato', 'intermedio', 'avanzado', 'experto']
const genres = ['ficción', 'historia', 'desarrollo', 'filosofía', 'ciencia', 'romance', 'misterio', 'poesía']
const intentions = ['relax', 'aprendizaje', 'evasión']

interface FormData {
  mood: string
  readerType: string
  favoriteGenres: string[]
  avoidedGenres: string[]
  intention: string
  moodIntensity: number
  preferredLength: string
}

interface FormErrors {
  [key: string]: string
}

export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    mood: '',
    readerType: '',
    favoriteGenres: [],
    avoidedGenres: [],
    intention: '',
    moodIntensity: 5,
    preferredLength: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})

  const handleMoodChange = (mood: string) => {
    setFormData({ ...formData, mood })
    setErrors({ ...errors, mood: '' })
  }

  const handleReaderTypeChange = (type: string) => {
    setFormData({ ...formData, readerType: type })
    setErrors({ ...errors, readerType: '' })
  }

  const handleGenreToggle = (genre: string, type: 'favorite' | 'avoided') => {
    const key = type === 'favorite' ? 'favoriteGenres' : 'avoidedGenres'
    const genres = formData[key].includes(genre)
      ? formData[key].filter((g) => g !== genre)
      : [...formData[key], genre]
    setFormData({ ...formData, [key]: genres })
  }

  const handleIntentionChange = (intention: string) => {
    setFormData({ ...formData, intention })
    setErrors({ ...errors, intention: '' })
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.mood) newErrors.mood = 'Por favor selecciona tu estado de ánimo'
    if (!formData.readerType) newErrors.readerType = 'Por favor selecciona tu perfil lector'
    if (!formData.intention) newErrors.intention = 'Por favor selecciona tu intención de lectura'
    if (!formData.preferredLength) newErrors.preferredLength = 'Por favor selecciona la longitud preferida'
    if (formData.favoriteGenres.length === 0) newErrors.favoriteGenres = 'Por favor selecciona al menos un género favorito'

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
        readerType: formData.readerType,
        intention: formData.intention,
        favoriteGenres: formData.favoriteGenres.join(','),
        avoidedGenres: formData.avoidedGenres.join(','),
        preferredLength: formData.preferredLength,
      })

      router.push(`/recommendations?${queryParams}`)
    } catch (error) {
      console.error('Error submitting form:', error)
      setErrors({ form: 'Error al procesar tu solicitud' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-primary font-bold text-5xl sm:text-6xl text-gray-900 mb-6">
            Descubre tu próximo libro favorito
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Cuéntanos cómo te sientes hoy, y encontraremos los libros perfectos para ti. Nuestro sistema inteligente analiza tu contexto emocional para recomendaciones personalizadas.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {errors.form && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {errors.form}
                </div>
              )}

              {/* Mood Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  ¿Cómo te sientes hoy? {errors.mood && <span className="text-red-600">*</span>}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {moods.map((mood) => (
                    <button
                      key={mood}
                      type="button"
                      onClick={() => handleMoodChange(mood)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.mood === mood
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      <span className="font-medium capitalize">{mood}</span>
                    </button>
                  ))}
                </div>
                {errors.mood && <p className="mt-2 text-sm text-red-600">{errors.mood}</p>}
              </div>

              {/* Mood Intensity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Intensidad del estado de ánimo: {formData.moodIntensity}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.moodIntensity}
                  onChange={(e) => setFormData({ ...formData, moodIntensity: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              {/* Reader Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  ¿Qué tipo de lector eres? {errors.readerType && <span className="text-red-600">*</span>}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {readerTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleReaderTypeChange(type)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.readerType === type
                          ? 'border-purple-600 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <span className="font-medium capitalize">{type}</span>
                    </button>
                  ))}
                </div>
                {errors.readerType && <p className="mt-2 text-sm text-red-600">{errors.readerType}</p>}
              </div>

              {/* Favorite Genres */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Géneros favoritos {errors.favoriteGenres && <span className="text-red-600">*</span>}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {genres.map((genre) => (
                    <button
                      key={`fav-${genre}`}
                      type="button"
                      onClick={() => handleGenreToggle(genre, 'favorite')}
                      className={`px-3 py-2 rounded-lg border transition-all text-sm ${
                        formData.favoriteGenres.includes(genre)
                          ? 'border-indigo-600 bg-indigo-100 text-indigo-700'
                          : 'border-gray-200 text-gray-700 hover:border-indigo-300'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
                {errors.favoriteGenres && <p className="mt-2 text-sm text-red-600">{errors.favoriteGenres}</p>}
              </div>

              {/* Avoided Genres */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Géneros a evitar (opcional)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {genres.map((genre) => (
                    <button
                      key={`avoid-${genre}`}
                      type="button"
                      onClick={() => handleGenreToggle(genre, 'avoided')}
                      className={`px-3 py-2 rounded-lg border transition-all text-sm ${
                        formData.avoidedGenres.includes(genre)
                          ? 'border-red-600 bg-red-100 text-red-700'
                          : 'border-gray-200 text-gray-700 hover:border-red-300'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reading Intention */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Intención de lectura {errors.intention && <span className="text-red-600">*</span>}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {intentions.map((intention) => (
                    <button
                      key={intention}
                      type="button"
                      onClick={() => handleIntentionChange(intention)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.intention === intention
                          ? 'border-green-600 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <span className="font-medium capitalize">{intention}</span>
                    </button>
                  ))}
                </div>
                {errors.intention && <p className="mt-2 text-sm text-red-600">{errors.intention}</p>}
              </div>

              {/* Preferred Length */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Longitud preferida del libro {errors.preferredLength && <span className="text-red-600">*</span>}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {['corto', 'medio', 'largo'].map((length) => (
                    <button
                      key={length}
                      type="button"
                      onClick={() => setFormData({ ...formData, preferredLength: length })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.preferredLength === length
                          ? 'border-orange-600 bg-orange-50 text-orange-700'
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <span className="font-medium capitalize">{length}</span>
                    </button>
                  ))}
                </div>
                {errors.preferredLength && <p className="mt-2 text-sm text-red-600">{errors.preferredLength}</p>}
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
