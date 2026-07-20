export const ALL_JOBS = [
  { id: 1, company: 'Deloitte', initial: 'D', grad: 'linear-gradient(135deg,#A855F7,#EC4899)', topbar: 'linear-gradient(90deg,#EC4899,#A855F7)', title: 'Power BI Developer', role: 'BI Developer', location: 'Noida', mode: 'Onsite', salary: '10 - 16 LPA', salaryMin: 10, experience: '2 Years', expMin: 2, skills: ['Power BI', 'DAX', 'SQL'], source: 'Naukri', posted: '1d ago' },
  { id: 2, company: 'IBM', initial: 'I', grad: 'linear-gradient(135deg,#334155,#1E293B)', topbar: 'linear-gradient(90deg,#A855F7,#06B6D4)', title: 'Data Scientist', role: 'Data Scientist', location: 'Pune', mode: 'Remote', salary: '22 - 35 LPA', salaryMin: 22, experience: '3-6 Years', expMin: 3, skills: ['Python', 'ML', 'SQL'], source: 'Indeed', posted: '2d ago' },
  { id: 3, company: 'EY', initial: 'E', grad: 'linear-gradient(135deg,#10B981,#06B6D4)', topbar: 'linear-gradient(90deg,#10B981,#06B6D4)', title: 'SQL Developer', role: 'SQL Developer', location: 'Pune', mode: 'Hybrid', salary: '12 - 18 LPA', salaryMin: 12, experience: '1-3 Years', expMin: 1, skills: ['SQL', 'ETL', 'Power BI'], source: 'Naukri', posted: '3d ago' },
  { id: 4, company: 'Google', initial: 'G', grad: 'linear-gradient(135deg,#4285F4,#34A853)', topbar: 'linear-gradient(90deg,#4285F4,#34A853)', title: 'Data Analyst', role: 'Data Analyst', location: 'Delhi NCR', mode: 'Onsite', salary: '12 - 18 LPA', salaryMin: 12, experience: '0-2 Years', expMin: 0, skills: ['SQL', 'Excel', 'Python'], source: 'Indeed', posted: '1d ago' },
  { id: 5, company: 'Amazon', initial: 'A', grad: 'linear-gradient(135deg,#FF9900,#FF6B00)', topbar: 'linear-gradient(90deg,#FF9900,#FF6B00)', title: 'Data Engineer', role: 'Data Engineer', location: 'Hyderabad', mode: 'Onsite', salary: '18 - 30 LPA', salaryMin: 18, experience: '3-6 Years', expMin: 3, skills: ['Spark', 'AWS', 'Python'], source: 'Naukri', posted: '3d ago' },
  { id: 6, company: 'Swiggy', initial: 'S', grad: 'linear-gradient(135deg,#FF5200,#FF9900)', topbar: 'linear-gradient(90deg,#FF5200,#FF9900)', title: 'Analytics Engineer', role: 'Analytics Engineer', location: 'Bengaluru', mode: 'Hybrid', salary: '12 - 20 LPA', salaryMin: 12, experience: '1-3 Years', expMin: 1, skills: ['dbt', 'SQL', 'Airflow'], source: 'Naukri', posted: '6d ago' },
  { id: 7, company: 'Infosys', initial: 'I', grad: 'linear-gradient(135deg,#3B82F6,#1D4ED8)', topbar: 'linear-gradient(90deg,#3B82F6,#1D4ED8)', title: 'SQL Developer', role: 'SQL Developer', location: 'Noida', mode: 'Onsite', salary: '5 - 8 LPA', salaryMin: 5, experience: '0-2 Years', expMin: 0, skills: ['SQL', 'MySQL', 'ETL'], source: 'Indeed', posted: '1w ago' },
  { id: 8, company: 'Flipkart', initial: 'F', grad: 'linear-gradient(135deg,#FBBF24,#F59E0B)', topbar: 'linear-gradient(90deg,#FBBF24,#F59E0B)', title: 'Data Analyst', role: 'Data Analyst', location: 'Bengaluru', mode: 'Onsite', salary: '9 - 14 LPA', salaryMin: 9, experience: '1-3 Years', expMin: 1, skills: ['SQL', 'Tableau', 'Python'], source: 'Naukri', posted: '4d ago' },
  { id: 9, company: 'Accenture', initial: 'A', grad: 'linear-gradient(135deg,#A100FF,#7B00CC)', topbar: 'linear-gradient(90deg,#A100FF,#7B00CC)', title: 'BI Developer', role: 'BI Developer', location: 'Gurugram', mode: 'Hybrid', salary: '8 - 13 LPA', salaryMin: 8, experience: '1-3 Years', expMin: 1, skills: ['Power BI', 'SQL', 'Tableau'], source: 'Indeed', posted: '2d ago' },
  { id: 10, company: 'TCS', initial: 'T', grad: 'linear-gradient(135deg,#00458B,#0066CC)', topbar: 'linear-gradient(90deg,#00458B,#0066CC)', title: 'Data Engineer', role: 'Data Engineer', location: 'Chennai', mode: 'Onsite', salary: '7 - 12 LPA', salaryMin: 7, experience: '0-2 Years', expMin: 0, skills: ['Python', 'SQL', 'Hadoop'], source: 'Naukri', posted: '5d ago' },
  { id: 11, company: 'Microsoft', initial: 'M', grad: 'linear-gradient(135deg,#00A4EF,#7FBA00)', topbar: 'linear-gradient(90deg,#00A4EF,#7FBA00)', title: 'Data Scientist', role: 'Data Scientist', location: 'Hyderabad', mode: 'Remote', salary: '25 - 40 LPA', salaryMin: 25, experience: '4-8 Years', expMin: 4, skills: ['Python', 'ML', 'Azure'], source: 'Indeed', posted: '1d ago' },
  { id: 12, company: 'Zomato', initial: 'Z', grad: 'linear-gradient(135deg,#E23744,#CB202D)', topbar: 'linear-gradient(90deg,#E23744,#CB202D)', title: 'Analytics Engineer', role: 'Analytics Engineer', location: 'Delhi NCR', mode: 'Hybrid', salary: '14 - 22 LPA', salaryMin: 14, experience: '2-4 Years', expMin: 2, skills: ['SQL', 'dbt', 'Python'], source: 'Naukri', posted: '2d ago' },
]

export const ROLES = ['All Roles', 'Data Analyst', 'Data Engineer', 'Data Scientist', 'BI Developer', 'SQL Developer', 'Analytics Engineer']
export const LOCATIONS = ['All Locations', 'Delhi NCR', 'Noida', 'Gurugram', 'Bengaluru', 'Hyderabad', 'Pune', 'Chennai']
export const MODES = ['All Modes', 'Onsite', 'Hybrid', 'Remote']

export const COMPANIES_LIST = [
  { name: 'Google', initial: 'G', grad: 'linear-gradient(135deg,#4285F4,#34A853)', industry: 'Technology', hq: 'Bengaluru' },
  { name: 'Amazon', initial: 'A', grad: 'linear-gradient(135deg,#FF9900,#FF6B00)', industry: 'E-commerce', hq: 'Hyderabad' },
  { name: 'Deloitte', initial: 'D', grad: 'linear-gradient(135deg,#A855F7,#EC4899)', industry: 'Consulting', hq: 'Noida' },
  { name: 'IBM', initial: 'I', grad: 'linear-gradient(135deg,#334155,#1E293B)', industry: 'Technology', hq: 'Pune' },
  { name: 'EY', initial: 'E', grad: 'linear-gradient(135deg,#10B981,#06B6D4)', industry: 'Consulting', hq: 'Pune' },
  { name: 'Swiggy', initial: 'S', grad: 'linear-gradient(135deg,#FF5200,#FF9900)', industry: 'Food Tech', hq: 'Bengaluru' },
  { name: 'Infosys', initial: 'I', grad: 'linear-gradient(135deg,#3B82F6,#1D4ED8)', industry: 'IT Services', hq: 'Noida' },
  { name: 'Flipkart', initial: 'F', grad: 'linear-gradient(135deg,#FBBF24,#F59E0B)', industry: 'E-commerce', hq: 'Bengaluru' },
  { name: 'Accenture', initial: 'A', grad: 'linear-gradient(135deg,#A100FF,#7B00CC)', industry: 'Consulting', hq: 'Gurugram' },
  { name: 'TCS', initial: 'T', grad: 'linear-gradient(135deg,#00458B,#0066CC)', industry: 'IT Services', hq: 'Chennai' },
  { name: 'Microsoft', initial: 'M', grad: 'linear-gradient(135deg,#00A4EF,#7FBA00)', industry: 'Technology', hq: 'Hyderabad' },
  { name: 'Zomato', initial: 'Z', grad: 'linear-gradient(135deg,#E23744,#CB202D)', industry: 'Food Tech', hq: 'Delhi NCR' },
]