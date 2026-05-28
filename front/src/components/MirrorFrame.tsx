import { VideoFeed } from "./VideoFeed";
import lightbulbLeft from "../assets/lightbulb_left.svg";
import lightbulbRight from "../assets/lightbulb_right.svg";
import './MirrorFrame.scss';

export function MirrorFrame() {
  return (
    <div className="mirror-frame">
      {[24, 50, 76].map((topPercent) => (
        <img
          key={`left-${topPercent}`}
          src={lightbulbLeft}
          alt=""
          aria-hidden
          className="mirror-frame__lightbulb mirror-frame__lightbulb--left"
          style={{
            top: `${topPercent}%`,
          }}
        />
      ))}
      {[24, 50, 76].map((topPercent) => (
        <img
          key={`right-${topPercent}`}
          src={lightbulbRight}
          alt=""
          aria-hidden
          className="mirror-frame__lightbulb mirror-frame__lightbulb--right"
          style={{
            top: `${topPercent}%`,
          }}
        />
      ))}
      <div className="mirror-frame__video">
        <VideoFeed />
      </div>
    </div>
  );
}
