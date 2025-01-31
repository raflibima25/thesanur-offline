import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LocationProvider } from "./context/LocationContext";
import { AuthContextProvider } from "./context/AuthContext";
import { UserProvider } from "./context/UserContext";
import { RouterProvider } from "react-router-dom";
import { DesktopRoutes } from "./routes/DesktopRoutes";
import { MobileRoutes } from "./routes/MobileRoutes";
import { useDeviceDetection } from "./hooks/useDeviceDetection";
import { useServiceWorker } from "./hooks/useServiceWorker";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => {
  const { isMobile, isMobileDomain, reactAppEnvIsMobile } = useDeviceDetection();
  useServiceWorker();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider>
        <UserProvider>
          <LocationProvider>
            <RouterProvider router={isMobile || isMobileDomain || reactAppEnvIsMobile ? MobileRoutes : DesktopRoutes} />
          </LocationProvider>
        </UserProvider>
      </AuthContextProvider>
    </QueryClientProvider>
  );
};

export default App;
