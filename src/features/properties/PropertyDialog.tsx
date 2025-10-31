import { useEffect, useState } from 'react';
import { COLORS } from '@/config/colors';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Property, PropertyOwner, PropertyPhoto } from '../../types';
import { ownersService } from '../../lib/serviceProxy';
import { photosService } from '../../lib/serviceProxy';
import { PhotoManagement } from '../../components/properties/PhotoManagement';
import { PhotoGallery } from '../../components/properties/PhotoGallery';
import { Images } from 'lucide-react';

const propertySchema = z.object({
  owner_id: z.string().min(1, 'Owner is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().optional(),
  district: z.string().optional(),
  status: z.enum(['Empty', 'Occupied', 'Inactive']),
  notes: z.string().optional(),
});

type PropertyFormData = z.infer<typeof propertySchema>;

interface PropertyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: Property | null;
  onSubmit: (data: PropertyFormData) => Promise<void>;
  loading?: boolean;
}

export const PropertyDialog = ({
  open,
  onOpenChange,
  property,
  onSubmit,
  loading = false,
}: PropertyDialogProps) => {
  const [owners, setOwners] = useState<PropertyOwner[]>([]);
  const [loadingOwners, setLoadingOwners] = useState(false);
  const [photoManagementOpen, setPhotoManagementOpen] = useState(false);
  const [photos, setPhotos] = useState<PropertyPhoto[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      status: 'Empty',
    },
  });

  const selectedStatus = watch('status');
  const selectedOwnerId = watch('owner_id');

  useEffect(() => {
    if (open) {
      const initForm = async () => {
        await loadOwners();
        if (property) {
          loadPhotos();
          reset({
            owner_id: property.owner_id || '',
            address: property.address || '',
            city: property.city || '',
            district: property.district || '',
            status: property.status as 'Empty' | 'Occupied' | 'Inactive',
            notes: property.notes || '',
          });
        } else {
          setPhotos([]);
          reset({
            owner_id: '',
            address: '',
            city: '',
            district: '',
            status: 'Empty',
            notes: '',
          });
        }
      };
      initForm();
    } else {
      setPhotoManagementOpen(false);
    }
  }, [open, property, reset]);

  const loadOwners = async () => {
    try {
      setLoadingOwners(true);
      const data = await ownersService.getAll();
      setOwners(data);
    } catch (error) {
      console.error('Failed to load owners:', error);
    } finally {
      setLoadingOwners(false);
    }
  };

  const loadPhotos = async () => {
    if (!property) return;
    try {
      setLoadingPhotos(true);
      const data = await photosService.getPhotosByPropertyId(property.id);
      setPhotos(data);
    } catch (error) {
      console.error('Failed to load photos:', error);
    } finally {
      setLoadingPhotos(false);
    }
  };

  const handleFormSubmit = async (data: PropertyFormData) => {
    const cleanedData = {
      ...data,
      city: data.city?.trim() || undefined,
      district: data.district?.trim() || undefined,
      notes: data.notes?.trim() || undefined,
    };
    await onSubmit(cleanedData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{property ? 'Property Details' : 'Add New Property'}</DialogTitle>
          <DialogDescription>
            {property
              ? 'View and manage property information and photos.'
              : 'Fill in the property details below.'}
          </DialogDescription>
        </DialogHeader>

        {property && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className={`text-sm font-semibold ${COLORS.gray.text900}`}>Property Photos</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPhotoManagementOpen(true)}
                disabled={loading}
              >
                <Images className="h-4 w-4 mr-2" />
                Manage Photos
              </Button>
            </div>
            <PhotoGallery
              photos={photos}
              onPhotosChange={loadPhotos}
              loading={loadingPhotos}
            />
          </div>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="owner_id">Property Owner *</Label>
            <Select
              value={selectedOwnerId || ''}
              onValueChange={(value) => setValue('owner_id', value)}
              disabled={loadingOwners || loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an owner" />
              </SelectTrigger>
              <SelectContent>
                {owners.map((owner) => (
                  <SelectItem key={owner.id} value={owner.id}>
                    {owner.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.owner_id && (
              <p className={`text-sm ${COLORS.danger.text}`}>{errors.owner_id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Textarea
              id="address"
              placeholder="123 Main St, Apt 4B"
              {...register('address')}
              disabled={loading}
              rows={2}
            />
            {errors.address && (
              <p className={`text-sm ${COLORS.danger.text}`}>{errors.address.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="City name"
                {...register('city')}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="district">District</Label>
              <Input
                id="district"
                placeholder="District/neighborhood"
                {...register('district')}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select
              value={selectedStatus}
              onValueChange={(value) => setValue('status', value as 'Empty' | 'Occupied' | 'Inactive')}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Empty">Empty</SelectItem>
                <SelectItem value="Occupied">Occupied</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className={`text-sm ${COLORS.danger.text}`}>{errors.status.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional information about the property..."
              {...register('notes')}
              disabled={loading}
              rows={3}
            />
          </div>

          <DialogFooter className="pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className={`${COLORS.primary.bgGradient} ${COLORS.primary.bgGradientHover}`}
            >
              {loading ? 'Saving...' : property ? 'Update Property' : 'Add Property'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      {property && (
        <PhotoManagement
          open={photoManagementOpen}
          onOpenChange={setPhotoManagementOpen}
          propertyId={property.id}
          propertyAddress={property.address}
        />
      )}
    </Dialog>
  );
};
