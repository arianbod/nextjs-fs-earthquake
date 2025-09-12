import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Camera,
  Satellite,
  MapPin,
  Eye,
  Building,
  Expand,
  Download,
  Info,
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const ImageGallery = ({ 
  imageGallery, 
  showTitle = true, 
  showDownload = false,
  className = "",
  compact = false 
}) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!imageGallery || imageGallery.totalImages === 0) {
    return (
      <Card className={`border-gray-200 dark:border-gray-700 ${className}`}>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No images available yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Images will appear here after location detection and photo upload
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const allImages = [
    ...imageGallery.categories.google.images,
    ...imageGallery.categories.user.images
  ];

  const getImageIcon = (type) => {
    switch (type) {
      case 'streetview': return <Eye className="h-4 w-4" />;
      case 'satellite': return <Satellite className="h-4 w-4" />;
      case 'user_upload': return <Camera className="h-4 w-4" />;
      default: return <ImageIcon className="h-4 w-4" />;
    }
  };

  const getImageTypeLabel = (type) => {
    switch (type) {
      case 'streetview': return 'Street View';
      case 'satellite': return 'Satellite';
      case 'user_upload': return 'Your Photo';
      default: return 'Image';
    }
  };

  const getImageTypeColor = (type) => {
    switch (type) {
      case 'streetview': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'satellite': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'user_upload': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const openImageModal = (image, index) => {
    setSelectedImage(image);
    setCurrentImageIndex(index);
  };

  const closeModal = () => {
    setSelectedImage(null);
    setCurrentImageIndex(0);
  };

  const navigateImage = (direction) => {
    const newIndex = direction === 'next' 
      ? (currentImageIndex + 1) % allImages.length
      : (currentImageIndex - 1 + allImages.length) % allImages.length;
    
    setCurrentImageIndex(newIndex);
    setSelectedImage(allImages[newIndex]);
  };

  const downloadImage = (image) => {
    if (!image.base64) return;
    
    const link = document.createElement('a');
    link.href = image.base64;
    link.download = `quakewise-${image.type}-${Date.now()}.${image.mimeType?.split('/')[1] || 'jpg'}`;
    link.click();
  };

  return (
    <>
      <Card className={`border-blue-200 dark:border-blue-800 ${className}`}>
        {showTitle && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-blue-600" />
              Image Gallery
              <Badge variant="outline" className="ml-auto">
                {imageGallery.totalImages} image{imageGallery.totalImages !== 1 ? 's' : ''}
              </Badge>
            </CardTitle>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>Google Maps: {imageGallery.categories.google.images.length} images</p>
              <p>Your photos: {imageGallery.categories.user.images.length} images</p>
              <p>Storage: {imageGallery.storageInfo.sizeInMB}</p>
            </div>
          </CardHeader>
        )}

        <CardContent className={showTitle ? "pt-4" : "pt-6"}>
          {/* Google Images Section */}
          {imageGallery.categories.google.images.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {imageGallery.categories.google.title}
                <Badge variant="outline" className="text-xs">
                  {imageGallery.categories.google.images.length}
                </Badge>
              </h4>
              <div className={compact ? "grid grid-cols-4 gap-2" : "grid grid-cols-2 md:grid-cols-3 gap-4"}>
                {imageGallery.categories.google.images.map((image, index) => (
                  <div 
                    key={image.id} 
                    className={`group relative ${compact ? 'aspect-square' : 'aspect-video'} rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer hover:scale-105 transition-transform duration-200`}
                    onClick={() => openImageModal(image, index)}
                  >
                    <img
                      src={image.base64}
                      alt={image.description}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                    <div className="absolute top-2 left-2">
                      <Badge className={`text-xs ${getImageTypeColor(image.type)}`}>
                        {getImageIcon(image.type)}
                        <span className="ml-1">{getImageTypeLabel(image.type)}</span>
                      </Badge>
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          openImageModal(image, index);
                        }}
                      >
                        <Expand className="h-3 w-3" />
                      </Button>
                    </div>
                    {!compact && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                        <p className="text-white text-xs truncate">{image.description}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User Images Section */}
          {imageGallery.categories.user.images.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Building className="h-4 w-4" />
                {imageGallery.categories.user.title}
                <Badge variant="outline" className="text-xs">
                  {imageGallery.categories.user.images.length}
                </Badge>
              </h4>
              <div className={compact ? "grid grid-cols-4 gap-2" : "grid grid-cols-2 md:grid-cols-3 gap-4"}>
                {imageGallery.categories.user.images.map((image, index) => {
                  const userImageIndex = index + imageGallery.categories.google.images.length;
                  return (
                    <div 
                      key={image.id}
                      className={`group relative ${compact ? 'aspect-square' : 'aspect-video'} rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer hover:scale-105 transition-transform duration-200`}
                      onClick={() => openImageModal(image, userImageIndex)}
                    >
                      <img
                        src={image.base64}
                        alt={image.description}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                      <div className="absolute top-2 left-2">
                        <Badge className={`text-xs ${getImageTypeColor(image.type)}`}>
                          {getImageIcon(image.type)}
                          <span className="ml-1">{getImageTypeLabel(image.type)}</span>
                        </Badge>
                      </div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            openImageModal(image, userImageIndex);
                          }}
                        >
                          <Expand className="h-3 w-3" />
                        </Button>
                      </div>
                      {!compact && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                          <p className="text-white text-xs truncate">{image.description}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            {/* Close button */}
            <Button
              variant="secondary"
              size="sm"
              className="absolute -top-12 right-0 z-10"
              onClick={closeModal}
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Navigation */}
            {allImages.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10"
                  onClick={() => navigateImage('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10"
                  onClick={() => navigateImage('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Image */}
            <div className="relative bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
              <img
                src={selectedImage.base64}
                alt={selectedImage.description}
                className="w-full h-full object-contain max-h-[70vh]"
              />
              
              {/* Image info */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getImageTypeColor(selectedImage.type)}>
                        {getImageIcon(selectedImage.type)}
                        <span className="ml-1">{getImageTypeLabel(selectedImage.type)}</span>
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {currentImageIndex + 1} of {allImages.length}
                      </span>
                    </div>
                    <h3 className="font-medium">{selectedImage.description}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Size: {(selectedImage.size / 1024).toFixed(1)} KB
                      {selectedImage.convertedAt && (
                        <> • Captured: {new Date(selectedImage.convertedAt).toLocaleDateString()}</>
                      )}
                    </p>
                  </div>
                  {showDownload && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadImage(selectedImage)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGallery;