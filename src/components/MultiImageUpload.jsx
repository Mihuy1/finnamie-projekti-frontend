import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

export const MultiImageUpload = () => {
  const [files, setFiles] = useState([]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    onDrop: (acceptedFiles) => {
      setFiles((prev) => [
        ...prev,
        ...acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          }),
        ),
      ]);
    },
  });

  useEffect(() => {
    return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
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
          <div key={index} className="preview-item">
            <img src={file.preview} alt="preview" />
            <button
              className="preview-remove-btn"
              onClick={() => setFiles(files.filter((_, i) => i !== index))}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};
