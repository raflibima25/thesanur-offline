import { Outlet } from "react-router-dom";

const AuthLayout = () => (
  <div className="min-h-screen flex flex-col">
    <main className="flex-grow">
      <Outlet />
    </main>
  </div>
);

export default AuthLayout;
