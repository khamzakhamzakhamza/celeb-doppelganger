import './PhotosPreview.scss';

type PhotosPreviewProps = {
  photos: Blob[];
  onDeleteLast: () => void;
};

export function PhotosPreview({ photos, onDeleteLast }: PhotosPreviewProps) {
  if (photos.length === 0) return null;

  return (
    <div className="photos-preview">
      <button
        type="button"
        className="photos-preview__delete"
        onClick={onDeleteLast}
        aria-label="Delete last photo"
      >
        x
      </button>
      {photos.map((photo, index) => (
        <img
          className="photos-preview__photo"
          key={index}
          src={URL.createObjectURL(photo)}
          alt={`Captured photo ${index + 1}`}
        />
      ))}
    </div>
  );
}
