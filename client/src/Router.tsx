import { BrowserRouter, Routes, Route } from "react-router";
import Landing from "./components/Landing";
import LoginPage from "./components/Users/Login/LoginPage";
import Dashboard from "./components/Dash/Dashboard";
import SignUpPage from "./components/Users/Signup/SignUpPage";
import PickUsernamePage from "./components/Users/Username/UsernamePage";
export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/SignUp" element={<SignUpPage />} />
        <Route path="/username" element={<PickUsernamePage />} />

        <Route path="/Dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
