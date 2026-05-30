import './VideoFeed.scss';
import { useEffect, useRef, useState } from "react";
import silhouette from  "../assets/silhouette.svg";
import * as faceapi from "face-api.js";

type VideoFeedProps = {
  displayFeed: boolean;
  feedStartedLoading: () => void;
  feedFinishedLoading: () => void;
  faceDetected: (detected: boolean) => void;
};

export function VideoFeed({ displayFeed, feedStartedLoading, feedFinishedLoading, faceDetected } : VideoFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detecIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modelLoaded, setModelLoaded] = useState<boolean>(false);
  const [feedLoaded, setFeedLoaded] = useState<boolean>(false);

  useEffect(() => {
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
      .then(() => setModelLoaded(true))
  }, []);

  useEffect(() => {
    const cleanUp = () => {
      if (detecIntervalRef.current) clearInterval(detecIntervalRef.current);
      faceDetected(false);
    }

    if (!modelLoaded || !displayFeed || !feedLoaded) {
      cleanUp()
      return;
    }
    
    const intervalTime = 500;

    cleanUp();
    detecIntervalRef.current = setInterval(() => {
      faceapi.detectSingleFace(videoRef.current!)
        .then((detection) => {
          faceDetected(detection != undefined);
          console.log(detection);
          return detection;
        });
    }, intervalTime);

    return (() => cleanUp());
  }, [modelLoaded, displayFeed, feedLoaded])

  useEffect(() => {
    if (!displayFeed) return;

    feedStartedLoading();
    setFeedLoaded(false);

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
            .then(() => {
              feedFinishedLoading();
              setFeedLoaded(true);
            })
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
        .then(() => {
          feedFinishedLoading();
          setFeedLoaded(true);
        })
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
