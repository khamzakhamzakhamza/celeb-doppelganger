import './MirrorFrame.scss';
import { VideoFeed } from "./VideoFeed";
import lightbulbLeft from "../assets/lightbulb_left.svg";
import lightbulbRight from "../assets/lightbulb_right.svg";
import { useState } from 'react';

export function MirrorFrame() {
  const [ displayFeed, setDisplayFeed ] = useState<boolean>(false);
  const [ loadingFeed, setLoadingFeed ] = useState<boolean>(false);

  return (
    <div className="mirror-frame">
      {[3, 20, 37, 54, 73].map((topPercent) => (
        <img
          className="mirror-frame__lightbulb mirror-frame__lightbulb--left"
          key={`left-${topPercent}`}
          src={lightbulbLeft}
          style={{
            top: `${topPercent}%`,
          }}
        />
      ))}
      {[3, 20, 37, 54, 73].map((topPercent) => (
        <img
          className="mirror-frame__lightbulb mirror-frame__lightbulb--right"
          key={`right-${topPercent}`}
          src={lightbulbRight}
          style={{
            top: `${topPercent}%`,
          }}
        />
      ))}
      <div className="mirror-frame__video">
        <VideoFeed 
          displayFeed={displayFeed} 
          feedStartedLoading={() => setLoadingFeed(true)}
          feedFinishedLoading={() => setLoadingFeed(false)}/>
      </div>
      <div className='mirror-frame__controls'>
        <button disabled={loadingFeed}
          className={`mirror-frame__button ${loadingFeed ? 'mirror-frame__button--disabled' : null}`}
          onClick={()=> setDisplayFeed(!displayFeed)}>
          Start Camera
        </button>
      </div>
    </div>
  );
}
