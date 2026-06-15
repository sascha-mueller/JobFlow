import { Outlet } from "react-router";

const AuthLayout = () => {
  return (
    <div className="page-container">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
