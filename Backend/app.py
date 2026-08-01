import os
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from models import db
from routes.jobs import jobs_bp
from routes.auth import auth_bp
from apscheduler.schedulers.background import BackgroundScheduler
import re


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, origins=re.compile(r"^http://(localhost|127\.0\.0\.1):\d+$"))

    db.init_app(app)
    JWTManager(app)

    app.register_blueprint(jobs_bp, url_prefix="/api")
    app.register_blueprint(auth_bp, url_prefix="/api/auth")

    with app.app_context():
        db.create_all()

    @app.route("/api/health")
    def health():
        return {"status": "ok", "message": "DataHive backend is running"}

    return app


def run_scraper_job():
    from scraper import run_full_scrape
    from scraper_indeed import run_full_indeed_scrape

    print("\n[Scheduler] Starting scheduled Naukri scrape...")
    try:
        run_full_scrape()
    except Exception as e:
        print(f"[Scheduler] Naukri scrape failed: {e}")

    print("\n[Scheduler] Starting scheduled Indeed scrape...")
    try:
        run_full_indeed_scrape()
    except Exception as e:
        print(f"[Scheduler] Indeed scrape failed: {e}")


if __name__ == "__main__":
    app = create_app()

    if os.environ.get("WERKZEUG_RUN_MAIN") == "true":
        scheduler = BackgroundScheduler()
        scheduler.add_job(run_scraper_job, "interval", hours=24, id="job_scraper")
        scheduler.start()
        print("Scheduler started: Naukri + Indeed scrapers will run every 24 hours.")

    app.run(debug=True, port=5000)