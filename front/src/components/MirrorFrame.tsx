import { VideoFeed } from "./VideoFeed";
import lightbulbLeft from "../assets/lightbulb_left.svg";
import lightbulbRight from "../assets/lightbulb_right.svg";
import silhouette from  "../assets/silhouette.svg";
import './MirrorFrame.scss';

export function MirrorFrame() {
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
        <img
          className="mirror-frame__silhouette"
          key='silhouette'
          src={silhouette}
        />
        <VideoFeed/>
      </div>
    </div>
  );
}
