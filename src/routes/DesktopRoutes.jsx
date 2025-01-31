import { createBrowserRouter } from "react-router-dom";
import PrivateRoute from "../components/PrivateRoute";
import IntroPage from "../pages/IntroPage";
import RegisterPage from "../pages/RegisterPage";
import ProfilePage from "../pages/ProfilePage";
import InfoToMobile from "../pages/InfoToMobile";
import NotFoundPage from "../pages/NotFoundPage";

const mobilePaths = ["/login", "/home", "/scan-qrcode", "/location-maps"];

export const DesktopRoutes = createBrowserRouter([
  {
    path: "/",
    element: <IntroPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/profile",
    element: (
      <PrivateRoute>
        <ProfilePage />
      </PrivateRoute>
    ),
  },
  // Mobile paths redirect to info
  ...mobilePaths.map((path) => ({
    path,
    element: <InfoToMobile />,
  })),
  {
    path: "/info",
    element: <InfoToMobile />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
