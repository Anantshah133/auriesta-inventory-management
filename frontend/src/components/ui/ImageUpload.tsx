import React, { useRef, useState, useCallback } from 'react';
import { Upload, X, ImageIcon, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface ImageUploadProps {
  label?: string;
  value?: File | null;
  previewUrl?: string | null;
  onChange: (file: File | null) => void;
  error?: string;
  maxSizeMB?: number;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ACCEPTED_EXT = '.jpg, .jpeg, .png, .webp';

export const ImageUpload: React.FC<ImageUploadProps> = ({
  label = 'Product Image',
  value,
  previewUrl,
  onChange,
  error,
  maxSizeMB = 5,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(previewUrl ?? null);

  const validateAndSet = useCallback(
    (file: File) => {
      setLocalError(null);
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setLocalError('Only JPG, PNG, or WebP images are allowed.');
        return;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        setLocalError(`Image must be smaller than ${maxSizeMB}MB.`);
        return;
      }
      const objectUrl = URL.createObjectURL(file);
      setLocalPreview(objectUrl);
      onChange(file);
    },
    [maxSizeMB, onChange]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSet(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSet(file);
  };

  const handleRemove = () => {
    if (localPreview && localPreview.startsWith('blob:')) {
      URL.revokeObjectURL(localPreview);
    }
    setLocalPreview(null);
    setLocalError(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const displayError = error || localError;
  const hasImage = localPreview || (previewUrl && !value);

  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}

      {hasImage ? (
        /* Preview */
        <div className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
          <img
            src={localPreview || previewUrl || ''}
            alt="Product preview"
            className="w-full h-48 object-contain p-2"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={handleRemove}
              className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              <X className="w-4 h-4" />
              Remove Image
            </button>
          </div>
          <div className="px-3 py-2 border-t border-gray-100 bg-white flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-xs text-gray-500 truncate">
              {value?.name || 'Existing image'}
            </span>
            <span className="ml-auto text-xs text-gray-400">
              {value ? `${(value.size / 1024).toFixed(0)} KB` : ''}
            </span>
          </div>
        </div>
      ) : (
        /* Dropzone */
        <div
          className={clsx(
            'image-dropzone',
            isDragging && 'image-dropzone-active',
            displayError && 'border-red-400'
          )}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <Upload className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                Click to upload or drag & drop
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {ACCEPTED_EXT} · Max {maxSizeMB}MB
              </p>
            </div>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        className="hidden"
        onChange={handleFileChange}
        id="image-upload-input"
      />

      {displayError && (
        <p className="form-error">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {displayError}
        </p>
      )}
    </div>
  );
};
