from werkzeug.security import generate_password_hash
from config import get_sqlserver_connection

username = "admin1"
password = "111111"
role = "Admin"

hashed_password = generate_password_hash(password)

sql = get_sqlserver_connection()
cur = sql.cursor()

cur.execute("""
    INSERT INTO Users (Username, PasswordHash, Role, IsActive)
    VALUES (?, ?, ?, 1)
""", (username, hashed_password, role))

sql.commit()
cur.close()
sql.close()

print("✅ User created successfully!")