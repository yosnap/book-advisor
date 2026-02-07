import type { Metadata } from 'next'
import './globals.css'
import { BookOpen, User } from 'lucide-react'

export const metadata: Metadata = {
  title: 'book-advisor | Recomendaciones de Libros',
  description: 'Sistema inteligente de recomendación de libros basado en contexto',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="font-secondary">
        <nav className="h-16 bg-(--background) border-b border-(--border) sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 h-full flex items-center justify-between">
            <a href="/" className="flex items-center gap-3 no-underline">
              <BookOpen className="w-7 h-7 text-(--primary)" />
              <span className="font-primary text-xl font-bold text-(--foreground)">book-advisor</span>
            </a>
            <div className="flex items-center gap-6">
              <a href="/" className="text-sm text-(--muted-foreground) hover:text-(--primary) no-underline transition-colors">
                Inicio
              </a>
              <a href="/admin/dashboard" className="text-sm text-(--muted-foreground) hover:text-(--primary) no-underline transition-colors">
                Admin
              </a>
              <div className="w-9 h-9 rounded-full bg-(--primary) flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  )
}
