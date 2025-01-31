import { useOfflineSync } from "@/hooks/useOfflineSync";

const PageWrapper = ({ children }) => {
  const { isOnline, isSyncing } = useOfflineSync();
  const shouldAddPadding = !isOnline || isSyncing;

  return (
    <div className={`${shouldAddPadding ? "pt-8" : ""} min-h-screen`}>
      {children}
    </div>
  );
};

export default PageWrapper;