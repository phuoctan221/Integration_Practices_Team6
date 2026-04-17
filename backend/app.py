from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS  
from routes import register_routes

app = Flask(__name__)

app.config["JWT_SECRET_KEY"] = "your-secret-key"

CORS(app, supports_credentials=True)
jwt = JWTManager(app)
register_routes(app)

if __name__ == "__main__":
    app.run(debug=True)