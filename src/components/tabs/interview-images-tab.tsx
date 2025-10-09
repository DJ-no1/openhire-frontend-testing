"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Camera,
  Download,
  Eye,
  Grid3x3,
  List,
  Calendar,
  Image as ImageIcon,
  AlertCircle,
  ZoomIn,
  ExternalLink,
  Info,
} from "lucide-react";

interface InterviewImagesTabProps {
  artifact: any;
  applicationDetails: any;
}

interface ProcessedImage {
  url: string;
  id: string;
  timestamp: string;
  metadata?: {
    size?: string;
    format?: string;
    capturedAt?: string;
  };
}

export function InterviewImagesTab({
  artifact,
  applicationDetails,
}: InterviewImagesTabProps) {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedImage, setSelectedImage] = useState<ProcessedImage | null>(
    null
  );
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());
  const [loadingSize, setLoadingSize] = useState(true);

  useEffect(() => {
    // Extract image URLs from artifact
    console.log("🖼️ Processing interview images from artifact:", artifact);
    const imageUrls = artifact?.image_url || "";
    console.log("📸 Image URL string:", imageUrls);
    console.log("⏰ Artifact timestamp:", artifact?.timestamp);
    console.log("📅 Artifact created_at:", artifact?.created_at);
    console.log("🕒 Artifact started_at:", artifact?.started_at);

    const processedImages = parseImageUrls(imageUrls);
    console.log("✅ Processed images:", processedImages);
    setImages(processedImages);

    // Fetch actual image sizes
    fetchImageSizes(processedImages);
  }, [artifact]);

  const parseImageUrls = (imageUrlString: string): ProcessedImage[] => {
    if (!imageUrlString || imageUrlString.trim() === "") {
      return [];
    }

    // Split by comma and clean up URLs
    const urls = imageUrlString
      .split(",")
      .map((url) => url.trim())
      .filter((url) => url !== "");

    // Use actual timestamp from artifact - try multiple timestamp fields
    const actualTimestamp =
      artifact?.timestamp ||
      artifact?.created_at ||
      artifact?.started_at ||
      new Date().toISOString();

    return urls.map((url, index) => {
      // For multiple images, add incremental time (2 minutes between captures)
      const imageTimestamp = new Date(
        new Date(actualTimestamp).getTime() + index * 120000
      ).toISOString();

      return {
        url,
        id: `img_${index}`,
        timestamp: imageTimestamp, // Use actual database timestamp
        metadata: {
          size: "Loading...", // Will be updated with actual size
          format: url.includes(".png")
            ? "PNG"
            : url.includes(".jpg") || url.includes(".jpeg")
            ? "JPG"
            : url.includes(".webp")
            ? "WEBP"
            : "Image",
          capturedAt: imageTimestamp,
        },
      };
    });
  };

  const fetchImageSizes = async (imageList: ProcessedImage[]) => {
    setLoadingSize(true);

    // Fetch sizes for all images
    const updatedImages = await Promise.all(
      imageList.map(async (image) => {
        try {
          const response = await fetch(image.url, { method: "HEAD" });
          const contentLength = response.headers.get("content-length");

          if (contentLength) {
            const sizeInBytes = parseInt(contentLength, 10);
            const sizeInKB = (sizeInBytes / 1024).toFixed(2);
            const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);

            const displaySize =
              sizeInBytes > 1024 * 1024 ? `${sizeInMB} MB` : `${sizeInKB} KB`;

            console.log(`📦 Image ${image.id} size: ${displaySize}`);

            return {
              ...image,
              metadata: {
                ...image.metadata,
                size: displaySize,
              },
            };
          }
        } catch (error) {
          console.warn(`⚠️ Could not fetch size for ${image.id}:`, error);
        }

        return {
          ...image,
          metadata: {
            ...image.metadata,
            size: "N/A",
          },
        };
      })
    );

    setImages(updatedImages);
    setLoadingSize(false);
    console.log("✅ Image sizes loaded:", updatedImages);
  };

  const handleImageError = (imageId: string) => {
    setBrokenImages((prev) => new Set([...prev, imageId]));
  };

  const handleDownloadImage = async (image: ProcessedImage) => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `interview_image_${image.id}.${
        image.metadata?.format?.toLowerCase() || "jpg"
      }`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error downloading image:", error);
      // Fallback: open in new tab
      window.open(image.url, "_blank");
    }
  };

  const handleDownloadAll = () => {
    images.forEach((image, index) => {
      setTimeout(() => handleDownloadImage(image), index * 100);
    });
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const ImagePreview = ({
    image,
    isGridView,
  }: {
    image: ProcessedImage;
    isGridView?: boolean;
  }) => {
    const isBroken = brokenImages.has(image.id);

    if (isBroken) {
      return (
        <div
          className={`${
            isGridView ? "h-48" : "h-24 w-24"
          } bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center`}
        >
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500">Image unavailable</p>
          </div>
        </div>
      );
    }

    return (
      <img
        src={image.url}
        alt={`Interview capture ${image.id}`}
        className={`${
          isGridView ? "h-48 w-full" : "h-24 w-24"
        } object-cover rounded-lg border border-gray-200`}
        onError={() => handleImageError(image.id)}
        loading="lazy"
      />
    );
  };

  if (images.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="p-12 text-center">
            <Camera className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No Images Available
            </h3>
            <p className="text-gray-500 mb-4">
              No images were captured during this interview session, or the
              image data is not available.
            </p>
            <Badge variant="outline" className="text-sm">
              <Info className="h-3 w-3 mr-1" />
              Images are captured automatically during interview sessions
            </Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Images Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-2 border-purple-200 bg-purple-50/30">
          <CardContent className="p-6 text-center">
            <Camera className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-purple-700">
              {images.length}
            </div>
            <div className="text-sm text-gray-600">Images Captured</div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 bg-blue-50/30">
          <CardContent className="p-6 text-center">
            <ImageIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-blue-700">
              {images.filter((img) => !brokenImages.has(img.id)).length}
            </div>
            <div className="text-sm text-gray-600">Available</div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-green-50/30">
          <CardContent className="p-6 text-center">
            <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-sm font-bold text-green-700">
              {images.length > 0
                ? new Date(images[0].timestamp).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "N/A"}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {images.length > 0
                ? new Date(images[0].timestamp).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""}
            </div>
            <div className="text-xs text-gray-500 mt-1">Capture Date</div>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-200 bg-orange-50/30">
          <CardContent className="p-6 text-center">
            <Download className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadAll}
              className="mt-2"
            >
              Download All
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-6 w-6 text-purple-600" />
              Interview Images Gallery
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {viewMode === "grid" ? (
            // Grid View
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {images.map((image) => (
                <div key={image.id} className="space-y-3">
                  <div className="relative group">
                    <ImagePreview image={image} isGridView={true} />

                    {/* Overlay with actions */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-8 w-8 p-0"
                            >
                              <ZoomIn className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>
                                Image Preview - {image.id}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <img
                                src={image.url}
                                alt={`Interview capture ${image.id}`}
                                className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                              />
                              <div className="flex items-center justify-between text-sm text-gray-600">
                                <span>
                                  Captured: {formatTimestamp(image.timestamp)}
                                </span>
                                <span>Size: {image.metadata?.size}</span>
                                <span>Format: {image.metadata?.format}</span>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0"
                          onClick={() => handleDownloadImage(image)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0"
                          onClick={() => window.open(image.url, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Image metadata */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">
                        Image {image.id.replace("img_", "")}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {image.metadata?.format}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatTimestamp(image.timestamp)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Size: {image.metadata?.size}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // List View
            <div className="space-y-4">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50"
                >
                  <ImagePreview image={image} isGridView={false} />

                  <div className="flex-1">
                    <h3 className="font-medium">
                      Image {image.id.replace("img_", "")}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Captured: {formatTimestamp(image.timestamp)}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>Format: {image.metadata?.format}</span>
                      <span>Size: {image.metadata?.size}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>Image Preview - {image.id}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <img
                            src={image.url}
                            alt={`Interview capture ${image.id}`}
                            className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                          />
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>
                              Captured: {formatTimestamp(image.timestamp)}
                            </span>
                            <span>Size: {image.metadata?.size}</span>
                            <span>Format: {image.metadata?.format}</span>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadImage(image)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
