// Image Storage and Management Utilities
// Handles conversion of images to base64 and storage in localStorage/context

/**
 * Convert image URL to base64 string
 * @param {string} imageUrl - URL of the image to convert
 * @param {string} fallbackType - Fallback MIME type if detection fails
 * @returns {Promise<Object>} Object with base64 data and metadata
 */
export async function urlToBase64(imageUrl, fallbackType = 'image/jpeg') {
  try {
    console.log('Converting URL to base64:', imageUrl);
    
    // Use a proxy to handle CORS issues with Google Maps images
    const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
    
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const blob = await response.blob();
    const mimeType = blob.type || fallbackType;
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result;
        resolve({
          base64,
          mimeType,
          size: blob.size,
          originalUrl: imageUrl,
          convertedAt: new Date().toISOString()
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting URL to base64:', error);
    throw error;
  }
}

/**
 * Convert File object to base64 string
 * @param {File} file - File object to convert
 * @returns {Promise<Object>} Object with base64 data and metadata
 */
export async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        base64: reader.result,
        mimeType: file.type,
        size: file.size,
        name: file.name,
        convertedAt: new Date().toISOString()
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Image storage manager class
 */
export class ImageStorageManager {
  constructor() {
    this.storageKey = 'quakewise_images';
  }

  /**
   * Store Google Street View and satellite images
   * @param {Array} streetViewUrls - Array of Street View image URLs
   * @param {string} satelliteUrl - Satellite image URL
   * @param {Object} location - Location metadata
   * @returns {Promise<Object>} Stored image data
   */
  async storeGoogleImages(streetViewUrls = [], satelliteUrl = null, location = {}) {
    try {
      const imageData = {
        google: {
          streetView: [],
          satellite: null,
          location,
          storedAt: new Date().toISOString()
        }
      };

      // Convert Street View images
      if (streetViewUrls.length > 0) {
        console.log(`Converting ${streetViewUrls.length} Street View images to base64...`);
        const streetViewPromises = streetViewUrls.map(async (urlData, index) => {
          try {
            const base64Data = await urlToBase64(urlData.url || urlData);
            return {
              id: `streetview_${index}`,
              type: 'streetview',
              description: urlData.description || `Street View ${index + 1}`,
              angle: urlData.angle || null,
              ...base64Data
            };
          } catch (error) {
            console.warn(`Failed to convert Street View image ${index}:`, error);
            return null;
          }
        });

        const streetViewResults = await Promise.all(streetViewPromises);
        imageData.google.streetView = streetViewResults.filter(result => result !== null);
      }

      // Convert satellite image
      if (satelliteUrl) {
        console.log('Converting satellite image to base64...');
        try {
          const satelliteBase64 = await urlToBase64(satelliteUrl);
          imageData.google.satellite = {
            id: 'satellite_main',
            type: 'satellite',
            description: 'Satellite View',
            ...satelliteBase64
          };
        } catch (error) {
          console.warn('Failed to convert satellite image:', error);
        }
      }

      // Store in localStorage and return
      this.saveToStorage(imageData);
      return imageData;

    } catch (error) {
      console.error('Error storing Google images:', error);
      throw error;
    }
  }

  /**
   * Store user-uploaded images
   * @param {Array} files - Array of File objects
   * @returns {Promise<Array>} Array of stored image data
   */
  async storeUserImages(files) {
    try {
      const userImages = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`Converting user image ${i + 1}/${files.length} to base64...`);
        
        try {
          const base64Data = await fileToBase64(file);
          userImages.push({
            id: `user_${i}_${Date.now()}`,
            type: 'user_upload',
            description: `User Photo ${i + 1}`,
            ...base64Data
          });
        } catch (error) {
          console.warn(`Failed to convert user image ${i}:`, error);
        }
      }

      // Update storage
      const existingData = this.loadFromStorage();
      existingData.user = userImages;
      existingData.userImagesStoredAt = new Date().toISOString();
      this.saveToStorage(existingData);

      return userImages;

    } catch (error) {
      console.error('Error storing user images:', error);
      throw error;
    }
  }

  /**
   * Get all stored images
   * @returns {Object} All stored image data
   */
  getAllImages() {
    return this.loadFromStorage();
  }

  /**
   * Get images by type
   * @param {string} type - Image type ('streetview', 'satellite', 'user_upload')
   * @returns {Array} Filtered images
   */
  getImagesByType(type) {
    const allImages = this.getAllImages();
    const images = [];

    if (type === 'streetview' && allImages.google?.streetView) {
      images.push(...allImages.google.streetView);
    }
    if (type === 'satellite' && allImages.google?.satellite) {
      images.push(allImages.google.satellite);
    }
    if (type === 'user_upload' && allImages.user) {
      images.push(...allImages.user);
    }

    return images;
  }

  /**
   * Clear all stored images
   */
  clearAllImages() {
    try {
      localStorage.removeItem(this.storageKey);
      console.log('All stored images cleared');
    } catch (error) {
      console.warn('Failed to clear stored images:', error);
    }
  }

  /**
   * Get storage size information
   * @returns {Object} Storage usage info
   */
  getStorageInfo() {
    try {
      const data = localStorage.getItem(this.storageKey);
      const sizeInBytes = data ? data.length : 0;
      const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
      
      return {
        sizeInBytes,
        sizeInMB: `${sizeInMB} MB`,
        itemCount: data ? Object.keys(JSON.parse(data)).length : 0
      };
    } catch (error) {
      console.warn('Failed to get storage info:', error);
      return { sizeInBytes: 0, sizeInMB: '0 MB', itemCount: 0 };
    }
  }

  // Private methods

  /**
   * Load image data from localStorage
   * @returns {Object} Stored image data
   */
  loadFromStorage() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : { google: { streetView: [], satellite: null }, user: [] };
    } catch (error) {
      console.warn('Failed to load images from storage:', error);
      return { google: { streetView: [], satellite: null }, user: [] };
    }
  }

  /**
   * Save image data to localStorage
   * @param {Object} imageData - Image data to save
   */
  saveToStorage(imageData) {
    try {
      const existingData = this.loadFromStorage();
      const mergedData = {
        ...existingData,
        ...imageData
      };
      localStorage.setItem(this.storageKey, JSON.stringify(mergedData));
      console.log('Images saved to storage');
    } catch (error) {
      console.error('Failed to save images to storage:', error);
      // If localStorage is full, try to clear old data
      if (error.name === 'QuotaExceededError') {
        console.warn('Storage quota exceeded. Consider implementing cleanup strategy.');
      }
    }
  }
}

// Export singleton instance
export const imageStorageManager = new ImageStorageManager();

/**
 * Helper function to create image gallery data for components
 * @param {Object} allImages - All stored images
 * @returns {Object} Organized image gallery data
 */
export function createImageGallery(allImages) {
  return {
    categories: {
      google: {
        title: 'Location Images',
        description: 'Satellite and street view images from Google Maps',
        images: [
          ...(allImages.google?.streetView || []),
          ...(allImages.google?.satellite ? [allImages.google.satellite] : [])
        ]
      },
      user: {
        title: 'Your Photos',
        description: 'Photos you uploaded for analysis',
        images: allImages.user || []
      }
    },
    totalImages: (allImages.google?.streetView?.length || 0) + 
                 (allImages.google?.satellite ? 1 : 0) + 
                 (allImages.user?.length || 0),
    storageInfo: imageStorageManager.getStorageInfo()
  };
}