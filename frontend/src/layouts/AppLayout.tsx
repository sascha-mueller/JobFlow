import { Outlet } from "react-router";
import Header from "@/layouts/partials/Header";
import Sidebar from "@/layouts/partials/Sidebar";

const AppLayout = () => {
  return (
    <div className="page-container">
      <div className="page">
        <Sidebar />
        <Header />
        <main className="main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
