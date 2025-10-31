import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { PhotoUpload } from './PhotoUpload';
import { PhotoGallery } from './PhotoGallery';
import { PropertyPhoto } from '../../types';
import { photosService } from '../../lib/serviceProxy';
import { toast } from 'sonner';
import { Upload, Images } from 'lucide-react';

interface PhotoManagementProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
  propertyAddress: string;
}

export const PhotoManagement = ({
  open,
  onOpenChange,
  propertyId,
  propertyAddress,
}: PhotoManagementProps) => {
  const [photos, setPhotos] = useState<PropertyPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (open) {
      loadPhotos();
      setSelectedFiles([]);
    }
  }, [open, propertyId]);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      const data = await photosService.getPhotosByPropertyId(propertyId);
      setPhotos(data);
    } catch (error) {
      console.error('Failed to load photos:', error);
      toast.error('Failed to load photos');
    } finally {
      setLoading(false);
    }
  };

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    try {
      setUploading(true);
      setUploadProgress(0);

      const totalFiles = selectedFiles.length;
      let uploadedCount = 0;

      for (const file of selectedFiles) {
        await photosService.uploadPhoto(propertyId, file);
        uploadedCount++;
        setUploadProgress(Math.round((uploadedCount / totalFiles) * 100));
      }

      toast.success(
        `${totalFiles} photo${totalFiles > 1 ? 's' : ''} uploaded successfully`
      );
      setSelectedFiles([]);
      await loadPhotos();
    } catch (error) {
      console.error('Failed to upload photos:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload photos');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Property Photos</DialogTitle>
          <DialogDescription>
            {propertyAddress}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="gallery" className="w-full">
          <TabsList className="w-full justify-start gap-2">
            <TabsTrigger value="gallery" className="flex items-center gap-2">
              <Images className="h-4 w-4" />
              Gallery ({photos.length})
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gallery" className="mt-6 space-y-4">
            <PhotoGallery
              photos={photos}
              onPhotosChange={loadPhotos}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="upload" className="mt-6 space-y-4">
            <PhotoUpload
              onFilesSelected={handleFilesSelected}
              maxFiles={10}
              currentPhotoCount={photos.length}
              uploading={uploading}
            />

            {selectedFiles.length > 0 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-sm text-gray-600">
                  {selectedFiles.length} photo{selectedFiles.length > 1 ? 's' : ''} ready to upload
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedFiles([])}
                    disabled={uploading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleUpload}
                    disabled={uploading}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  >
                    {uploading
                      ? `Uploading... ${uploadProgress}%`
                      : `Upload ${selectedFiles.length} Photo${selectedFiles.length > 1 ? 's' : ''}`}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
