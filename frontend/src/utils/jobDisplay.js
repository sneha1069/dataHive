import { COMPANIES_LIST } from '../data/jobs'

// Fallback gradients agar company COMPANIES_LIST mein na mile
const FALLBACK_GRADIENTS = [
  'linear-gradient(135deg,#A855F7,#06B6D4)',
  'linear-gradient(135deg,#EC4899,#A855F7)',
  'linear-gradient(135deg,#06B6D4,#10B981)',
  'linear-gradient(135deg,#F59E0B,#EC4899)',
]

function hashString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
}

export function getCompanyStyle(companyName) {
  const known = COMPANIES_LIST.find(function (c) { return c.name === companyName })
  if (known) {
    return { initial: known.initial, grad: known.grad, topbar: known.grad }
  }
  const grad = FALLBACK_GRADIENTS[hashString(companyName) % FALLBACK_GRADIENTS.length]
  return { initial: companyName.charAt(0).toUpperCase(), grad: grad, topbar: grad }
}

export function formatSalary(min, max) {
  if (min == null && max == null) return 'Not disclosed'
  if (min != null && max != null) return min + ' - ' + max + ' LPA'
  var val = min != null ? min : max
  return val + ' LPA'
}

export function formatExperience(min, max) {
  if (min == null && max == null) return 'Not specified'
  if (min === 0 && max === 0) return 'Fresher'
  if (min != null && max != null && min !== max) return min + '-' + max + ' Years'
  var val = min != null ? min : max
  return val + ' Years'
}

export function formatRelativeTime(isoDateString) {
  if (!isoDateString) return 'recently'
  const posted = new Date(isoDateString)
  const now = new Date()
  const diffMs = now - posted
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays <= 0) return 'today'
  if (diffDays === 1) return '1d ago'
  if (diffDays < 7) return diffDays + 'd ago'
  const weeks = Math.floor(diffDays / 7)
  return weeks === 1 ? '1w ago' : weeks + 'w ago'
}

export function decorateJob(job) {
  const style = getCompanyStyle(job.company)
  return {
    ...job,
    ...style,
    salary: formatSalary(job.salaryMin, job.salaryMax),
    experience: formatExperience(job.expMin, job.expMax),
    posted: formatRelativeTime(job.postedDate),
  }
}

export function getCompanyMeta(companyName) {
  const known = COMPANIES_LIST.find(function (c) { return c.name === companyName })
  if (known) return known
  const style = getCompanyStyle(companyName)
  return { name: companyName, initial: style.initial, grad: style.grad, industry: 'Other', hq: 'India' }
}