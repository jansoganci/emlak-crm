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
import { Tenant, Property } from '../../types';
import { propertiesService } from '../../lib/serviceProxy';

const tenantSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  property_id: z.string().optional(),
  notes: z.string().optional(),
});

type TenantFormData = z.infer<typeof tenantSchema>;

interface TenantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: Tenant | null;
  onSubmit: (data: TenantFormData) => Promise<void>;
  loading?: boolean;
}

export const TenantDialog = ({
  open,
  onOpenChange,
  tenant,
  onSubmit,
  loading = false,
}: TenantDialogProps) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TenantFormData>({
    resolver: zodResolver(tenantSchema),
  });

  const selectedPropertyId = watch('property_id');

  useEffect(() => {
    if (open) {
      const initForm = async () => {
        await loadProperties();
        if (tenant) {
          reset({
            name: tenant.name || '',
            phone: tenant.phone || '',
            email: tenant.email || '',
            property_id: tenant.property_id || '',
            notes: tenant.notes || '',
          });
        } else {
          reset({
            name: '',
            phone: '',
            email: '',
            property_id: '',
            notes: '',
          });
        }
      };
      initForm();
    }
  }, [open, tenant, reset]);

  const loadProperties = async () => {
    try {
      setLoadingProperties(true);
      const data = await propertiesService.getAll();
      setProperties(data);
    } catch (error) {
      console.error('Failed to load properties:', error);
    } finally {
      setLoadingProperties(false);
    }
  };

  const handleFormSubmit = async (data: TenantFormData) => {
    const submitData: TenantFormData = {
      ...data,
      property_id: data.property_id && data.property_id !== '' ? data.property_id : undefined,
      phone: data.phone?.trim() || undefined,
      email: data.email?.trim() || undefined,
      notes: data.notes?.trim() || undefined,
    };
    await onSubmit(submitData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{tenant ? 'Edit Tenant' : 'Add New Tenant'}</DialogTitle>
          <DialogDescription>
            {tenant
              ? 'Update the tenant information below.'
              : 'Fill in the tenant details below.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              placeholder="John Doe"
              {...register('name')}
              disabled={loading}
            />
            {errors.name && (
              <p className={`text-sm ${COLORS.danger.text}`}>{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="+1 234 567 8900"
                {...register('phone')}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                {...register('email')}
                disabled={loading}
              />
              {errors.email && (
                <p className={`text-sm ${COLORS.danger.text}`}>{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="property_id">Assigned Property</Label>
            <Select
              value={selectedPropertyId && selectedPropertyId !== '' ? selectedPropertyId : 'none'}
              onValueChange={(value) => setValue('property_id', value === 'none' ? '' : value)}
              disabled={loadingProperties || loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a property (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Property (Unassigned)</SelectItem>
                {properties
                  .filter(p => p.status !== 'Inactive')
                  .map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.address} - {property.status}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <p className={`text-xs ${COLORS.muted.textLight}`}>
              You can assign a tenant to a property later
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional information about the tenant..."
              {...register('notes')}
              disabled={loading}
              rows={3}
            />
          </div>

          <DialogFooter>
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
              {loading ? 'Saving...' : tenant ? 'Update Tenant' : 'Add Tenant'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
