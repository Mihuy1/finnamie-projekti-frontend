import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

const mapPreselectedToFiles = (preselectedImages = []) =>
  preselectedImages.map((image, index) => ({
    id: `existing-${index}`,
    preview: image,
    isObjectUrl: false,
  }));

export const MultiImageUpload = ({ preselectedImages = [] }) => {
  const [files, setFiles] = useState([]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    onDrop: (acceptedFiles) => {
      setFiles((prev) => [
        ...prev,
        ...acceptedFiles.map((file, index) =>
          Object.assign(file, {
            id: `new-${file.name}-${file.lastModified}-${index}`,
            preview: URL.createObjectURL(file),
            isObjectUrl: true,
          }),
        ),
      ]);
    },
  });

  useEffect(() => {
    setFiles(mapPreselectedToFiles(preselectedImages));
  }, [preselectedImages]);

  useEffect(() => {
    return () =>
      files.forEach((file) => {
        if (file.isObjectUrl) {
          URL.revokeObjectURL(file.preview);
        }
      });
  }, [files]);

  return (
    <section className="multi-image-upload">
      <div
        {...getRootProps({
          className: `dropzone-box${isDragActive ? " is-drag-active" : ""}`,
        })}
      >
        <input {...getInputProps()} />
        <p className="dropzone-title">
          {isDragActive ? "Drop images here" : "Drag & drop images here"}
        </p>
        <p className="dropzone-subtitle">or click to browse files</p>
      </div>

      <div className="preview-grid">
        {files.map((file, index) => (
          <div key={file.id || index} className="preview-item">
            <img src={file.preview} alt="preview" />
            <button
              type="button"
              className="preview-remove-btn"
              onClick={() =>
                setFiles((prev) => prev.filter((_, i) => i !== index))
              }
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};
