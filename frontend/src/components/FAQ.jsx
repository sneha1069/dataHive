import { useState } from 'react'

const FAQS = [
  { q: 'Where does DataHive get its job listings from?', a: 'We aggregate live postings from Indeed and Naukri, refreshed daily, so you see roles within 24-48 hours of being posted.' },
  { q: 'Is DataHive free to use?', a: 'Yes, browsing and applying to jobs is completely free for job seekers.' },
  { q: 'How often is the data updated?', a: 'Our backend pulls fresh listings on a scheduled basis, at least once a day, and removes postings older than 10 days.' },
  { q: 'Do you store my resume?', a: 'DataHive currently does not require resume uploads — you apply directly on the source platform via the Apply link.' },
]

export default function FAQ() {
  const [open, setOpen] = useState(0)

  return (
    <section id="faq" className="max-w-3xl mx-auto px-6 pb-16">
      <h2 className="font-bold text-[22px] mb-6 text-center">Frequently asked questions</h2>
      <div className="flex flex-col gap-2.5">
        {FAQS.map((faq, i) => (
          <div
            key={faq.q}
            className="rounded-xl overflow-hidden"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <button
              onClick={() => setOpen(open === i ? -1 : i)}
              className="w-full flex justify-between items-center px-5 py-4 text-left font-semibold text-[14.5px]"
            >
              {faq.q}
              <span
                className="text-lg transition-transform"
                style={{ color: 'var(--accent-purple)', transform: open === i ? 'rotate(45deg)' : 'none' }}
              >
                +
              </span>
            </button>
            {open === i && (
              <div className="px-5 pb-[18px] text-[13.5px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}