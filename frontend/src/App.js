import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import Employees from "./pages/Employees";
import EmployeeAdd from "./pages/EmployeeAdd";
import EmployeeEdit from "./pages/EmployeeEdit";
export default App;

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Employees />} />
          <Route path="/employees/add" element={<EmployeeAdd />} />
          <Route path="/employees/:id" element={<EmployeeEdit />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

