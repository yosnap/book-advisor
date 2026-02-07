import type { Metadata } from 'next'
import './globals.css'

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
        <nav className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📚</span>
              <h1 className="text-xl font-bold text-gray-900">book-advisor</h1>
            </div>
            <div className="flex items-center space-x-6">
              <a href="/" className="text-gray-600 hover:text-gray-900">
                Inicio
              </a>
              <a href="/admin" className="text-gray-600 hover:text-gray-900">
                Admin
              </a>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  )
}
