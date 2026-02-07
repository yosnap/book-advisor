# Prompt de Diseño UX/UI - book-advisor

## 🎨 Instrucciones para Pencil.dev

Usa este prompt en **Pencil.dev** para crear prototipos de alta fidelidad del sistema de recomendación de libros.

---

## Contexto General

Estamos diseñando una **Web Inteligente de Recomendación de Libros** moderna y profesional.

**Características clave:**
- Sistema gobernado por contexto (captura mood, perfil, intereses)
- Recomendaciones personalizadas razonadas
- Dashboard admin para gestión de libros
- Diseño moderno, limpio, accesible
- Responsive (mobile-first)

---

## 1. Identidad Visual

### Paleta de Colores

```
PRIMARY:      #6366F1 (Indigo - principal actions)
SECONDARY:    #8B5CF6 (Purple - accents)
SUCCESS:      #10B981 (Green - confirmations)
WARNING:      #F59E0B (Amber - alerts)
DANGER:       #EF4444 (Red - destructive)

NEUTRAL:
  50:  #F9FAFB
  100: #F3F4F6
  200: #E5E7EB
  300: #D1D5DB
  400: #9CA3AF
  500: #6B7280
  600: #4B5563
  700: #374151
  800: #1F2937
  900: #111827

GRADIENTS:
  Hero: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)
  Card: linear-gradient(135deg, rgba(99,102,241,0.05) 0%, rgba(139,92,246,0.05) 100%)
```

### Tipografía

```
HEADING 1:    Poppins Bold 32px / 40px (Hero, page titles)
HEADING 2:    Poppins Bold 24px / 32px (Section titles)
HEADING 3:    Poppins SemiBold 18px / 28px (Subsections)
BODY:         Inter Regular 16px / 24px (Main text)
SMALL:        Inter Regular 14px / 20px (Captions)
BUTTON:       Inter SemiBold 14px / 20px (Actions)
```

---

## 2. Estructura General

### Navegación Principal

```
┌─────────────────────────────────────────────────────┐
│ 📚 book-advisor    [Home] [Recomendaciones] [Admin]  │
│                                            [Profile]  │
└─────────────────────────────────────────────────────┘
```

- Logo + brand name (left)
- Nav items (center)
- User menu / Profile (right)
- Sticky header, white background, subtle shadow

---

## 3. Pantalla Principal - Captura de Contexto (Homepage)

### Layout

```
┌─────────────────────────────────────────────────────┐
│          HERO SECTION                               │
│   "¿Qué libro te gustaría leer hoy?"               │
│   Tagline + CTA button                              │
│   Hero image (books/person reading)                 │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│          FORMULARIO DE CONTEXTO                      │
│  [CARD: Cuéntanos sobre ti]                         │
│                                                      │
│  1. ¿Cuál es tu estado de ánimo?                   │
│     [feliz] [triste] [reflexivo] [ansioso] [neutral]│
│                                                      │
│  2. ¿Cuál es tu perfil lector?                     │
│     [Novato] [Intermedio] [Avanzado] [Experto]    │
│                                                      │
│  3. ¿Qué te interesa?                              │
│     [Ficción] [Historia] [Filosofía] [Desarrollo]  │
│     [Ciencia] [Romance] [Misterio] [Poesía]        │
│     (Multi-select con checkboxes)                   │
│                                                      │
│  4. ¿Cuál es tu intención?                         │
│     [🎭 Evasión] [📚 Aprendizaje] [😴 Relax]      │
│                                                      │
│  [← Anterior] [Buscar Recomendaciones →]           │
└─────────────────────────────────────────────────────┘
```

### Componentes

**Hero Section:**
- Gradient background (indigo → purple)
- Large heading: "¿Qué libro te gustaría leer hoy?"
- Subheading: "Nuestro sistema inteligente entiende tu contexto y te recomienda libros personalizados"
- CTA button: "Empezar" (Indigo, large)

**Form Card:**
- White background, border radius 12px
- Padding: 32px
- Box shadow: 0 4px 20px rgba(0,0,0,0.08)

**Question Rows:**
- Label: Poppins SemiBold 16px, #1F2937
- Input components (radio, checkbox, select)
- Spacing between questions: 24px

**Buttons:**
- Previous: Ghost button (outline, indigo text)
- Submit: Solid button (indigo bg, white text, 40px height)
- Hover state: opacity 0.9, slight scale
- Disabled state: opacity 0.5, cursor not-allowed

---

## 4. Pantalla de Resultados - Recomendaciones

### Layout

```
┌─────────────────────────────────────────────────────┐
│  ← Volver  RECOMENDACIONES PERSONALIZADAS           │
│            [Edit Context] [New Search]              │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ [Tu Contexto]                                       │
│ Mood: Reflexivo | Perfil: Intermedio | Intención: Aprendizaje
│ Intereses: Filosofía, Historia                      │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                                                      │
│  LIBRO 1 (Score: 92%)                              │
│  ┌──────────────────────────────────────────────┐  │
│  │ [Portada]  │ Título del Libro               │  │
│  │  (150x225) │ Autor                           │  │
│  │            │ Género • Año                    │  │
│  │            │                                 │  │
│  │            │ "Fragmento de sinopsis..."      │  │
│  │            │                                 │  │
│  │            │ ✨ Por qué te lo recomendamos  │  │
│  │            │ • Aborda filosofía desde...     │  │
│  │            │ • Perfecto para reflexión...    │  │
│  │            │                                 │  │
│  │            │ [Ver más detalles] [Guardar]   │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  LIBRO 2 (Score: 88%)                              │
│  [Similar structure]                                │
│                                                      │
│  LIBRO 3 (Score: 85%)                              │
│  [Similar structure]                                │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Componentes

**Book Card:**
- Grid layout: 2 columns (mobile: 1)
- Book image + content side by side
- Image: 150x225px, border-radius 8px, shadow
- Content section: flex column
- Score badge: top-right, circular, indigo bg, white text
- Recommendation reasons: bulleted list, smaller font, gray text
- CTAs: "Ver más detalles" (link), "Guardar" (button with heart icon)

**Context Summary:**
- Light gray background
- Rounded corners
- Horizontal layout with badges/pills
- Option to edit context inline

---

## 5. Dashboard de Administración

### 5.1 Sidebar Navigation

```
┌──────────────────┐
│ 📚 book-advisor  │
├──────────────────┤
│ 📊 Dashboard     │
│ 📖 Mis Libros    │
│ 📈 Estadísticas  │
│ ⚙️  Configuración│
│ 👤 Perfil        │
│ 🚪 Salir         │
└──────────────────┘
```

- Dark sidebar (neutral-800) or light (neutral-50)?
- Sticky, fixed width (240px)
- Active state: indigo background
- Icons + labels

### 5.2 Pantalla: Dashboard

```
┌─────────────────────────────────────────────────────┐
│ 📊 Dashboard Administrativo                          │
│                                                      │
│ [Card: Total de Libros]      [Card: Recomendaciones]│
│  120 libros                   1,240 este mes         │
│                                                      │
│ [Card: Satisfacción]         [Card: Géneros Top]    │
│  4.2/5.0 estrellas           Ficción, Historia...   │
│                                                      │
│ [Gráfico: Recomendaciones por género (últimos 30d)]│
│ [Gráfico: Mood de usuarios]                        │
│                                                      │
│ [Table: Últimas recomendaciones]                    │
│  Usuario | Libro | Mood | Fecha | Aceptada         │
│  ------- | ----- | ---- | ----- | --------         │
└─────────────────────────────────────────────────────┘
```

**Stats Cards:**
- 4 cards en grid
- Icon + label + big number
- Subtle background color (tinted)
- Optional: trend indicator (↑ 12%)

**Charts:**
- Simple, clean bar/pie charts
- Use primary color
- Legend below

**Table:**
- Striped rows (alternate gray/white)
- Sortable headers
- Hover state: subtle highlight
- Actions column: [View] [Edit] [Delete]

### 5.3 Pantalla: Mis Libros (CRUD)

```
┌─────────────────────────────────────────────────────┐
│ 📖 Gestoría de Libros                                │
│                                     [+ Nuevo Libro]  │
├─────────────────────────────────────────────────────┤
│ [Buscador] [Filtrar por género] [Ordenar por...]   │
└─────────────────────────────────────────────────────┘

VISTA GRID:
┌────────────┐ ┌────────────┐ ┌────────────┐
│ [Portada]  │ │ [Portada]  │ │ [Portada]  │
│            │ │            │ │            │
│ Título     │ │ Título     │ │ Título     │
│ Autor      │ │ Autor      │ │ Autor      │
│ Género     │ │ Género     │ │ Género     │
│ [E][D][X]  │ │ [E][D][X]  │ │ [E][D][X]  │
└────────────┘ └────────────┘ └────────────┘

VISTA TABLA:
┌─────────────────────────────────────────────────────┐
│ Título | Autor | Género | Dif. | Año | Acciones    │
│─────────────────────────────────────────────────────│
│ 1984   | Orwell | Ficción | Avanzado | 1949 | [E][X]│
│ Sapiens| Harari | Historia| Intermedio | 2011 | [E][X]│
└─────────────────────────────────────────────────────┘
```

**Add/Edit Modal:**
```
┌─────────────────────────────────┐
│ ✏️  Editar Libro                 │
├─────────────────────────────────┤
│ [Cargar Portada] [Preview]      │
│                                  │
│ Título *        [_____________]  │
│ Autor *         [_____________]  │
│ Género *        [dropdown ▼]     │
│ Sinopsis *      [multiline ____] │
│ Dificultad *    [○ Beginner]     │
│                 [○ Intermediate]  │
│                 [● Advanced]      │
│ Año             [_____________]  │
│ Tags            [tag1] [tag2] [+]│
│                                  │
│         [Cancelar] [Guardar]     │
└─────────────────────────────────┘
```

---

## 6. Mobile Responsiveness

### Breakpoints

```
Mobile:   < 640px
Tablet:   640px - 1024px
Desktop:  > 1024px
```

### Adjustments

**Mobile:**
- Single column layouts
- Hamburger menu for navigation
- Larger touch targets (44px min)
- Simplified form steps (one question per screen)
- Book cards: stacked layout (image on top)

**Tablet:**
- 2-column grid for books
- Sidebar collapses to icons
- Side-by-side form

**Desktop:**
- Full layouts as designed
- 3-column grids
- Expanded sidebars

---

## 7. Estados y Interacciones

### Button States

```
DEFAULT:     Indigo bg, white text, shadow
HOVER:       Opacity 0.9, slight scale (1.02)
ACTIVE:      Darker shade
DISABLED:    Opacity 0.5, cursor not-allowed
LOADING:     Spinner inside button
```

### Form States

```
DEFAULT:     Outline, neutral-300 border
FOCUS:       Indigo border, shadow (focus ring)
FILLED:      Value displayed
ERROR:       Red border, error message below
SUCCESS:     Green checkmark, success message
```

### Loading States

```
- Skeleton screens (shimmer effect) for book cards
- Spinner icon in center for processing
- Progress bar for uploads
```

### Empty States

```
Title:   "No hay libros"
Message: "Agrega tu primer libro para empezar"
CTA:     "+ Nuevo Libro"
Icon:    Large book outline
```

---

## 8. Componentes Reutilizables

Diseña estos componentes como símbolos en Pencil:

1. **Button** (variants: primary, secondary, danger, ghost)
2. **Input** (text, email, select, textarea)
3. **Card** (standard, with hover effect)
4. **Badge** (with colors: indigo, green, amber, red)
5. **Tag** (removable pills)
6. **Modal** (header, body, footer)
7. **Alert** (info, success, warning, danger)
8. **Navbar** (with logo and nav items)
9. **Sidebar** (with nav items and active state)
10. **Rating** (star rating, 0-5)
11. **ProgressBar** (for scores)
12. **BookCard** (book preview component)

---

## 9. Pantallas Adicionales

### Sign In / Sign Up

```
┌─────────────────────────────────┐
│                                  │
│   📚 book-advisor                │
│                                  │
│   Inicia Sesión                  │
│                                  │
│   Email    [_________________]   │
│   Password [_________________]   │
│                                  │
│   [Recordarme]                   │
│                                  │
│   [Inicia Sesión]                │
│                                  │
│   ¿No tienes cuenta? [Regístrate]│
│                                  │
└─────────────────────────────────┘
```

- Centered layout
- Gradient background (hero)
- Simple, minimal form
- Link to signup

### Detalles del Libro

```
┌─────────────────────────────────┐
│ ← Volver                         │
│                                  │
│ [Portada grande]  Título         │
│  (300x450)        Autor          │
│                   ⭐ 4.2/5.0 (45)│
│                   Género • Año   │
│                                  │
│ [Agregar a favoritos]            │
│                                  │
│ Sinopsis Completa                │
│ Lorem ipsum dolor sit amet...    │
│                                  │
│ Dificultad: Intermedio           │
│ Tags: [filosofía] [reflexión]    │
│                                  │
│ Recomendado para:                │
│ • Lectores reflexivos            │
│ • Interesados en filosofía       │
│                                  │
│ [Atrás] [Ver Recomendaciones]    │
└─────────────────────────────────┘
```

---

## 10. Guía de Implementación en Tailwind CSS

Después de prototipar en Pencil, exporta como:

```css
/* Colors */
@apply bg-indigo-600    /* primary */
@apply bg-purple-600    /* secondary */
@apply text-gray-900    /* dark text */
@apply text-gray-500    /* light text */

/* Typography */
@apply text-3xl font-bold           /* Heading 1 */
@apply text-xl font-semibold        /* Heading 3 */
@apply text-base font-normal        /* Body */

/* Components */
@apply px-4 py-2 rounded-lg shadow  /* Card */
@apply px-4 py-3 rounded-lg font-semibold cursor-pointer /* Button */

/* Spacing */
@apply gap-6 grid grid-cols-3       /* 3-column grid with spacing */
@apply space-y-4                    /* Vertical spacing */
```

---

## 11. Checklist de Diseño

- [ ] Logo y branding
- [ ] Paleta de colores (6 colores principales + neutrals)
- [ ] Tipografía (2 fonts: Poppins para headings, Inter para body)
- [ ] Homepage con hero + form
- [ ] Pantalla de recomendaciones con cards
- [ ] Dashboard con stats, charts, tables
- [ ] CRUD de libros (grid + list view + modal)
- [ ] Componentes reutilizables (botones, inputs, cards, etc)
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Dark mode variant (optional)
- [ ] Animaciones (hover, loading, transitions)
- [ ] Documentación de componentes

---

**Resultado esperado:** Diseño moderno, profesional, accesible, listo para pasar a desarrollo en Next.js + Tailwind CSS.
