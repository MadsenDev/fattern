import { HashRouter as Router, Link, Route, Routes, useLocation } from 'react-router-dom'
import './index.css'
import Logo from './components/Logo'
import HomePage from './HomePage'
import MarketplacePage from './MarketplacePage'

const homeNavLinks = [
  { label: 'Funksjoner', path: '/', hash: '#funksjoner' },
  { label: 'Malredigering', path: '/', hash: '#malredigering' },
  { label: 'Import & migrering', path: '/', hash: '#import' },
  { label: 'Supporter-pakken', path: '/', hash: '#supporter' },
  { label: 'FAQ', path: '/', hash: '#faq' },
]

const marketplaceNavLinks = [
  { label: 'Filtre', path: '/marketplace', hash: '#kategorier' },
  { label: 'Utvalg', path: '/marketplace', hash: '#utvalg' },
  { label: 'Prosess', path: '/marketplace', hash: '#prosess' },
  { label: 'FAQ', path: '/marketplace', hash: '#faq-marketplace' },
]

function Header() {
  const location = useLocation()
  const isMarketplace = location.pathname.includes('marketplace')
  const navLinks = isMarketplace ? marketplaceNavLinks : homeNavLinks

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur shadow-sm border-b border-sand/60">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Logo />
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-ink-soft">
          {navLinks.map((link) => (
            <Link
              key={`${link.path}${link.hash}`}
              to={{ pathname: link.path, hash: link.hash }}
              className="hover:text-accent transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            to="/marketplace"
            className={`hidden sm:inline-flex items-center gap-2 rounded-full border border-sand bg-white px-4 py-2 text-sm font-semibold transition ${
              isMarketplace ? 'text-brand-900 hover:bg-sand/40' : 'text-accent hover:bg-sand/40'
            }`}
          >
            Malmarked
          </Link>
          <a
            href="#preview"
            className="inline-flex items-center gap-2 rounded-full border border-sand bg-white px-4 py-2 text-sm font-semibold text-accent hover:bg-sand/40 transition"
          >
            Se hvordan
          </a>
          <button className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-card hover:bg-brand-700 transition">
            Last ned
          </button>
        </div>
      </div>
    </header>
  )
}

function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-brand-950 text-white">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 grid md:grid-cols-3 gap-8 items-center">
        <div className="space-y-2">
          <Logo />
          <p className="text-white/70 text-sm">
            Fattern – enklere fakturering. Mer privatliv. Full kontroll.
          </p>
        </div>
        <div className="text-sm text-white/80 space-y-2">
          <p className="font-semibold text-white">Lenker</p>
          <div className="flex flex-col gap-1">
            <Link className="hover:text-moss" to={{ pathname: '/', hash: '#funksjoner' }}>Funksjoner</Link>
            <Link className="hover:text-moss" to={{ pathname: '/', hash: '#supporter' }}>Supporter-pakken</Link>
            <Link className="hover:text-moss" to={{ pathname: '/', hash: '#faq' }}>FAQ</Link>
            <Link className="hover:text-moss" to={{ pathname: '/marketplace', hash: '#utvalg' }}>Malmarked</Link>
          </div>
        </div>
        <div className="text-sm text-white/80 space-y-2">
          <p className="font-semibold text-white">Kontakt</p>
          <p>kontakt@fattern.no</p>
          <p>Bygget av deg som er lei av sky-abonnement.</p>
          <p className="text-white/60 text-xs">© {year} Fattern</p>
        </div>
      </div>
    </footer>
  )
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white text-ink">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  )
}

export default App

