from app import create_app
from models import db, Job

app = create_app()

with app.app_context():
    # Purani dummy jobs source = "Naukri" ya "Indeed" thi bina apply_link ke (dummy data mein apply_link khaali tha)
    dummy_jobs = Job.query.filter(Job.apply_link == "").all()
    count = len(dummy_jobs)

    for job in dummy_jobs:
        db.session.delete(job)

    db.session.commit()
    print(f"Deleted {count} dummy jobs.")

    remaining = Job.query.count()
    print(f"Remaining jobs in database: {remaining}")