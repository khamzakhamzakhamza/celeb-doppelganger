import './PhotosPreview.scss';

type PhotosPreviewProps = {
  photos: Blob[];
};

export function PhotosPreview({ photos }: PhotosPreviewProps) {
  if (photos.length === 0) return null;

  return (
    <div className="photos-preview">
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
