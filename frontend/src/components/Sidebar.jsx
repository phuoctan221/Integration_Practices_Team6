import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div
      className="bg-light border-end"
      style={{ width: "220px", height: "100vh" }}
    >
      <div className="list-group list-group-flush">

        <Link to="/" className="list-group-item list-group-item-action">
          {" "}
          Employees
        </Link>

        <Link
          to="/employees/add"
          className="list-group-item list-group-item-action"
        >
          {" "}
          Add Employee
        </Link>
      </div>
    </div>
  );
}
