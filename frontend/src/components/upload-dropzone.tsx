import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/components/ui/shadcn-io/dropzone';

interface UploadDropzoneProps {
    onDrop: (acceptedFiles: File[]) => Promise<void>;
    previewUrl?: string | null;
    maxFiles?: number;
    maxSize?: number;
    minSize?: number;
    classname?: string;
}

export function UploadDropzone({ onDrop, previewUrl, maxFiles, maxSize, minSize, classname }: UploadDropzoneProps) {
    return (
        <Dropzone
            accept={{ 'image/jpeg': [], 'image/png': [] }}
            maxFiles={maxFiles || 1}
            maxSize={maxSize || 5 * 1024 * 1024}
            minSize={minSize || 0}
            onDrop={onDrop}
            onError={console.error}
            className={classname}
        >
            {previewUrl ? (
                <div>
                    <img src={previewUrl} alt="Preview" className="max-h-40 rounded-md" />
                </div>
            ) : (
                <>
                    <DropzoneEmptyState />
                    <DropzoneContent />
                </>
            )}
        </Dropzone>
    );
}