'use client';

import React, { useState, useRef } from 'react';
import { useAdmin } from '@/lib/store';
import { uploadImageFile, CURATED_PRODUCT_PRESETS } from '@/lib/storage';
import { 
  UploadCloud, 
  Image as ImageIcon, 
  Trash2, 
  Star, 
  Loader2, 
  Sparkles, 
  Link as LinkIcon, 
  Plus, 
  Check 
} from 'lucide-react';

interface ImageUploadDropzoneProps {
  images: string[];
  primaryImage: string;
  onImagesChange: (images: string[]) => void;
  onPrimaryImageChange: (primary: string) => void;
  bucket?: string;
  maxFiles?: number;
}

export function ImageUploadDropzone({
  images,
  primaryImage,
  onImagesChange,
  onPrimaryImageChange,
  bucket = 'product-images',
  maxFiles = 6,
}: ImageUploadDropzoneProps) {
  const { t, language } = useAdmin();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [manualUrl, setManualUrl] = useState('');

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = files.map(file => uploadImageFile(file, bucket));
      const uploadedUrls = await Promise.all(uploadPromises);

      const nextImages = [...images, ...uploadedUrls].slice(0, maxFiles);
      onImagesChange(nextImages);

      // If no primary image set or it was default, set the first uploaded one
      if (!primaryImage || images.length === 0) {
        onPrimaryImageChange(uploadedUrls[0]);
      }
    } catch (err) {
      console.error('Failed to process image uploads:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const removedUrl = images[indexToRemove];
    const nextImages = images.filter((_, idx) => idx !== indexToRemove);
    onImagesChange(nextImages);

    // If removed image was the primary, select the next available or empty
    if (primaryImage === removedUrl) {
      onPrimaryImageChange(nextImages[0] || '');
    }
  };

  const handleAddManualUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUrl.trim()) return;
    const url = manualUrl.trim();
    const nextImages = [...images, url].slice(0, maxFiles);
    onImagesChange(nextImages);
    if (!primaryImage || images.length === 0) {
      onPrimaryImageChange(url);
    }
    setManualUrl('');
    setShowUrlInput(false);
  };

  const handleSelectPreset = (presetImages: string[]) => {
    onImagesChange(presetImages);
    onPrimaryImageChange(presetImages[0] || '');
    setShowPresets(false);
  };

  return (
    <div className="space-y-3">
      {/* Upload Drop Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-[#657A52] bg-[#657A52]/10 scale-[1.005]'
            : 'border-[#EAE7DF] bg-[#FAF9F6] hover:border-[#F4B942] hover:bg-white'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2 py-3 text-[#657A52]">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="text-xs font-bold">{t.uploadingImage}</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F4B942]/15 text-[#171717] shadow-xs">
              <UploadCloud className="h-6 w-6 text-[#171717]" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#171717]">
                {t.dragDropImages}
              </p>
              <p className="mt-0.5 text-[11px] text-[#737373]">
                {t.clickToUpload} (JPG, PNG, WebP)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Gallery of Uploaded Images */}
      {images.length > 0 && (
        <div>
          <div className="flex items-center justify-between pb-1.5">
            <span className="text-[11px] font-bold text-[#737373]">
              {language === 'ku' ? `وێنە بارکراوەکان (${images.length}/${maxFiles})` : language === 'ar' ? `الصور المرفوعة (${images.length}/${maxFiles})` : `Uploaded Photos (${images.length}/${maxFiles})`}
            </span>
            <span className="text-[10px] text-[#737373]">
              {language === 'ku' ? 'کلیک لە ئەستێرەکە بکە بۆ وێنەی سەرەکی' : language === 'ar' ? 'انقر على النجمة لتعيين الصورة الرئيسية' : 'Click star to set primary'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
            {images.map((imgUrl, index) => {
              const isPrimary = primaryImage === imgUrl || (!primaryImage && index === 0);
              return (
                <div
                  key={`${imgUrl}-${index}`}
                  className={`group relative aspect-square overflow-hidden rounded-xl border-2 bg-white shadow-xs transition-all ${
                    isPrimary ? 'border-[#657A52] ring-2 ring-[#657A52]/20' : 'border-[#EAE7DF] hover:border-[#F4B942]'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`Product ${index + 1}`}
                    className="h-full w-full object-cover"
                  />

                  {/* Primary Badge */}
                  {isPrimary && (
                    <div className="absolute top-1.5 start-1.5 flex items-center gap-0.5 rounded-md bg-[#657A52] px-1.5 py-0.5 text-[9px] font-extrabold text-white shadow-xs">
                      <Star className="h-2.5 w-2.5 fill-current" />
                      <span>{t.primaryImageBadge}</span>
                    </div>
                  )}

                  {/* Action Overlays */}
                  <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 backdrop-blur-2xs">
                    {!isPrimary && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPrimaryImageChange(imgUrl);
                        }}
                        title={t.setAsPrimary}
                        className="rounded-lg bg-white p-1 text-[#657A52] hover:bg-[#657A52] hover:text-white transition-colors"
                      >
                        <Star className="h-3.5 w-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(index);
                      }}
                      title={t.removeImage}
                      className="rounded-lg bg-white p-1 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Add More Button if under max */}
            {images.length < maxFiles && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#EAE7DF] bg-[#FAF9F6] text-[#737373] hover:border-[#657A52] hover:text-[#657A52] transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span className="mt-1 text-[10px] font-bold">
                  {language === 'ku' ? 'زیادکردن' : language === 'ar' ? 'إضافة' : 'Add'}
                </span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Alternative Options: Presets & URL link toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#EAE7DF]/70 pt-2 text-[11px]">
        <button
          type="button"
          onClick={() => setShowPresets(!showPresets)}
          className="flex items-center gap-1 font-semibold text-[#657A52] hover:underline"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>{t.presetImagesLabel}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="flex items-center gap-1 font-medium text-[#737373] hover:text-[#171717]"
        >
          <LinkIcon className="h-3.5 w-3.5" />
          <span>{t.pasteUrlInstead}</span>
        </button>
      </div>

      {/* Curated Presets Accordion */}
      {showPresets && (
        <div className="rounded-xl border border-[#EAE7DF] bg-white p-3 shadow-xs">
          <p className="text-[10px] font-bold text-[#737373] mb-2">
            {language === 'ku' ? 'هەڵبژاردنی وێنەی ئامادەکراو بۆ تاقیکردنەوە:' : 'Select curated preset photos for test:'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {CURATED_PRODUCT_PRESETS.map((preset) => (
              <button
                key={preset.category}
                type="button"
                onClick={() => handleSelectPreset(preset.images)}
                className="flex items-center gap-2 rounded-lg border border-[#EAE7DF] p-1.5 text-start hover:border-[#F4B942] hover:bg-[#FAF9F6] transition-colors"
              >
                <img
                  src={preset.url}
                  alt={preset.label_en}
                  className="h-9 w-9 rounded-md object-cover border border-[#EAE7DF]"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold text-[#171717] truncate">
                    {language === 'ku' ? preset.label_ku : language === 'ar' ? preset.label_ar : preset.label_en}
                  </p>
                  <p className="text-[9px] text-[#737373]">
                    {preset.images.length} {language === 'ku' ? 'وێنە' : 'photos'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Optional URL Input */}
      {showUrlInput && (
        <form onSubmit={handleAddManualUrl} className="flex gap-2">
          <input
            type="url"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder={t.imageUrlPlaceholder}
            className="flex-1 rounded-xl border border-[#EAE7DF] bg-white p-2 text-xs text-[#171717] focus:border-[#F4B942] focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-xl bg-[#171717] px-3 py-2 text-xs font-bold text-white hover:bg-[#333]"
          >
            {language === 'ku' ? 'زیادکردن' : language === 'ar' ? 'إضافة' : 'Add'}
          </button>
        </form>
      )}
    </div>
  );
}
