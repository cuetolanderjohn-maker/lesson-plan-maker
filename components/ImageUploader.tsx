"use client";

import React, { useRef, useState } from "react";
import { UploadCloud, Camera, X, Image as ImageIcon, ZoomIn } from "lucide-react";
import type { ImageInput } from "@/lib/types";

interface ImageUploaderProps {
  images: ImageInput[];
  onImagesChange: (imgs: ImageInput[]) => void;
  disabled?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onImagesChange,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const compressImage = (file: File): Promise<ImageInput> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const MAX_DIM = 1200;
          let width = img.width;
          let height = img.height;
          if (width > MAX_DIM || height > MAX_DIM) {
            if (width > height) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            } else {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve({
              base64Data: reader.result as string,
              mimeType: file.type || "image/jpeg",
            });
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.78);
          resolve({
            base64Data: compressedBase64,
            mimeType: "image/jpeg",
          });
        };
        img.onerror = () => {
          resolve({
            base64Data: reader.result as string,
            mimeType: file.type || "image/jpeg",
          });
        };
        img.src = e.target?.result as string;
      };
      reader.onerror = () => {
        resolve({
          base64Data: "",
          mimeType: "image/jpeg",
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const processFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newImages = Array.from(files).map((file) => compressImage(file));

    Promise.all(newImages)
      .then((loaded) => {
        const valid = loaded.filter((img) => img.base64Data && img.base64Data.length > 0);
        onImagesChange([...images, ...valid]);
      })
      .catch((err) => {
        console.error("Error compressing image:", err);
      });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    processFiles(e.dataTransfer.files);
  };

  const removeImage = (index: number) => {
    const updated = [...images];
    updated.splice(index, 1);
    onImagesChange(updated);
  };

  return (
    <div className="bg-surface rounded-2xl border border-borderMuted p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Textbook Lesson Photos
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Attach photo(s) of the lesson in the book (story, concepts, or exercises)
          </p>
        </div>
        {images.length > 0 && (
          <span className="text-xs font-medium text-sage-600 bg-sage-50 px-2.5 py-1 rounded-full border border-sage-200">
            {images.length} {images.length === 1 ? "page" : "pages"} attached
          </span>
        )}
      </div>

      {/* Hidden inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => processFiles(e.target.files)}
        disabled={disabled}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => processFiles(e.target.files)}
        disabled={disabled}
      />

      {/* Drop Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2.5 ${
          isDragging
            ? "border-sage-500 bg-sage-50/50"
            : "border-borderMuted hover:border-sage-400 hover:bg-canvas"
        } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
      >
        <div className="w-12 h-12 rounded-full bg-sage-50 flex items-center justify-center text-sage-600 border border-sage-200">
          <UploadCloud className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-700">
            <span className="text-sage-600 font-semibold underline underline-offset-2">
              Click to upload
            </span>{" "}
            or drag and drop textbook photos here
          </p>
          <p className="text-[11px] text-gray-400 mt-1">
            PNG, JPG, HEIC, or WebP up to 15MB each
          </p>
        </div>

        {/* Mobile camera button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              cameraInputRef.current?.click();
            }}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-sage-700 bg-sage-50 border border-sage-200 hover:bg-sage-100 transition-colors"
          >
            <Camera className="w-3.5 h-3.5 text-sage-600" />
            <span>Take Photo with Camera</span>
          </button>
        </div>
      </div>

      {/* Image Thumbnails Carousel */}
      {images.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            Uploaded Lesson Pages
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((img, idx) => (
              <div
                key={idx}
                onClick={() => setPreviewImage(img.base64Data)}
                className="relative group rounded-xl border border-borderMuted overflow-hidden bg-canvas aspect-3/4 flex items-center justify-center shadow-2xs cursor-pointer hover:border-sage-400 transition-all"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.base64Data}
                  alt={`Lesson Page ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                  <span
                    className="p-1.5 rounded-full bg-white/90 text-gray-700 hover:bg-white shadow-sm transition-transform hover:scale-110"
                    title="Zoom in & inspect"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(idx);
                    }}
                    className="p-1.5 rounded-full bg-white/90 text-rose-600 hover:bg-white shadow-sm transition-transform hover:scale-110"
                    title="Remove page"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/60 text-[10px] text-white font-medium backdrop-blur-xs">
                  Page {idx + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox / Full-size Image Inspection Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-surface rounded-2xl overflow-hidden shadow-2xl p-2.5 border border-borderMuted"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 px-2 border-b border-borderMuted mb-2">
              <span className="text-xs font-semibold text-gray-700 flex items-center space-x-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-sage-600" />
                <span>Textbook Photo Inspection (Clarity & Readability Check)</span>
              </span>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-canvas transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-auto max-h-[78vh] flex items-center justify-center rounded-xl bg-canvas">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewImage}
                alt="Full resolution textbook page"
                className="max-h-[78vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
