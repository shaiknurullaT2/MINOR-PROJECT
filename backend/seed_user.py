"""
Seed script: creates a demo user in the SQLite database.
Run from the backend directory:
  .\\venv\\Scripts\\python.exe seed_user.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from models.database import SessionLocal, engine, Base
from models.domain import User

# Use bcrypt directly to avoid passlib version incompatibility
import bcrypt

DEMO_EMAIL    = "admin@summarizeai.com"
DEMO_PASSWORD = "Admin1234"

def hash_pw(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

Base.metadata.create_all(bind=engine)

db = SessionLocal()
try:
    existing = db.query(User).filter(User.email == DEMO_EMAIL).first()
    if existing:
        print(f"[INFO] User '{DEMO_EMAIL}' already exists (id={existing.id}). Updating password...")
        existing.hashed_password = hash_pw(DEMO_PASSWORD)
        db.commit()
        print("[OK] Password updated.")
    else:
        user = User(email=DEMO_EMAIL, hashed_password=hash_pw(DEMO_PASSWORD))
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"[OK] Demo user created! DB id = {user.id}")
finally:
    db.close()

# Show all users
db2 = SessionLocal()
users = db2.query(User).all()
print(f"\n--- SQLite 'users' table ({len(users)} row(s)) ---")
for u in users:
    print(f"  id={u.id}  email={u.email}")
db2.close()

print(f"\n  LOGIN CREDENTIALS")
print(f"  Email    : {DEMO_EMAIL}")
print(f"  Password : {DEMO_PASSWORD}")
print(f"\n  URL: http://localhost:8000")
