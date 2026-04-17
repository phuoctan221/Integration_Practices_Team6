import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout() {
  return (
    <div className="d-flex">

      <Sidebar />
      <div className="flex-grow-1">
        <Header />

        <div className="p-4">
          <Outlet />   
        </div>
      </div>

    </div>
  );
}