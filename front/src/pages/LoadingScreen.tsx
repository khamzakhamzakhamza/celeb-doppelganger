import { useEffect, useRef, useState } from "react";
import { Title } from "../components/Title";
import './LoadingScreen.scss';

type LoadingScreenProps = {
  downloadComplete: boolean;
  onFinished: () => void;
};

export function LoadingScreen({
  downloadComplete,
  onFinished
}: LoadingScreenProps) {
  const [progress, setProgress] = useState(1);
  const doneRef = useRef(false);

  useEffect(() => {
    if (downloadComplete) return;

    const id = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 99) return prev;

        const maxStep = prev < 40 ? 10 : prev < 70 ? 5 : 1;
        const step = 1 + Math.floor(Math.random() * maxStep);
        return Math.min(99, prev + step);
      });
    }, 200);

    return () => window.clearInterval(id);
  }, [downloadComplete]);

  useEffect(() => {
    if (!downloadComplete || doneRef.current) return;

    doneRef.current = true;
    setProgress(100);
    const id = window.setTimeout(() => {
      onFinished();
    }, 150);

    return () => window.clearTimeout(id);
  }, [downloadComplete, onFinished]);

  return (
    <div className="loading-screen">
      <div className="loading-screen__content">
        <Title
          title="Loading..."
          glowMode="pulse"
        />
        <p className="loading-screen__progress">
          {`${progress}%`}
        </p>
      </div>
    </div>
  );
}
