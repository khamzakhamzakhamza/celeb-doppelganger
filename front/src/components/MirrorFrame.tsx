import './MirrorFrame.scss';
import { VideoFeed, type VideoFeedHandle } from "./VideoFeed";
import lightbulbLeft from "../assets/lightbulb_left.svg";
import lightbulbLeftLight from "../assets/lightbulb_left_light.svg"
import lightbulbRight from "../assets/lightbulb_right.svg";
import lightbulbRightLight from "../assets/lightbulb_right_light.svg";
import { useRef, useState } from 'react';
import { ArcfaceService } from '../services/arcfaceService';
import { useArcfaceModel } from '../providers/ArcfaceModelProvider';
import { PhotosPreview } from './PhotosPreview';

const arcfaceService = new ArcfaceService();

export function MirrorFrame() {
  const numOfPhotos = 4;
  const videoFeedRef = useRef<VideoFeedHandle>(null);
  const { modelBytes } = useArcfaceModel();

  const [ displayFeed, setDisplayFeed ] = useState<boolean>(false);
  const [ loadingFeed, setLoadingFeed ] = useState<boolean>(false);
  const [ faceFound, setFaceFound ] = useState<boolean>(false);
  const [ photos, setPhotos ] = useState<Blob[]>([]);

  const processClick = async () => {
    if (displayFeed) {
        if (photos.length < numOfPhotos) {
          const photo = await videoFeedRef.current?.capturePhoto();
          if (!photo) return;
          
          setPhotos([...photos, photo]);
        }
        else {
          let embd = await arcfaceService.buildEmbeddingFromBlobs(photos, modelBytes!);
          let res = await arcfaceService.search(embd);
          console.log(res, embd);
        }
    } else {
      setDisplayFeed(!displayFeed);
    }
  };

  const getButtonText = () => {
    return !displayFeed ? 'Start Camera' : 
      photos.length < numOfPhotos ? 'Take Picture' : 'Get doupleganger';
  };

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
          {getButtonText()}
        </button>
        <PhotosPreview photos={photos}/>
      </div>
    </div>
  );
}
