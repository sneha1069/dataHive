import os
from dotenv import load_dotenv

load_dotenv()

basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    DEBUG = True
    SECRET_KEY = os.getenv("SECRET_---KEY", "dev-secret-key-change-later")
    SQLALCHEMY_DATABASE_URI = f"sqlite:///{os.path.join(basedir, 'datahive.db')}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret-change-later")