'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

// ─── Demo personas ────────────────────────────────────────────────────────────
const STUDENT = {
  name: 'Jordan Martinez',
  age: 18,
  gpa: '3.8 / 4.0',
  sat: '1320',
  major: 'Computer Science',
  state: 'Florida',
  income: 'Low income',
  firstGen: true,
  fafsa: true,
  serviceHours: 120,
  essay: 'As the first in my family to attend a four-year university, I\'ve balanced a part-time job and 120 hours of community service while maintaining a 3.8 GPA. I hope to study Computer Science and return to my community to build tech programs for underserved youth.',
}

const PARENT = {
  name: 'Sandra Martinez',
  role: 'Jordan\'s mom',
  concern: 'Worried about tuition costs',
}

// ─── Scholarship matches the AI finds ─────────────────────────────────────────
const AI_MATCHES = [
  { name: 'Pell Grant', scope: 'Federal', amount: '$7,395', confidence: 98, reason: 'Low income bracket + FAFSA on file + first-time enrollment confirmed.' },
  { name: 'Bright Futures FAS', scope: 'Florida State', amount: '$3,340', confidence: 95, reason: 'Florida resident, GPA 3.8 ≥ 3.5 threshold, SAT 1320 ≥ 1290, community service 120 hrs ≥ 100.' },
  { name: 'FSAG — Public', scope: 'Florida State', amount: '$2,388', confidence: 92, reason: 'Florida resident, degree-seeking at public institution, income qualifies, FAFSA on file.' },
  { name: 'Florida First Generation', scope: 'Florida State', amount: '$1,300', confidence: 97, reason: 'First-generation status confirmed, Florida resident, income bracket qualifies.' },
  { name: 'FSEOG', scope: 'Federal', amount: '$1,000', confidence: 88, reason: 'Exceptional financial need demonstrated through FAFSA + income bracket.' },
  { name: 'UF Engineering Dean\'s Scholarship', scope: 'Institutional', amount: '$3,000', confidence: 72, reason: 'GPA 3.8 qualifies; CS is engineering-adjacent; first-gen status adds weight.' },
]

const TOTAL = '$18,423'

// ─── Steps ────────────────────────────────────────────────────────────────────
const STEPS = [
  { id: 'intro',    label: 'Meet Jordan',       persona: 'student' },
  { id: 'apply',   label: 'Application',        persona: 'student' },
  { id: 'ai',      label: 'AI Matching',        persona: 'system'  },
  { id: 'review',  label: 'Staff Review',       persona: 'admin'   },
  { id: 'letter',  label: 'Eligibility Letter', persona: 'admin'   },
  { id: 'matches', label: 'Jordan\'s Results',  persona: 'student' },
  { id: 'parent',  label: 'Sandra\'s View',     persona: 'parent'  },
]

// ─── Persona badge ────────────────────────────────────────────────────────────
function PersonaBadge({ persona }: { persona: string }) {
  const configs: Record<string, { label: string; color: string; icon: string }> = {
    student: { label: 'Student view', color: 'bg-blue-100 text-blue-800', icon: '🎓' },
    parent:  { label: 'Parent view',  color: 'bg-purple-100 text-purple-800', icon: '👨‍👩‍👧' },
    admin:   { label: 'Staff view',   color: 'bg-amber-100 text-amber-800', icon: '🏫' },
    system:  { label: 'AI engine',    color: 'bg-green-100 text-green-800', icon: '🤖' },
  }
  const c = configs[persona] ?? configs.student
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${c.color}`}>
      {c.icon} {c.label}
    </span>
  )
}

// ─── Screen: Intro / Meet Jordan ──────────────────────────────────────────────
function IntroScreen() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Jordan */}
        <div className="flex-1 bg-white border-2 border-blue-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center text-white text-2xl font-bold shadow">J</div>
            <div>
              <p className="font-bold text-gray-900 text-lg">{STUDENT.name}</p>
              <p className="text-sm text-gray-500">Age {STUDENT.age} · High school senior · {STUDENT.state}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ['GPA', STUDENT.gpa],
              ['SAT', STUDENT.sat],
              ['Major', STUDENT.major],
              ['Income', STUDENT.income],
              ['First-gen', 'Yes'],
              ['Service hrs', `${STUDENT.serviceHours} hrs`],
            ].map(([k, v]) => (
              <div key={k} className="bg-gray-50 rounded-lg p-2.5">
                <p className="text-xs text-gray-500 mb-0.5">{k}</p>
                <p className="font-semibold text-gray-800">{v}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Sandra */}
        <div className="flex-1 bg-white border-2 border-purple-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-700 flex items-center justify-center text-white text-2xl font-bold shadow">S</div>
            <div>
              <p className="font-bold text-gray-900 text-lg">{PARENT.name}</p>
              <p className="text-sm text-gray-500">{PARENT.role} · Parent & guardian</p>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
              <p className="text-purple-800 font-medium mb-1">💬 Sandra's concern</p>
              <p className="text-purple-700">"{PARENT.concern}. With Jordan being first-generation, we don't know where to even start with scholarships."</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-700">ScholarMatch automatically finds every scholarship Jordan qualifies for — federal, state, and institutional — then notifies Sandra when letters are ready.</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-blue-900 text-white rounded-2xl p-5 text-center">
        <p className="text-lg font-semibold mb-1">What happens next →</p>
        <p className="text-blue-200 text-sm">Jordan submits one application. ScholarMatch's AI evaluates her against 19 scholarships in seconds and surfaces every dollar she qualifies for.</p>
      </div>
    </div>
  )
}

// ─── Screen: Application form ──────────────────────────────────────────────────
function ApplyScreen() {
  return (
    <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
      {/* Fake browser chrome */}
      <div className="bg-gray-100 border-b px-4 py-2 flex items-center gap-2">
        <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400"/><div className="w-3 h-3 rounded-full bg-yellow-400"/><div className="w-3 h-3 rounded-full bg-green-400"/></div>
        <div className="flex-1 bg-white rounded text-xs text-gray-400 px-3 py-1 ml-2">scholarship-match-blond.vercel.app/apply</div>
      </div>
      <div className="p-5 space-y-4 text-sm">
        <div>
          <p className="font-bold text-gray-900 text-base mb-0.5">Scholarship Application</p>
          <p className="text-gray-400 text-xs">Fill out your information to find scholarships you qualify for.</p>
        </div>
        {/* Personal */}
        <div className="border rounded-xl p-4 space-y-3">
          <p className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Personal information</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Full name</p>
              <div className="border rounded-lg px-3 py-1.5 text-gray-800 bg-blue-50 border-blue-200">{STUDENT.name}</div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Email</p>
              <div className="border rounded-lg px-3 py-1.5 text-gray-800 bg-blue-50 border-blue-200">jordan.m@email.com</div>
            </div>
          </div>
        </div>
        {/* Academic */}
        <div className="border rounded-xl p-4 space-y-3">
          <p className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Academic information</p>
          <div className="grid grid-cols-3 gap-3">
            {[['GPA (unweighted)','3.8'],['SAT score','1320'],['Degree level','Bachelor'],['Intended major','Computer Science'],['State','Florida'],['Service hrs','120']].map(([l,v]) => (
              <div key={l}>
                <p className="text-xs text-gray-500 mb-1">{l}</p>
                <div className="border rounded-lg px-3 py-1.5 text-gray-800 bg-blue-50 border-blue-200 text-xs">{v}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Flags */}
        <div className="border rounded-xl p-4">
          <p className="font-semibold text-gray-700 text-xs uppercase tracking-wide mb-3">Eligibility flags</p>
          <div className="grid grid-cols-2 gap-2">
            {[['First-generation student',true],['FAFSA on file',true],['Florida resident',true],['National Merit Finalist',false]].map(([l,v]) => (
              <label key={l as string} className="flex items-center gap-2 text-xs text-gray-700">
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center text-white text-xs font-bold ${v ? 'bg-blue-900 border-blue-900' : 'border-gray-300'}`}>{v ? '✓' : ''}</div>
                {l as string}
              </label>
            ))}
          </div>
        </div>
        <div className="bg-blue-900 text-white text-center rounded-xl py-2.5 font-semibold text-sm">Submit application ✓</div>
        <p className="text-center text-xs text-green-600 font-medium">✅ Application submitted — AI matching starting now</p>
      </div>
    </div>
  )
}

// ─── Screen: AI Matching ───────────────────────────────────────────────────────
function AIScreen() {
  const [revealed, setRevealed] = useState(0)
  useEffect(() => {
    if (revealed < AI_MATCHES.length) {
      const t = setTimeout(() => setRevealed(r => r + 1), 400)
      return () => clearTimeout(t)
    }
  }, [revealed])

  return (
    <div className="space-y-4">
      <div className="bg-white border rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-xl">🤖</div>
          <div>
            <p className="font-bold text-gray-900">Claude AI — Scholarship Matching Engine</p>
            <p className="text-xs text-gray-500">Evaluating Jordan's profile against 19 scholarships…</p>
          </div>
          <div className="ml-auto text-xs font-mono text-green-600 bg-green-50 px-2 py-1 rounded">Running</div>
        </div>
        <div className="space-y-2">
          {AI_MATCHES.map((m, i) => (
            <div key={m.name} className={`border rounded-xl p-3 transition-all duration-500 ${i < revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m.scope === 'Federal' ? 'bg-blue-100 text-blue-700' : m.scope === 'Florida State' ? 'bg-orange-100 text-orange-700' : 'bg-indigo-100 text-indigo-700'}`}>{m.scope}</span>
                  <p className="font-semibold text-gray-900 text-sm">{m.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-green-700 font-bold text-sm">{m.amount}</span>
                  <div className="flex items-center gap-1">
                    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full transition-all duration-700" style={{ width: `${m.confidence}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 w-8">{m.confidence}%</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">💡 {m.reason}</p>
            </div>
          ))}
        </div>
        {revealed >= AI_MATCHES.length && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-700">{TOTAL}</p>
            <p className="text-sm text-green-600">Total scholarships found for Jordan</p>
            <p className="text-xs text-gray-500 mt-1">6 matches sent to UF financial aid staff for review</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Screen: Staff Review ──────────────────────────────────────────────────────
function StaffReviewScreen() {
  const [approved, setApproved] = useState<Set<number>>(new Set([0, 1, 2, 3, 4]))
  const [rejected, setRejected] = useState<Set<number>>(new Set())

  return (
    <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
      <div className="bg-gray-100 border-b px-4 py-2 flex items-center gap-2">
        <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400"/><div className="w-3 h-3 rounded-full bg-yellow-400"/><div className="w-3 h-3 rounded-full bg-green-400"/></div>
        <div className="flex-1 bg-white rounded text-xs text-gray-400 px-3 py-1 ml-2">scholarship-match-blond.vercel.app/applications</div>
      </div>
      <div className="p-4 space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-gray-900">Pending Reviews</p>
            <p className="text-xs text-gray-500">UF Financial Aid — Jordan Martinez's matches</p>
          </div>
          <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-1 rounded-full">{AI_MATCHES.length - rejected.size} pending</span>
        </div>
        <div className="space-y-2">
          {AI_MATCHES.map((m, i) => (
            <div key={m.name} className={`border rounded-xl p-3 transition-all ${rejected.has(i) ? 'opacity-40 bg-gray-50' : approved.has(i) ? 'border-green-200 bg-green-50' : 'bg-white'}`}>
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${m.scope === 'Federal' ? 'bg-blue-100 text-blue-700' : m.scope === 'Florida State' ? 'bg-orange-100 text-orange-700' : 'bg-indigo-100 text-indigo-700'}`}>{m.scope}</span>
                    <p className="font-semibold text-gray-900 text-xs truncate">{m.name}</p>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{m.reason.substring(0, 60)}…</p>
                </div>
                <div className="flex items-center gap-2 ml-3 shrink-0">
                  <span className="text-green-700 font-bold text-xs">{m.amount}</span>
                  {rejected.has(i) ? (
                    <span className="text-xs text-gray-400">Rejected</span>
                  ) : approved.has(i) ? (
                    <span className="text-xs text-green-600 font-semibold">✓ Approved</span>
                  ) : (
                    <div className="flex gap-1">
                      <button onClick={() => setApproved(s => new Set([...s, i]))} className="bg-green-600 text-white text-xs px-2 py-1 rounded hover:bg-green-700">Approve</button>
                      <button onClick={() => { setRejected(s => new Set([...s, i])); setApproved(s => { const n = new Set(s); n.delete(i); return n }) }} className="border border-red-300 text-red-600 text-xs px-2 py-1 rounded hover:bg-red-50">Reject</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {approved.size >= 4 && (
          <div className="bg-blue-900 text-white text-center rounded-xl py-2.5 font-semibold text-sm cursor-pointer hover:bg-blue-800">
            Generate eligibility letters for {approved.size} approved matches →
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Screen: Letter preview ────────────────────────────────────────────────────
function LetterScreen() {
  return (
    <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
      <div className="bg-gray-100 border-b px-4 py-2 flex items-center gap-2 text-xs text-gray-500">
        <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400"/><div className="w-3 h-3 rounded-full bg-yellow-400"/><div className="w-3 h-3 rounded-full bg-green-400"/></div>
        <span className="ml-2">Eligibility Letter — Draft Preview</span>
        <span className="ml-auto bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-medium">Awaiting staff approval</span>
      </div>
      <div className="p-6 space-y-4 font-serif text-sm text-gray-800">
        <div className="text-center border-b pb-4">
          <p className="font-bold text-lg text-blue-900">University of Florida</p>
          <p className="text-xs text-gray-500">Office of Student Financial Affairs · PO Box 114025 · Gainesville, FL 32611</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-gray-500">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p className="font-semibold">{STUDENT.name}</p>
          <p className="text-xs text-gray-500">Jordan.m@email.com</p>
        </div>
        <p className="font-semibold">Re: Scholarship Eligibility Notification — Academic Year 2025–2026</p>
        <p>Dear {STUDENT.name},</p>
        <p>Congratulations! Based on your submitted application and academic profile, the University of Florida Office of Student Financial Affairs has determined that you are eligible for the following scholarships for the 2025–2026 academic year:</p>
        <div className="bg-gray-50 border rounded-xl p-4 space-y-2">
          {AI_MATCHES.slice(0, 5).map(m => (
            <div key={m.name} className="flex justify-between text-xs">
              <span>{m.name}</span>
              <span className="font-semibold text-green-700">{m.amount}</span>
            </div>
          ))}
          <div className="border-t pt-2 flex justify-between font-bold text-sm">
            <span>Total Award</span>
            <span className="text-green-700">{TOTAL}</span>
          </div>
        </div>
        <p className="text-xs text-gray-600">This letter has been generated by ScholarMatch AI and reviewed by UF financial aid staff. Final disbursement is contingent on continued enrollment and satisfactory academic progress.</p>
        <div className="flex gap-3 pt-2">
          <button className="bg-blue-900 text-white text-xs px-4 py-2 rounded-lg hover:bg-blue-800 font-sans">✓ Approve &amp; Send to Jordan</button>
          <button className="border border-gray-300 text-gray-600 text-xs px-4 py-2 rounded-lg hover:bg-gray-50 font-sans">Request revision</button>
        </div>
      </div>
    </div>
  )
}

// ─── Screen: Student Matches ───────────────────────────────────────────────────
function MatchesScreen() {
  return (
    <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
      <div className="bg-gray-100 border-b px-4 py-2 flex items-center gap-2">
        <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400"/><div className="w-3 h-3 rounded-full bg-yellow-400"/><div className="w-3 h-3 rounded-full bg-green-400"/></div>
        <div className="flex-1 bg-white rounded text-xs text-gray-400 px-3 py-1 ml-2">scholarship-match-blond.vercel.app/my-matches</div>
      </div>
      <div className="p-4 space-y-3 text-sm">
        <div>
          <p className="font-bold text-gray-900 text-base">My scholarship matches</p>
          <p className="text-xs text-gray-500">Scholarships UF has approved you for — 2025–2026</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-green-700">{TOTAL}</p>
            <p className="text-xs text-green-600">Total scholarship award — letters sent to your email</p>
          </div>
          <div className="text-4xl">🎉</div>
        </div>
        <div className="space-y-2">
          {AI_MATCHES.slice(0, 5).map(m => (
            <div key={m.name} className="border rounded-xl p-3 flex items-center justify-between">
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-xs">{m.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${m.scope === 'Federal' ? 'bg-blue-100 text-blue-700' : m.scope === 'Florida State' ? 'bg-orange-100 text-orange-700' : 'bg-indigo-100 text-indigo-700'}`}>{m.scope}</span>
                  <span className="text-xs text-green-600 font-medium">✉️ Letter sent</span>
                </div>
              </div>
              <span className="font-bold text-green-700 ml-3 shrink-0">{m.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Screen: Parent View ──────────────────────────────────────────────────────
function ParentScreen() {
  return (
    <div className="space-y-4">
      {/* Notification email mockup */}
      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-gray-800 px-4 py-2 flex items-center gap-3">
          <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400"/><div className="w-3 h-3 rounded-full bg-yellow-400"/><div className="w-3 h-3 rounded-full bg-green-400"/></div>
          <span className="text-gray-400 text-xs">📬 Mail — Inbox</span>
        </div>
        <div className="p-4 space-y-3 text-sm">
          <div className="border-b pb-3">
            <div className="flex items-center justify-between mb-1">
              <p className="font-semibold text-gray-900">🎉 Jordan's scholarship letters are ready</p>
              <span className="text-xs text-gray-400">Just now</span>
            </div>
            <p className="text-xs text-gray-500">From: noreply@scholarship-match.app · To: sandra.martinez@email.com</p>
          </div>
          <div className="space-y-3">
            <p>Hi Sandra,</p>
            <p className="text-gray-700">Great news! UF's financial aid office has reviewed Jordan's application and approved her for <strong className="text-green-700">{TOTAL} in scholarships</strong> for the 2025–2026 academic year.</p>
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 space-y-1.5">
              {AI_MATCHES.slice(0, 4).map(m => (
                <div key={m.name} className="flex justify-between text-xs">
                  <span className="text-gray-700">{m.name}</span>
                  <span className="font-semibold text-green-700">{m.amount}</span>
                </div>
              ))}
              <p className="text-xs text-gray-500 pt-1">+ 2 more scholarships</p>
            </div>
            <p className="text-gray-600 text-xs">Official eligibility letters have been emailed to Jordan's address. No further action is needed — awards will be applied directly to her student account.</p>
            <div className="bg-blue-900 text-white text-center rounded-xl py-2 text-xs font-semibold">View Jordan's full award breakdown →</div>
          </div>
        </div>
      </div>
      {/* Quote */}
      <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-700 flex items-center justify-center text-white font-bold shrink-0">S</div>
          <div>
            <p className="font-semibold text-purple-900 text-sm">{PARENT.name} · {PARENT.role}</p>
            <p className="text-purple-700 text-sm mt-1 italic">"I can't believe how easy this was. Jordan submitted one form and two days later we had {TOTAL} in scholarship letters. We never would have found all of these on our own."</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main demo page ───────────────────────────────────────────────────────────
export default function DemoPage() {
  const [step, setStep] = useState(0)
  const [autoPlay, setAutoPlay] = useState(false)
  const [aiKey, setAiKey] = useState(0)

  const goTo = useCallback((i: number) => {
    setStep(i)
    if (i === 2) setAiKey(k => k + 1) // reset AI animation each visit
  }, [])

  const next = useCallback(() => goTo(Math.min(step + 1, STEPS.length - 1)), [step, goTo])
  const prev = useCallback(() => goTo(Math.max(step - 1, 0)), [step, goTo])

  useEffect(() => {
    if (!autoPlay) return
    if (step >= STEPS.length - 1) { setAutoPlay(false); return }
    const delays: Record<number, number> = { 0: 5000, 1: 5000, 2: 8000, 3: 6000, 4: 5000, 5: 5000, 6: 6000 }
    const t = setTimeout(next, delays[step] ?? 5000)
    return () => clearTimeout(t)
  }, [autoPlay, step, next])

  const currentStep = STEPS[step]

  const screens: Record<string, React.ReactNode> = {
    intro: <IntroScreen />,
    apply: <ApplyScreen />,
    ai: <AIScreen key={aiKey} />,
    review: <StaffReviewScreen />,
    letter: <LetterScreen />,
    matches: <MatchesScreen />,
    parent: <ParentScreen />,
  }

  const stepTitles: Record<string, { title: string; subtitle: string }> = {
    intro:   { title: 'Meet Jordan & Sandra', subtitle: 'A first-generation Florida student and her mom navigating scholarship season.' },
    apply:   { title: 'Jordan submits one application', subtitle: 'A 5-minute form captures everything the AI needs to evaluate her eligibility.' },
    ai:      { title: 'AI evaluates 19 scholarships instantly', subtitle: 'Claude reviews every criterion — GPA, income, residency, first-gen status, FAFSA — and surfaces every match with a confidence score and plain-language reason.' },
    review:  { title: 'UF staff reviews and approves', subtitle: 'Financial aid advisors see AI-suggested matches with reasoning. They approve, reject, or flag with one click.' },
    letter:  { title: 'Eligibility letter generated', subtitle: 'A professional letter is drafted automatically and queued for staff final approval before it reaches Jordan.' },
    matches: { title: 'Jordan sees her results', subtitle: 'One simple dashboard shows every scholarship she's been approved for and the exact amount.' },
    parent:  { title: 'Sandra gets notified', subtitle: 'Parents receive a summary email the moment letters are approved — no login required.' },
  }

  const { title, subtitle } = stepTitles[currentStep.id]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue-900">ScholarMatch AI</Link>
        <div className="flex gap-4 items-center text-sm">
          <Link href="/demo" className="text-blue-900 font-semibold border-b-2 border-blue-900 pb-0.5">Demo</Link>
          <Link href="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
          <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">Sign in</Link>
          <Link href="/auth/signup" className="bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800">Get started</Link>
        </div>
      </nav>

      {/* Hero banner */}
      <div className="bg-blue-900 text-white">
        <div className="max-w-5xl mx-auto px-6 py-8 text-center">
          <p className="text-xs uppercase tracking-widest text-blue-300 mb-2 font-semibold">Interactive Demo</p>
          <h1 className="text-3xl font-bold mb-2">See how ScholarMatch AI works</h1>
          <p className="text-blue-200 text-sm max-w-xl mx-auto">Follow Jordan and Sandra through the full journey — from application to scholarship letter — in under 3 minutes.</p>
        </div>
      </div>

      {/* Step progress */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-6 py-3">
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {STEPS.map((s, i) => (
              <button key={s.id} onClick={() => goTo(i)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${i === step ? 'bg-blue-900 text-white' : i < step ? 'bg-green-100 text-green-700' : 'text-gray-500 hover:bg-gray-100'}`}>
                {i < step ? '✓ ' : `${i + 1}. `}{s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-[1fr_420px] gap-8">
          {/* Left: context */}
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <PersonaBadge persona={currentStep.persona} />
                <span className="text-xs text-gray-400">Step {step + 1} of {STEPS.length}</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
              <p className="text-gray-600">{subtitle}</p>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-blue-900 h-1.5 rounded-full transition-all duration-500" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <button onClick={prev} disabled={step === 0}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                ← Back
              </button>
              <button onClick={next} disabled={step === STEPS.length - 1}
                className="px-6 py-2 bg-blue-900 text-white rounded-lg text-sm font-semibold hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed">
                Next →
              </button>
              <button onClick={() => setAutoPlay(a => !a)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${autoPlay ? 'bg-amber-50 border-amber-300 text-amber-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                {autoPlay ? '⏸ Pause' : '▶ Auto-play'}
              </button>
            </div>

            {/* Persona detail cards */}
            {step === 0 && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
                <p className="font-semibold mb-1">About this demo</p>
                <p className="text-blue-700 text-xs leading-relaxed">Jordan and Sandra are fictional personas based on typical first-generation Florida students. The scholarships shown are real programs loaded into ScholarMatch. Click <strong>Auto-play</strong> to watch the full journey hands-free, or step through manually.</p>
              </div>
            )}
            {step === 2 && (
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-sm">
                <p className="font-semibold text-green-800 mb-1">🤖 How the AI works</p>
                <p className="text-green-700 text-xs leading-relaxed">Claude reads Jordan's profile and each scholarship's criteria, then outputs a <code className="bg-green-100 px-1 rounded">match / no_match</code> decision with a confidence score and plain-language rationale. Staff see the AI's reasoning, not just a yes/no.</p>
              </div>
            )}
            {step === 3 && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm">
                <p className="font-semibold text-amber-800 mb-1">👆 Try it — approve or reject</p>
                <p className="text-amber-700 text-xs">The panel on the right is interactive. Click Approve or Reject on any match to see how the staff workflow works. Once 4+ are approved, the "Generate letters" button appears.</p>
              </div>
            )}
            {step === STEPS.length - 1 && (
              <div className="space-y-3">
                <div className="bg-blue-900 text-white rounded-2xl p-5 text-center">
                  <p className="text-2xl font-bold mb-1">{TOTAL}</p>
                  <p className="text-blue-200 text-sm mb-4">Found for Jordan in one application</p>
                  <Link href="/auth/signup" className="inline-block bg-white text-blue-900 px-6 py-2.5 rounded-xl font-bold hover:bg-blue-50 text-sm">
                    Set up your institution →
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-3 text-center text-sm">
                  <Link href="/auth/signup" className="border-2 border-blue-900 text-blue-900 rounded-xl py-3 font-semibold hover:bg-blue-50">Try as student</Link>
                  <Link href="/auth/signup" className="bg-blue-900 text-white rounded-xl py-3 font-semibold hover:bg-blue-800">Set up institution</Link>
                </div>
              </div>
            )}
          </div>

          {/* Right: screen mockup */}
          <div className="lg:sticky lg:top-8 h-fit">
            {screens[currentStep.id]}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      {step < STEPS.length - 1 && (
        <div className="border-t bg-white">
          <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-bold text-gray-900">Ready to find scholarships for your students?</p>
              <p className="text-sm text-gray-500">Set up in minutes. Federal, state, and your own institutional awards — all in one place.</p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link href="/auth/signup" className="bg-blue-900 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-800 text-sm whitespace-nowrap">Start free trial</Link>
              <Link href="/pricing" className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg text-sm hover:bg-gray-50 whitespace-nowrap">View pricing</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
