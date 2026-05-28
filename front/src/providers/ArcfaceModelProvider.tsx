import {
  createContext,
  useEffect,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
  useContext,
} from "react";
import { ArcfaceService } from "../services/arcfaceService";
import { LoadingScreen } from "../pages/LoadingScreen";

export type ModelStatus = "loading" | "ready";

type ArcfaceModelContext = {
  modelBytes: ArrayBuffer | null;
  status: ModelStatus;
};

export const ArcfaceModelContext = createContext<ArcfaceModelContext>({modelBytes: null, status: "loading" });
const arcfaceService = new ArcfaceService();

export function ArcfaceModelProvider({ children }: { children: ReactNode }) {
  const [modelBytes, setModelBytes] = useState<ArrayBuffer | null>(null);
  const [status, setStatus] = useState<ModelStatus>("loading");
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [showApp, setShowApp] = useState(false);

  useEffect(() => {
    setStatus("loading");
    setDownloadComplete(false);
    setShowApp(false);

    arcfaceService.downloadArcfaceModel()
      .then((bytes: ArrayBuffer) => {
        setModelBytes(bytes);
        setDownloadComplete(true);
        setStatus("ready");
      })
      .catch((e: Error) => {
        console.error(e.message);
      })
  }, []);

  const arcfaceModelContext = useMemo<ArcfaceModelContext>(() => {
    return { modelBytes, status };
  }, [modelBytes, status]);

  const handleLoadingFinished = useCallback(() => {
    setShowApp(true);
  }, []);

  return (
    <ArcfaceModelContext.Provider value={arcfaceModelContext}>
      {arcfaceModelContext.status === "ready" && showApp ? (
        children
      ) : (
        <LoadingScreen
          downloadComplete={downloadComplete}
          onFinished={handleLoadingFinished}
        />
      )}
    </ArcfaceModelContext.Provider>
  );
}

export function useArcfaceModel() {
  return useContext(ArcfaceModelContext);
}
