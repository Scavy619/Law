import { useRef } from "react";
import useApp from "../../context/useApp";

const DocumentUpload = ({ onDocumentUploaded }) => {
  const { uploadDocument, uploadingDocument, uploadsRemaining } = useApp();
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const data = await uploadDocument(file);
    if (data && onDocumentUploaded) {
      onDocumentUploaded({
        documentId: data.document._id,
        filename: data.document.filename,
        cloudinaryUrl: data.document.cloudinaryUrl,
        fileType: data.document.fileType,
      });
    }
    e.target.value = ""; // reset input
  };

  return (
    <div className="flex items-center gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt,.jpg,.jpeg,.png,.webp"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploadingDocument || uploadsRemaining === 0}
        title={
          uploadsRemaining === 0
            ? "Daily upload limit reached"
            : `${uploadsRemaining} uploads remaining today`
        }
        className="flex-shrink-0 p-2.5 sm:p-3 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors duration-200"
      >
        {uploadingDocument ? (
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-purple-500"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
        ) : (
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
            />
          </svg>
        )}
      </button>
    </div>
  );
};

export default DocumentUpload;
