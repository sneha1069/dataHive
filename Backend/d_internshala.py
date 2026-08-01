from app import create_app
from models import db, Job

app = create_app()

with app.app_context():
    deleted_count = Job.query.filter_by(source="Internshala").delete()
    db.session.commit()
    print(f"Deleted {deleted_count} Internshala jobs from the database.")