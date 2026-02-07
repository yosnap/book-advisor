'use client'

import { useState, useEffect } from 'react'
import { Book } from 'lucide-react'

interface BookCoverProps {
  title: string
  author: string
  className?: string
}

export default function BookCover({ title, author, className = '' }: BookCoverProps) {
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function fetchCover() {
      try {
        const query = encodeURIComponent(`${title} ${author}`)
        const response = await fetch(
          `https://openlibrary.org/search.json?q=${query}&fields=cover_i&limit=1`,
          { signal: AbortSignal.timeout(5000) }
        )

        if (!response.ok || cancelled) return

        const data = await response.json()
        const coverId = data.docs?.[0]?.cover_i

        if (coverId && !cancelled) {
          setCoverUrl(`https://covers.openlibrary.org/b/id/${coverId}-M.jpg`)
        } else {
          setIsLoading(false)
        }
      } catch {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchCover()
    return () => { cancelled = true }
  }, [title, author])

  if (hasError || (!coverUrl && !isLoading)) {
    return (
      <div className={`bg-(--surface) border border-(--border) rounded-md flex items-center justify-center ${className}`}>
        <Book className="w-12 h-12 text-(--muted-foreground)" />
      </div>
    )
  }

  if (isLoading && !coverUrl) {
    return (
      <div className={`bg-(--surface) border border-(--border) rounded-md flex items-center justify-center animate-pulse ${className}`}>
        <Book className="w-12 h-12 text-(--muted-foreground) opacity-30" />
      </div>
    )
  }

  return (
    <img
      src={coverUrl!}
      alt={`Portada de ${title}`}
      className={`rounded-md object-cover ${className}`}
      onLoad={() => setIsLoading(false)}
      onError={() => {
        setHasError(true)
        setIsLoading(false)
      }}
    />
  )
}
