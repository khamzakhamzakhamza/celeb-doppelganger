import './VideoFeed.scss';
import { useEffect, useRef, useState } from "react";
import silhouette from  "../assets/silhouette.svg";

type VideoFeedProps = {
  displayFeed: boolean;
  feedStartedLoading: () => void;
  feedFinishedLoading: () => void;
};

export function VideoFeed({ displayFeed, feedStartedLoading, feedFinishedLoading } : VideoFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!displayFeed) return;

    feedStartedLoading();

    if (!streamRef.current) {
      navigator.mediaDevices
        .getUserMedia({
          video: { facingMode: "user", width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        })
        .then((stream) => {
          streamRef.current = stream;
          videoRef.current!.srcObject = streamRef.current;
          void videoRef.current!.play()
            .then(() => feedFinishedLoading())
            .catch(() => {
              setError("Could not start video feed :(\nPlease check permissions or try different browser.");
            });
        })
        .catch(() => {
          setError("Could not find a camera :(\nPlease check permissions or try different device.");
        });
    } else {      
      videoRef.current!.srcObject = streamRef.current;
      void videoRef.current!.play()
        .then(() => feedFinishedLoading())
        .catch(() => {
          setError("Could not start video feed :(\nPlease check permissions or try different browser.");
        });
    }
  }, [displayFeed]);

  return <>{error 
    ? (<div className="video-feed">
      <p>{error}</p>
    </div>)
    : displayFeed
      ? (<div className="video-feed">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="video-feed__video"
          />
          <img
            className="video-feed__silhouette"
            key='silhouette'
            src={silhouette}
          />
        </div>)
      : (<div className="video-feed">
        <p>Spaceholder for a nice instruction on how this thing will work</p>
      </div>)
  }</>;
}
