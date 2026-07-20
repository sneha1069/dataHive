from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


class Job(db.Model):
    __tablename__ = "jobs"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    role = db.Column(db.String(100), nullable=False)
    company = db.Column(db.String(150), nullable=False)
    location = db.Column(db.String(100), nullable=False)
    mode = db.Column(db.String(50))

    salary_min = db.Column(db.Integer)
    salary_max = db.Column(db.Integer)

    experience_min = db.Column(db.Integer)
    experience_max = db.Column(db.Integer)

    skills = db.Column(db.String(500))

    source = db.Column(db.String(50))
    apply_link = db.Column(db.String(500))

    posted_date = db.Column(db.DateTime)
    scraped_at = db.Column(db.DateTime)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "role": self.role,
            "company": self.company,
            "location": self.location,
            "mode": self.mode,
            "salaryMin": self.salary_min,
            "salaryMax": self.salary_max,
            "expMin": self.experience_min,
            "expMax": self.experience_max,
            "skills": self.skills.split(",") if self.skills else [],
            "source": self.source,
            "applyLink": self.apply_link,
            "postedDate": self.posted_date.isoformat() if self.posted_date else None,
        }


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.now())

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
        }