import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../pages/Login/Login";
import HomeStudent from "../pages/student/components/HomeStudent";
import Register from "../pages/Register/Register";
import Admin from "../pages/admin/Admin";
import Student from "../pages/student/Student";
import Mentor from "../pages/Mentor/Mentor";
import FinanceOfficer from "../pages/FinanceOfficer/FinanceOfficer";

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/student" element={<HomeStudent />} />
        <Route path="/student/*" element={<Student />} />
        <Route path="/admin/*" element={<Admin />} />
        <Route path="/mentor/*" element={<Mentor />} />
        <Route path="/finance-officer/*" element={<FinanceOfficer />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
