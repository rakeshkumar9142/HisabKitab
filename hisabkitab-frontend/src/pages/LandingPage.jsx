import { motion, useReducedMotion } from 'framer-motion'
import { Printer, Smartphone, WifiOff, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

/* Tokens — clean SaaS, Bharat-first */
const c = {
  bg: '#FFFFFF',
  ink: '#111111',
  accent: '#FF6A00',
  muted: '#6B7280',
  line: '#E5E7EB',
  subtle: '#F9FAFB',
}

function Container({ children, className = '' }) {
  return <div className={`mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8 ${className}`}>{children}</div>
}

function Section({ id, children, className = '' }) {
  return (
    <section id={id} className={`py-14 sm:py-16 lg:py-20 ${className}`} style={{ backgroundColor: c.bg }}>
      {children}
    </section>
  )
}

function FadeIn({ children, delay = 0, className = '' }) {
  const reduce = useReducedMotion()
  if (reduce) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-32px' }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

function PrimaryButton({ to, children, className = '' }) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 ${className}`}
      style={{ backgroundColor: c.accent }}
    >
      {children}
    </Link>
  )
}

function GhostButton({ to, children, className = '' }) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center justify-center rounded-lg border px-5 py-3 text-sm font-semibold transition-colors hover:bg-neutral-50 ${className}`}
      style={{ borderColor: c.line, color: c.ink }}
    >
      {children}
    </Link>
  )
}

function AnchorGhost({ href, children, className = '' }) {
  return (
    <a
      href={href}
      className={`inline-flex items-center justify-center rounded-lg border px-5 py-3 text-sm font-semibold transition-colors hover:bg-neutral-50 ${className}`}
      style={{ borderColor: c.line, color: c.ink }}
    >
      {children}
    </a>
  )
}

function LandingNav() {
  const { isAuthenticated } = useAuth()
  return (
    <header className="sticky top-0 z-50 border-b" style={{ backgroundColor: c.bg, borderColor: c.line }}>
      <Container className="flex h-14 items-center justify-between sm:h-16">
        <Link to="/" className="text-base font-semibold tracking-tight" style={{ color: c.ink }}>
          HisabKitab
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated ? (
            <Link to="/app" className="text-sm font-semibold" style={{ color: c.accent }}>
              App kholo →
            </Link>
          ) : (
            <>
              <Link to="/login" className="px-2 py-2 text-sm font-medium sm:px-3" style={{ color: c.muted }}>
                Log in
              </Link>
              <PrimaryButton to="/register" className="py-2.5">
                Start free
              </PrimaryButton>
            </>
          )}
        </nav>
      </Container>
    </header>
  )
}

function BillingMock() {
  const rows = [
    { name: 'Atta 10kg', qty: 1, price: 520 },
    { name: 'Rice 5kg', qty: 1, price: 380 },
    { name: 'Oil 1L', qty: 2, price: 165 },
    { name: 'Maggi', qty: 4, price: 14 },
  ]
  const subtotal = rows.reduce((s, r) => s + r.price * r.qty, 0)

  return (
    <div className="overflow-hidden rounded-xl border shadow-sm" style={{ borderColor: c.line, backgroundColor: c.bg }}>
      <div
        className="flex items-center justify-between border-b px-4 py-3"
        style={{ borderColor: c.line, backgroundColor: c.subtle }}
      >
        <span className="text-xs font-semibold" style={{ color: c.ink }}>
          Naya bill
        </span>
        <span className="rounded-md bg-white px-2 py-0.5 text-xs font-medium text-neutral-600 ring-1 ring-neutral-200">
          Cash
        </span>
      </div>
      <div className="p-4">
        <ul className="space-y-2">
          {rows.map((r) => (
            <li
              key={r.name}
              className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: c.line }}
            >
              <span className="font-medium text-neutral-900">{r.name}</span>
              <span className="text-neutral-600">
                ×{r.qty}{' '}
                <span className="font-medium tabular-nums text-neutral-900">₹{r.price * r.qty}</span>
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center justify-between border-t pt-4" style={{ borderColor: c.line }}>
          <span className="text-sm font-medium text-neutral-600">Total</span>
          <span className="text-lg font-semibold tabular-nums" style={{ color: c.ink }}>
            ₹{subtotal}
          </span>
        </div>
        <div
          className="mt-3 text-center rounded-lg py-2.5 text-sm font-semibold text-white"
          style={{ backgroundColor: c.accent }}
        >
          Bill banayein
        </div>
      </div>
    </div>
  )
}

function HeroSection() {
  const reduce = useReducedMotion()
  return (
    <Section className="pt-10 sm:pt-14 lg:pt-16">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <FadeIn>
              <p className="mb-3 text-sm font-medium" style={{ color: c.accent }}>
                Designed for Bharat · kirana & neighbourhood shops
              </p>
              <h1
                className="text-[1.65rem] font-semibold leading-tight tracking-tight sm:text-4xl lg:text-[2.5rem]"
                style={{ color: c.ink }}
              >
                Apni Dukaan Ka Billing Ab Mobile Se
              </h1>
              <p className="mt-4 text-lg font-medium leading-relaxed sm:text-xl" style={{ color: c.muted }}>
                Fast billing, instant printing, sirf{' '}
                <span className="text-neutral-900">₹365/year</span>
                <span className="mt-1 block text-base font-normal">
                  ₹1 per day mein smart billing — simple, seedha, samajh mein aane wala.
                </span>
              </p>
              <p className="mt-3 text-sm italic text-neutral-500">“Apni dukaan ka hisaab ab mobile se.”</p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <PrimaryButton to="/register">Start free</PrimaryButton>
                <AnchorGhost href="#product">Demo dekho</AnchorGhost>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-neutral-200 pt-6 text-xs font-medium text-neutral-500">
                <span>Made for small dukaan owners</span>
                <span className="hidden sm:inline">·</span>
                <span>Works even in low internet areas</span>
              </div>
            </FadeIn>
          </div>
          <div className="lg:pl-4">
            {reduce ? (
              <BillingMock />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <BillingMock />
              </motion.div>
            )}
          </div>
        </div>
      </Container>
    </Section>
  )
}

function HowItWorksSection() {
  const steps = [
    { n: '1', title: 'Item add karo', body: 'Apna samaan, daam, aur stock ek baar daal do — baar baar use karo.' },
    { n: '2', title: 'Bill banao', body: 'Phone par item chuno, quantity likho, total turant.' },
    { n: '3', title: 'Print karo', body: 'Receipt printer par — customer ko jaldi, bina jhanjhat.' },
  ]

  return (
    <Section id="how" className="border-t" style={{ borderColor: c.line }}>
      <Container>
        <FadeIn>
          <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl" style={{ color: c.ink }}>
            Kaise chalta hai?
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-sm sm:text-base" style={{ color: c.muted }}>
            Teen seedhe step — zyada training ki zaroorat nahi.
          </p>
        </FadeIn>
        <div className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-6">
          {steps.map((s, i) => (
            <FadeIn key={s.n} delay={i * 0.06}>
              <div
                className={`flex flex-col items-center px-2 text-center sm:items-start sm:text-left ${i > 0 ? 'sm:border-l sm:pl-6' : ''}`}
                style={{ borderColor: c.line }}
              >
                <span
                  className="mb-3 flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: c.ink }}
                >
                  {s.n}
                </span>
                <h3 className="text-base font-semibold" style={{ color: c.ink }}>
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: c.muted }}>
                  {s.body}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </Container>
    </Section>
  )
}

function FeatureCard({ icon: Icon, title, description, delay }) {
  return (
    <FadeIn delay={delay} className="h-full">
      <div
        className="flex h-full flex-col rounded-xl border p-6 transition-shadow hover:shadow-sm"
        style={{ borderColor: c.line, backgroundColor: c.bg }}
      >
        <div
          className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: c.subtle, color: c.ink }}
        >
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <h3 className="text-base font-semibold" style={{ color: c.ink }}>
          {title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed" style={{ color: c.muted }}>
          {description}
        </p>
      </div>
    </FadeIn>
  )
}

function FeaturesSection() {
  const features = [
    {
      icon: Zap,
      title: 'Fast billing',
      description: 'Bheed ke beech bhi bill jaldi — search, quantity, done.',
    },
    {
      icon: Smartphone,
      title: 'Mobile friendly',
      description: 'Chhota phone, bade buttons. Counter par ek haath se chalao.',
    },
    {
      icon: Printer,
      title: 'Printer support',
      description: 'Local printer bridge se receipt seedha print — customer ko clarity.',
    },
    {
      icon: WifiOff,
      title: 'Low network friendly',
      description:
        'Internet slow ho to bhi kaam chalane ke liye banaya gaya flow — poori tarah offline nahi, par practical.',
    },
  ]

  return (
    <Section id="product" className="border-t" style={{ borderColor: c.line, backgroundColor: c.subtle }}>
      <Container>
        <FadeIn>
          <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl" style={{ color: c.ink }}>
            Aapki dukaan ke hisaab se
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-sm sm:text-base" style={{ color: c.muted }}>
            Features jo asli counter par kaam aate hain — fancy jargon nahi.
          </p>
        </FadeIn>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <FeatureCard key={f.title} {...f} delay={i * 0.05} />
          ))}
        </div>
      </Container>
    </Section>
  )
}

function PricingSection() {
  return (
    <Section id="pricing" className="border-t" style={{ borderColor: c.line }}>
      <Container>
        <div className="mx-auto max-w-md">
          <FadeIn>
            <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl" style={{ color: c.ink }}>
              Pricing
            </h2>
            <p className="mt-2 text-center text-sm sm:text-base" style={{ color: c.muted }}>
              Ek saal, ek daam — chhota invest, bada araam.
            </p>
          </FadeIn>
          <FadeIn delay={0.08} className="mt-10">
            <div className="rounded-2xl border p-8 text-center shadow-sm" style={{ borderColor: c.line, backgroundColor: c.bg }}>
              <p className="text-sm font-medium text-neutral-500">HisabKitab</p>
              <div className="mt-4 flex items-baseline justify-center gap-1">
                <span className="text-5xl font-semibold tabular-nums tracking-tight" style={{ color: c.ink }}>
                  ₹365
                </span>
                <span className="text-lg text-neutral-500">/saal</span>
              </div>
              <p className="mt-2 text-base font-semibold" style={{ color: c.accent }}>
                ₹1 per day — smart billing
              </p>
              <ul className="mt-8 space-y-3 text-left text-sm text-neutral-600">
                <li className="flex gap-2">
                  <span className="text-neutral-400">✓</span>
                  Mobile par billing aur items
                </li>
                <li className="flex gap-2">
                  <span className="text-neutral-400">✓</span>
                  Bill history aur basic reports
                </li>
                <li className="flex gap-2">
                  <span className="text-neutral-400">✓</span>
                  Printer ke liye taiyaar workflow
                </li>
              </ul>
              <div className="mt-8">
                <PrimaryButton to="/register" className="w-full">
                  Abhi shuru karein
                </PrimaryButton>
              </div>
            </div>
          </FadeIn>
        </div>
      </Container>
    </Section>
  )
}

function TrustSection() {
  const items = [
    { stat: '10,000+', label: 'dukaan owners', sub: 'Bharat ke chhote vyapaar bharose ke saath' },
    { stat: 'Simple', label: 'and easy to use', sub: 'Bina complicated menu — seedha kaam' },
    { stat: 'Zero', label: 'technical degree', sub: 'No technical knowledge needed — bas phone chalana aana chahiye' },
  ]

  return (
    <Section className="border-t" style={{ borderColor: c.line, backgroundColor: c.subtle }}>
      <Container>
        <FadeIn>
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-neutral-400">Trust</p>
          <h2 className="mt-2 text-center text-2xl font-semibold tracking-tight sm:text-3xl" style={{ color: c.ink }}>
            Bharose wala hisaab
          </h2>
        </FadeIn>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {items.map((item, i) => (
            <FadeIn key={item.label} delay={i * 0.07}>
              <div className="text-center sm:text-left">
                <p className="text-3xl font-semibold tabular-nums" style={{ color: c.ink }}>
                  {item.stat}
                </p>
                <p className="mt-1 text-sm font-semibold text-neutral-800">{item.label}</p>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: c.muted }}>
                  {item.sub}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </Container>
    </Section>
  )
}

function FinalCtaSection() {
  return (
    <Section className="border-t pb-16 sm:pb-20" style={{ borderColor: c.line }}>
      <Container>
        <FadeIn>
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-6 h-1 w-12 rounded-full" style={{ backgroundColor: c.accent }} aria-hidden />
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl" style={{ color: c.ink }}>
              Aaj hi apni dukaan digital banao
            </h2>
            <p className="mt-4 text-sm sm:text-base" style={{ color: c.muted }}>
              Free account banao, items daalo, pehla bill aaj hi try karo.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <PrimaryButton to="/register">Start free</PrimaryButton>
              <GhostButton to="/login">Pehle se account hai? Log in</GhostButton>
            </div>
          </div>
        </FadeIn>
        <footer className="mt-14 border-t pt-8 text-center text-xs" style={{ borderColor: c.line, color: c.muted }}>
          <p>© {new Date().getFullYear()} HisabKitab · Made for India&apos;s shopkeepers</p>
        </footer>
      </Container>
    </Section>
  )
}

export default function LandingPage() {
  return (
    <div
      className="min-h-screen antialiased"
      style={{ backgroundColor: c.bg, fontFamily: '"Inter", system-ui, sans-serif' }}
    >
      <LandingNav />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <PricingSection />
        <TrustSection />
        <FinalCtaSection />
      </main>
    </div>
  )
}
