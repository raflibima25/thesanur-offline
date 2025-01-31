import { createBrowserRouter, Outlet, Navigate } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import HomePage from "@/pages/HomePage";
import ProfilePage from "@/pages/ProfilePage";
import LocationMapsPage from "@/pages/LocationMapsPage";
import ScanQRCodePage from "@/pages/ScanQRCodePage";
import NotFoundPage from "@/pages/NotFoundPage";
import InstallPrompt from "@/components/InstallPrompt";
import PrivateRoute from "@/components/PrivateRoute";
import ConnectionStatus from "@/components/ConnectionStatus";

export const MobileRoutes = createBrowserRouter([
  {
    element: (
      <>
        <ConnectionStatus />
        <InstallPrompt />
        <Outlet />
      </>
    ),
    children: [
      {
        path: "/",
        element: <Navigate to="/login" />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/home",
        element: (
          <PrivateRoute>
            <HomePage />
          </PrivateRoute>
        ),
      },
      {
        path: "/profile",
        element: (
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        ),
      },
      {
        path: "/scan-qrcode",
        element: (
          <PrivateRoute>
            <ScanQRCodePage />
          </PrivateRoute>
        ),
      },
      {
        path: "/location-maps",
        element: (
          <PrivateRoute>
            <LocationMapsPage />
          </PrivateRoute>
        ),
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
