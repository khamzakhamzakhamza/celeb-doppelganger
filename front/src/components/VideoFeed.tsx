import './VideoFeed.scss';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import silhouette from  "../assets/silhouette.svg";
import * as faceapi from "face-api.js";

type VideoFeedProps = {
  displayFeed: boolean;
  feedLoading: (loading: boolean) => void;
  faceDetected: (detected: boolean) => void;
};

export type VideoFeedHandle = {
  capturePhoto: () => Promise<Blob | null>;
};

export const VideoFeed = forwardRef<VideoFeedHandle, VideoFeedProps>(
  function VideoFeed(props, ref) {
    const { displayFeed, feedLoading, faceDetected } = props;
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const detecIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const [error, setError] = useState<string | null>(null);
    const [modelLoaded, setModelLoaded] = useState<boolean>(false);
    const [feedLoaded, setFeedLoaded] = useState<boolean>(false);

    const capturePhoto = async (): Promise<Blob | null> => {
      if (!videoRef.current) return null;
      
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoHeight;
      canvas.height = videoRef.current.videoHeight;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      ctx.drawImage(videoRef.current, -1 * (videoRef.current.videoWidth - videoRef.current.videoHeight) / 2, 0);
      return await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Photo capture failed"))),
          "image/jpeg",
          0.92
        )
      );
    };

    useImperativeHandle(ref, () => ({ capturePhoto }), []);

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
      
      const intervalTime = 300;

      detecIntervalRef.current = setInterval(() => {
        faceapi.detectSingleFace(videoRef.current!)
          .then((detection) => {        
            if (!detection) {
              faceDetected(false);
              return detection;
            }
            
            const maxHorizOffset = 100;
            const detectCenter = detection.box.width / 2 + detection!.box.left;
            const videoCenter = videoRef.current!.videoWidth / 2;
            const centered = detectCenter <= videoCenter + maxHorizOffset && detectCenter >= videoCenter - maxHorizOffset;

            const minOcupPercent = 0.5;
            const minDetectHeight = videoRef.current!.videoHeight * minOcupPercent;

            faceDetected(centered && detection.box.height >= minDetectHeight);
            return detection;
          });
      }, intervalTime);

      return (() => cleanUp());
    }, [modelLoaded, displayFeed, feedLoaded])

    useEffect(() => {
      if (!displayFeed) return;

      feedLoading(true);
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
                feedLoading(false);
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
            feedLoading(false);
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
);