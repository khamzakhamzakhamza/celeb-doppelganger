import './MirrorFrame.scss';
import { VideoFeed, type VideoFeedHandle } from "./VideoFeed";
import lightbulbLeft from "../assets/lightbulb_left.svg";
import lightbulbLeftLight from "../assets/lightbulb_left_light.svg"
import lightbulbRight from "../assets/lightbulb_right.svg";
import lightbulbRightLight from "../assets/lightbulb_right_light.svg";
import { useRef, useState } from 'react';
import { ArcfaceService, type SearchResult } from '../services/arcfaceService';
import { useArcfaceModel } from '../providers/ArcfaceModelProvider';
import { PhotosPreview } from './PhotosPreview';
import { ResultsModal } from './ResultsModal';

const arcfaceService = new ArcfaceService();

export function MirrorFrame() {
  const numOfPhotos = 4;
  const videoFeedRef = useRef<VideoFeedHandle>(null);
  const { modelBytes } = useArcfaceModel();

  const [ displayFeed, setDisplayFeed ] = useState<boolean>(false);
  const [ loadingFeed, setLoadingFeed ] = useState<boolean>(false);
  const [ faceFound, setFaceFound ] = useState<boolean>(false);
  const [ photos, setPhotos ] = useState<Blob[]>([]);
  const [ results, setResults ] = useState<SearchResult[]>([]);
  const [ displayResults, setDisplayResults ] = useState<boolean>(false);
  const [ processingResults, setProcessingResults ] = useState<boolean>(false);
  const [ selectedResultIndex, setSelectedResultIndex ] = useState<number>(0);

  const processClick = async () => {
    if (displayFeed) {
        if (photos.length < numOfPhotos) {
          const photo = await videoFeedRef.current?.capturePhoto();
          if (!photo) return;
          
          setPhotos([...photos, photo]);
        }
        else {
          setProcessingResults(true);
          try {
            const embd = await arcfaceService.buildEmbeddingFromBlobs(photos, modelBytes!);
            const res = await arcfaceService.search(embd);
            setResults(res);
            setSelectedResultIndex(0);
            setDisplayResults(true);
          } finally {
            setProcessingResults(false);
          }
        }
    } else {
      setDisplayFeed(!displayFeed);
    }
  };

  const getButtonText = () => {
    return processingResults ? 'Finding match...' :
      !displayFeed ? 'Start Camera' : 
      photos.length < numOfPhotos ? 'Take Picture' : 'Get doupleganger';
  };

  const buttonLocked = loadingFeed || processingResults || displayFeed && !faceFound;
  const selectedResult = results[selectedResultIndex];
  const canShowPreviousResult = selectedResultIndex > 0;
  const canShowNextResult = selectedResultIndex < results.length - 1;
  const showPreviousResult = () => setSelectedResultIndex(selectedResultIndex - 1);
  const showNextResult = () => setSelectedResultIndex(selectedResultIndex + 1);
  const deleteLastPhoto = () => setPhotos((photos) => photos.slice(0, -1));
  const goAgain = () => {
    setPhotos([]);
    setResults([]);
    setSelectedResultIndex(0);
    setDisplayResults(false);
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
        <button disabled={buttonLocked}
          className={`mirror-frame__button ${buttonLocked ? 'mirror-frame__button--disabled' : null}`}
          onClick={processClick}>
          {getButtonText()}
        </button>
        <PhotosPreview photos={photos} onDeleteLast={deleteLastPhoto}/>
      </div>
      <ResultsModal
        openModal={displayResults}
        onClose={() => setDisplayResults(false)}
        goAgain={goAgain}
      >
        {selectedResult ? (
          <div className="results-modal__result">
            {canShowPreviousResult && (
              <button
                type="button"
                className="results-modal__nav results-modal__nav--left"
                onClick={showPreviousResult}
                aria-label="Show previous result"
              >
                {"<"}
              </button>
            )}
            <img
              className="results-modal__image"
              src={selectedResult.image_url}
              alt={selectedResult.name}
            />
            <p className="results-modal__name">{selectedResult.name}</p>
            <p className="results-modal__likeness">
              Likeness: {(selectedResult.similarity * 100).toFixed(1)}%
            </p>
            {canShowNextResult && (
              <button
                type="button"
                className="results-modal__nav results-modal__nav--right"
                onClick={showNextResult}
                aria-label="Show next result"
              >
                {">"}
              </button>
            )}
          </div>
        ) : (
          <p>No results found.</p>
        )}
      </ResultsModal>
    </div>
  );
}
