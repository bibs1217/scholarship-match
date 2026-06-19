'use client'
import Link from 'next/link'

const PLANS = [
  {
    name: 'Starter',
    price: '$149',
    period: '/month',
    desc: 'Perfect for small colleges just getting started.',
    features: ['Up to 200 students/year', 'All federal & state scholarships', 'AI matching agent', 'Email support'],
    priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID ?? '',
    highlight: false,
  },
  {
    name: 'Standard',
    price: '$399',
    period: '/month',
    desc: 'For growing institutions with larger student bodies.',
    features: ['Unlimited students', 'Custom institutional scholarships', 'Priority support', 'Analytics dashboard', 'CSV export'],
    priceId: process.env.NEXT_PUBLIC_STRIPE_STANDARD_PRICE_ID ?? '',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'University systems and multi-campus deployments.',
    features: ['Multi-campus support', 'SSO / SAML', 'Dedicated success manager', 'Custom integrations', 'SLA guarantee'],
    priceId: '',
    highlight: false,
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue-900">ScholarMatch AI</Link>
        <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">Sign in</Link>
      </nav>

      <div className="max-w-5xl mx-auto py-20 px-6">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-4">Simple, transparent pricing</h1>
        <p className="text-center text-gray-500 mb-12">No setup fees. Cancel anytime.</p>

        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map(plan => (
            <div
              key={plan.name}
              className={`rounded-xl border p-8 flex flex-col ${plan.highlight ? 'border-blue-600 shadow-lg' : 'border-gray-200'}`}
            >
              {plan.highlight && (
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">Most popular</span>
              )}
              <h2 className="text-2xl font-bold text-gray-900">{plan.name}</h2>
              <div className="mt-2 mb-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-gray-500">{plan.period}</span>
              </div>
              <p className="text-gray-600 mb-6 text-sm">{plan.desc}</p>
              <ul className="space-y-2 mb-8 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-green-500">✓</span> {f}
                  </li>
                ))}
              </ul>
              {plan.name === 'Enterprise' ? (
                <a href="mailto:sales@scholarmatch.ai" className="block text-center bg-gray-900 text-white py-2.5 rounded-lg hover:bg-gray-800 font-medium">
                  Contact sales
                </a>
              ) : (
                <Link href="/auth/signup" className={`block text-center py-2.5 rounded-lg font-medium ${plan.highlight ? 'bg-blue-900 text-white hover:bg-blue-800' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                  Start free trial
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
