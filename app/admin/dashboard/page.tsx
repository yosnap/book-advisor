'use client';

import { Book, Sparkles, Star, TrendingUp } from 'lucide-react';
import Card from '@/components/Card';
import Badge from '@/components/Badge';

export default function DashboardPage() {
  const stats = [
    { label: 'Total de libros', value: '60', icon: Book, color: 'text-(--primary)' },
    { label: 'Recomendaciones', value: '1.2K', icon: Sparkles, color: 'text-(--warning)' },
    { label: 'Satisfacción', value: '94%', icon: Star, color: 'text-(--success)' },
    { label: 'Lectores activos', value: '342', icon: TrendingUp, color: 'text-(--primary)' },
  ];

  const genreData = [
    { genre: 'Ficción', count: 18 },
    { genre: 'Ensayo', count: 12 },
    { genre: 'Ciencia Ficción', count: 10 },
    { genre: 'Misterio', count: 8 },
    { genre: 'Otros', count: 12 },
  ];

  return (
    <div className="min-h-screen bg-(--surface) py-8 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-primary font-bold text-[32px] text-(--foreground) mb-8">
          Dashboard de Administración
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-(--muted-foreground) mb-2">{stat.label}</p>
                    <p className="font-primary font-bold text-4xl text-(--foreground)">
                      {stat.value}
                    </p>
                  </div>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </Card>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Books by Genre */}
          <Card className="p-6">
            <h2 className="font-primary font-bold text-xl text-(--foreground) mb-6">
              Libros por género
            </h2>
            <div className="space-y-4">
              {genreData.map((item) => (
                <div key={item.genre}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-(--foreground)">{item.genre}</span>
                    <Badge variant="primary">{item.count}</Badge>
                  </div>
                  <div className="w-full bg-(--secondary) rounded-full h-2">
                    <div
                      className="bg-(--primary) h-2 rounded-full transition-all"
                      style={{ width: `${(item.count / 60) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Recommendations */}
          <Card className="p-6">
            <h2 className="font-primary font-bold text-xl text-(--foreground) mb-6">
              Recomendaciones recientes
            </h2>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="p-3 bg-(--surface) rounded-lg flex items-center justify-between hover:bg-(--muted) transition-colors"
                >
                  <div>
                    <p className="text-sm font-semibold text-(--foreground)">
                      Libro #{i}
                    </p>
                    <p className="text-xs text-(--muted-foreground)">Hace 2 horas</p>
                  </div>
                  <Badge variant="success">94%</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <Card className="p-6">
            <h3 className="font-semibold text-(--foreground) mb-4">Géneros más solicitados</h3>
            <div className="space-y-2">
              {genreData.slice(0, 3).map((item) => (
                <div key={item.genre} className="flex justify-between">
                  <span className="text-sm text-(--foreground)">{item.genre}</span>
                  <span className="font-semibold text-(--primary)">{item.count}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-(--foreground) mb-4">Estado de búsquedas</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-(--foreground)">Exitosas</span>
                <span className="font-semibold text-(--success)">892</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-(--foreground)">Fallidas</span>
                <span className="font-semibold text-(--danger)">28</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-(--foreground)">Promedio (ms)</span>
                <span className="font-semibold text-(--primary)">342</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-(--foreground) mb-4">Satisfacción por género</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-(--foreground)">Ficción</span>
                <span className="font-semibold text-(--foreground)">96%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-(--foreground)">Ensayo</span>
                <span className="font-semibold text-(--foreground)">92%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-(--foreground)">C. Ficción</span>
                <span className="font-semibold text-(--foreground)">88%</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
