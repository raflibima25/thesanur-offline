export function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    // Register immediately
    navigator.serviceWorker.register("/service-worker.js", {
      scope: '/',
      updateViaCache: 'none'
    }).then(
      async (registration) => {
        console.log("Service Worker registered with scope:", registration.scope);
        
        if (registration.active) {
          registration.active.postMessage({ type: "SKIP_WAITING" });
        }
        
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed') {
                newWorker.postMessage({ type: "SKIP_WAITING" });
              }
            });
          }
        });

        try {
          await registration.update();
        } catch (error) {
          console.log('Update check failed:', error);
        }
      }
    ).catch((error) => {
      console.error("Service Worker registration failed:", error);
    });

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }
}