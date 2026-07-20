from datetime import datetime, timedelta
from app import create_app
from models import db, Job

JOBS_DATA = [
    {"title": "Power BI Developer", "role": "BI Developer", "company": "Deloitte", "location": "Noida", "mode": "Onsite",
     "salary_min": 10, "salary_max": 16, "experience_min": 2, "experience_max": 2,
     "skills": "Power BI,DAX,SQL", "source": "Naukri", "apply_link": "", "posted_date": datetime.utcnow() - timedelta(days=1)},

    {"title": "Data Scientist", "role": "Data Scientist", "company": "IBM", "location": "Pune", "mode": "Remote",
     "salary_min": 22, "salary_max": 35, "experience_min": 3, "experience_max": 6,
     "skills": "Python,ML,SQL", "source": "Indeed", "apply_link": "", "posted_date": datetime.utcnow() - timedelta(days=2)},

    {"title": "SQL Developer", "role": "SQL Developer", "company": "EY", "location": "Pune", "mode": "Hybrid",
     "salary_min": 12, "salary_max": 18, "experience_min": 1, "experience_max": 3,
     "skills": "SQL,ETL,Power BI", "source": "Naukri", "apply_link": "", "posted_date": datetime.utcnow() - timedelta(days=3)},

    {"title": "Data Analyst", "role": "Data Analyst", "company": "Google", "location": "Delhi NCR", "mode": "Onsite",
     "salary_min": 12, "salary_max": 18, "experience_min": 0, "experience_max": 2,
     "skills": "SQL,Excel,Python", "source": "Indeed", "apply_link": "", "posted_date": datetime.utcnow() - timedelta(days=1)},

    {"title": "Data Engineer", "role": "Data Engineer", "company": "Amazon", "location": "Hyderabad", "mode": "Onsite",
     "salary_min": 18, "salary_max": 30, "experience_min": 3, "experience_max": 6,
     "skills": "Spark,AWS,Python", "source": "Naukri", "apply_link": "", "posted_date": datetime.utcnow() - timedelta(days=3)},

    {"title": "Analytics Engineer", "role": "Analytics Engineer", "company": "Swiggy", "location": "Bengaluru", "mode": "Hybrid",
     "salary_min": 12, "salary_max": 20, "experience_min": 1, "experience_max": 3,
     "skills": "dbt,SQL,Airflow", "source": "Naukri", "apply_link": "", "posted_date": datetime.utcnow() - timedelta(days=6)},

    {"title": "SQL Developer", "role": "SQL Developer", "company": "Infosys", "location": "Noida", "mode": "Onsite",
     "salary_min": 5, "salary_max": 8, "experience_min": 0, "experience_max": 2,
     "skills": "SQL,MySQL,ETL", "source": "Indeed", "apply_link": "", "posted_date": datetime.utcnow() - timedelta(days=7)},

    {"title": "Data Analyst", "role": "Data Analyst", "company": "Flipkart", "location": "Bengaluru", "mode": "Onsite",
     "salary_min": 9, "salary_max": 14, "experience_min": 1, "experience_max": 3,
     "skills": "SQL,Tableau,Python", "source": "Naukri", "apply_link": "", "posted_date": datetime.utcnow() - timedelta(days=4)},

    {"title": "BI Developer", "role": "BI Developer", "company": "Accenture", "location": "Gurugram", "mode": "Hybrid",
     "salary_min": 8, "salary_max": 13, "experience_min": 1, "experience_max": 3,
     "skills": "Power BI,SQL,Tableau", "source": "Indeed", "apply_link": "", "posted_date": datetime.utcnow() - timedelta(days=2)},

    {"title": "Data Engineer", "role": "Data Engineer", "company": "TCS", "location": "Chennai", "mode": "Onsite",
     "salary_min": 7, "salary_max": 12, "experience_min": 0, "experience_max": 2,
     "skills": "Python,SQL,Hadoop", "source": "Naukri", "apply_link": "", "posted_date": datetime.utcnow() - timedelta(days=5)},

    {"title": "Data Scientist", "role": "Data Scientist", "company": "Microsoft", "location": "Hyderabad", "mode": "Remote",
     "salary_min": 25, "salary_max": 40, "experience_min": 4, "experience_max": 8,
     "skills": "Python,ML,Azure", "source": "Indeed", "apply_link": "", "posted_date": datetime.utcnow() - timedelta(days=1)},

    {"title": "Analytics Engineer", "role": "Analytics Engineer", "company": "Zomato", "location": "Delhi NCR", "mode": "Hybrid",
     "salary_min": 14, "salary_max": 22, "experience_min": 2, "experience_max": 4,
     "skills": "SQL,dbt,Python", "source": "Naukri", "apply_link": "", "posted_date": datetime.utcnow() - timedelta(days=2)},
]

app = create_app()

with app.app_context():
    db.drop_all()
    db.create_all()

    for job_data in JOBS_DATA:
        job_data["scraped_at"] = datetime.utcnow()
        job = Job(**job_data)
        db.session.add(job)

    db.session.commit()
    print(f"✅ {len(JOBS_DATA)} jobs inserted successfully!")