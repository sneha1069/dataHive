from flask import Blueprint, jsonify, request
from datetime import datetime, timezone, timedelta
from models import db, Job

jobs_bp = Blueprint("jobs", __name__)

@jobs_bp.route("/ping", methods=["GET"])
def ping():
    return jsonify({"message": "jobs route working"})


@jobs_bp.route("/jobs", methods=["GET"])
def get_jobs():
    query = Job.query

    # --- Filters ---
    role = request.args.get("role")
    if role and role != "All Roles":
        query = query.filter(Job.role == role)

    location = request.args.get("location")
    if location and location != "All Locations":
        query = query.filter(Job.location == location)

    mode = request.args.get("mode")
    if mode and mode != "All Modes":
        query = query.filter(Job.mode == mode)

    source = request.args.get("source")
    if source and source != "All Sources":
        query = query.filter(Job.source == source)

    date_posted = request.args.get("datePosted", type=int)
    if date_posted:
        cutoff = datetime.now(timezone.utc) - timedelta(days=date_posted)
        query = query.filter(Job.posted_date >= cutoff)

    min_salary = request.args.get("minSalary", type=int)
    if min_salary is not None:
        query = query.filter(Job.salary_min >= min_salary)

    search = request.args.get("search")
    if search:
        like_pattern = f"%{search}%"
        query = query.filter(
            db.or_(
                Job.title.ilike(like_pattern),
                Job.company.ilike(like_pattern),
                Job.skills.ilike(like_pattern),
            )
        )

    company = request.args.get("company")
    if company:
        query = query.filter(Job.company == company)

    # --- Pagination ---
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("perPage", 6, type=int)

    total = query.count()
    jobs = query.order_by(Job.posted_date.desc()).offset((page - 1) * per_page).limit(per_page).all()

    return jsonify({
        "jobs": [job.to_dict() for job in jobs],
        "total": total,
        "page": page,
        "perPage": per_page,
        "totalPages": (total + per_page - 1) // per_page,
    })


@jobs_bp.route("/jobs/<int:job_id>", methods=["GET"])
def get_job_detail(job_id):
    job = Job.query.get(job_id)
    if not job:
        return jsonify({"error": "Job not found"}), 404
    return jsonify(job.to_dict())


@jobs_bp.route("/companies", methods=["GET"])
def get_companies():
    results = (
        db.session.query(Job.company, db.func.count(Job.id))
        .group_by(Job.company)
        .all()
    )
    companies = [{"name": name, "roles": count} for name, count in results]
    return jsonify({"companies": companies})
@jobs_bp.route("/admin/trigger-scrape", methods=["GET"])
def trigger_scrape():
    from scraper import run_full_scrape
    from scraper_indeed import run_full_indeed_scrape
    
    results = {}
    try:
        run_full_scrape()
        results["naukri"] = "success"
    except Exception as e:
        results["naukri"] = f"failed: {str(e)}"
    
    try:
        run_full_indeed_scrape()
        results["indeed"] = "success"
    except Exception as e:
        results["indeed"] = f"failed: {str(e)}"
    
    return {"status": "done", "results": results}