import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold text-blue-900">ScholarMatch AI</span>
        <div className="flex gap-4 items-center">
          <Link href="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
          <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">Sign in</Link>
          <Link href="/auth/signup" className="bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800">
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto text-center py-24 px-6">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          AI scholarship matching for your institution
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Connect students to every scholarship they qualify for — federal, state, and institutional —
          with AI-powered evaluation and human staff approval before letters are sent.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/auth/signup" className="bg-blue-900 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-800">
            Start free trial
          </Link>
          <Link href="/pricing" className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-50">
            View pricing
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            {
              title: 'AI Matching Agent',
              desc: 'Claude evaluates every application against scholarship criteria — GPA, income, residency, major, and 20+ other factors.'
            },
            {
              title: 'Human-in-the-Loop',
              desc: 'Staff approve every match before a letter is generated. Then approve the letter before it\'s sent. Full control.'
            },
            {
              title: 'Ready-Made Catalog',
              desc: 'Federal programs (Pell, FSEOG, TEACH) and Florida state scholarships (Bright Futures, FSAG, FGMG) pre-loaded.'
            },
          ].map(f => (
            <div key={f.title} className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-10 text-gray-500 text-sm">
        © {new Date().getFullYear()} ScholarMatch AI. Built with Next.js, Supabase &amp; Claude.
      </footer>
    </div>
  )
}
