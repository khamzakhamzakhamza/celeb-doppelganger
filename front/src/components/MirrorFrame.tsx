import './MirrorFrame.scss';
import { VideoFeed, type VideoFeedHandle } from "./VideoFeed";
import lightbulbLeft from "../assets/lightbulb_left.svg";
import lightbulbLeftLight from "../assets/lightbulb_left_light.svg"
import lightbulbRight from "../assets/lightbulb_right.svg";
import lightbulbRightLight from "../assets/lightbulb_right_light.svg";
import { useRef, useState } from 'react';

export function MirrorFrame() {
  const videoFeedRef = useRef<VideoFeedHandle>(null);

  const [ displayFeed, setDisplayFeed ] = useState<boolean>(false);
  const [ loadingFeed, setLoadingFeed ] = useState<boolean>(false);
  const [ faceFound, setFaceFound ] = useState<boolean>(false);
  const [ photos, setPhotos ] = useState<Blob[]>([]);

  const processClick = async () => {
    if (displayFeed) {
        const photo = await videoFeedRef.current?.capturePhoto();
        if (!photo) return;
        
        setPhotos([...photos, photo]);
        console.log(photo);
    } else {
      setDisplayFeed(!displayFeed);
    }
  };

  const getPhotoUrl = (index: number) => photos[index] ?  URL.createObjectURL(photos[index]) : undefined;

  return (
    <div className="mirror-frame">
      {[3, 20, 37, 54, 73].map((topPercent) => (
        <img
          className="mirror-frame__lightbulb mirror-frame__lightbulb--left"
          key={`left-${topPercent}`}
          src={faceFound ? lightbulbLeftLight : lightbulbLeft}
          style={{
            top: `${topPercent}%`,
          }}
        />
      ))}
      {[3, 20, 37, 54, 73].map((topPercent) => (
        <img
          className="mirror-frame__lightbulb mirror-frame__lightbulb--right"
          key={`right-${topPercent}`}
          src={faceFound ? lightbulbRightLight : lightbulbRight}
          style={{
            top: `${topPercent}%`,
          }}
        />
      ))}
      <div className="mirror-frame__video">
        <VideoFeed
          ref={videoFeedRef}
          displayFeed={displayFeed} 
          feedLoading={(loading) => setLoadingFeed(loading)}
          faceDetected={(detected) => setFaceFound(detected)}/>
      </div>
      <div className='mirror-frame__controls'>
        <button disabled={loadingFeed || displayFeed && !faceFound}
          className={`mirror-frame__button ${loadingFeed ? 'mirror-frame__button--disabled' : null}`}
          onClick={processClick}>
          {!displayFeed ? 'Start Camera' : 'Take Picture'}
        </button>
        <img className='mirror-frame__photo' src={getPhotoUrl(0)}/>
        <img className='mirror-frame__photo' src={getPhotoUrl(1)}/>
        <img className='mirror-frame__photo' src={getPhotoUrl(2)}/>
        <img className='mirror-frame__photo' src={getPhotoUrl(3)}/>
        <img className='mirror-frame__photo' src={getPhotoUrl(4)}/>
      </div>
    </div>
  );
}
