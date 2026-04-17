from .auth_routes import auth_bp
from .employee_routes import employee_bp
from .payroll_routes import payroll_bp
from .dashboard_routes import dashboard_bp
from .attendance_routes import attendance_bp
from .report_routes import report_bp

def register_routes(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(employee_bp)
    app.register_blueprint(payroll_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(attendance_bp)
    app.register_blueprint(report_bp)