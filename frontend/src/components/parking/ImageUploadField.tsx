import { useRef } from "react";
import { ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_IMAGES = 5;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // matches the backend's multer limit

interface ImageUploadFieldProps {
  files: File[];
  onChange: (files: File[]) => void;
  error?: string;
}

export function ImageUploadField({ files, onChange, error }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFilesSelected(selected: FileList | null) {
    if (!selected) return;

    const incoming = Array.from(selected);
    const accepted: File[] = [];
    const rejections: string[] = [];

    for (const file of incoming) {
      if (!file.type.startsWith("image/")) {
        rejections.push(`${file.name}: not an image`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        rejections.push(`${file.name}: over 5MB`);
        continue;
      }
      accepted.push(file);
    }

    const combined = [...files, ...accepted].slice(0, MAX_IMAGES);
    onChange(combined);

    if (rejections.length > 0) {
      // Kept simple and inline rather than a toast system that doesn't exist yet.
      // eslint-disable-next-line no-alert
      alert(`Some files couldn't be added:\n${rejections.join("\n")}`);
    }

    if (inputRef.current) inputRef.current.value = "";
  }

  function removeAt(index: number) {
    onChange(files.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {files.map((file, index) => (
          <div key={`${file.name}-${index}`} className="group relative aspect-square overflow-hidden rounded-lg border border-border">
            <img src={URL.createObjectURL(file)} alt={file.name} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeAt(index)}
              className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
              aria-label={`Remove ${file.name}`}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {files.length < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed text-muted-foreground transition-colors hover:bg-secondary",
              error ? "border-destructive" : "border-border"
            )}
          >
            <ImagePlus className="h-5 w-5" />
            <span className="text-[11px]">Add photo</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFilesSelected(e.target.files)}
      />

      <p className="mt-2 text-xs text-muted-foreground">
        {files.length}/{MAX_IMAGES} photos · up to 5MB each
      </p>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
