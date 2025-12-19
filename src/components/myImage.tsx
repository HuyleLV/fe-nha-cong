"use client";

import Image, { StaticImageData, ImageProps } from "next/image";
import { useState } from "react";
import defaultImage from "@/assets/default-image.jpg";

type MyImageProps = Omit<ImageProps, "src"> & {
  src?: string | StaticImageData | null;
  alt?: string;
  className?: string;
  priority?: boolean;
};

export default function MyImage({
  src,
  alt,
  className = "",
  priority = false,
  sizes,
  ...props
}: MyImageProps) {
  const [imgSrc, setImgSrc] = useState<string | StaticImageData>(src || defaultImage);
  const [loaded, setLoaded] = useState(false);

  const isExternal = typeof imgSrc === "string" && /^(https?:)?\/\//i.test(imgSrc as string);

    return (
      // ensure the root fills any parent container so `Image` with `fill` can size itself
      <div className={`relative w-full h-full ${className}`}>
      {isExternal ? (
        // Render a normal <img> for external URLs (like Google user avatars).
        // This avoids Next/Image remote loader restrictions and ensures the link displays.
        <img
          src={imgSrc as string}
          alt={alt || "Nhà cộng"}
          loading={priority ? "eager" : "lazy"}
          className={`absolute inset-0 h-full w-full object-cover rounded-md transition-opacity duration-200 ease-in-out ${loaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setLoaded(true)}
          onError={(e) => {
            try {
              const t = e.currentTarget as HTMLImageElement;
              // if defaultImage is an object, use its src field
              // @ts-ignore
              t.src = defaultImage?.src || defaultImage;
            } catch {
              // ignore
            }
          }}
        />
      ) : (
        <Image
          {...props}
          src={imgSrc}
          alt={alt || "Nhà cộng"}
          fill
          priority={priority}
          sizes={
            sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 272px"
          }
          loading={priority ? "eager" : "lazy"}
          className={`object-cover rounded-md transition-opacity duration-200 ease-in-out ${loaded ? "opacity-100" : "opacity-0"}`}
          onLoadingComplete={() => setLoaded(true)}
          onError={() => setImgSrc(defaultImage)}
        />
      )}
    </div>
  );
}
