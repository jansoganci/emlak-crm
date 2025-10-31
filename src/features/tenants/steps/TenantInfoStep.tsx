import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { COLORS } from '@/config/colors';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { TenantWithContractFormData } from '../EnhancedTenantDialog';

interface TenantInfoStepProps {
  form: UseFormReturn<TenantWithContractFormData>;
  isLoading: boolean;
}

export const TenantInfoStep: React.FC<TenantInfoStepProps> = ({
  form,
  isLoading,
}) => {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Tenant Information</h3>
        <p className="text-sm text-gray-600">
          Enter the basic information for the new tenant.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="tenant.name">Full Name *</Label>
          <Input
            id="tenant.name"
            placeholder="John Doe"
            {...register('tenant.name')}
            disabled={isLoading}
          />
          {errors.tenant?.name && (
            <p className={`text-sm ${COLORS.danger.text}`}>
              {errors.tenant.name.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tenant.phone">Phone Number</Label>
            <Input
              id="tenant.phone"
              placeholder="+1 234 567 8900"
              {...register('tenant.phone')}
              disabled={isLoading}
            />
            {errors.tenant?.phone && (
              <p className={`text-sm ${COLORS.danger.text}`}>
                {errors.tenant.phone.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tenant.email">Email Address</Label>
            <Input
              id="tenant.email"
              type="email"
              placeholder="john@example.com"
              {...register('tenant.email')}
              disabled={isLoading}
            />
            {errors.tenant?.email && (
              <p className={`text-sm ${COLORS.danger.text}`}>
                {errors.tenant.email.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tenant.notes">Additional Notes</Label>
          <Textarea
            id="tenant.notes"
            placeholder="Any additional information about the tenant..."
            {...register('tenant.notes')}
            disabled={isLoading}
            rows={3}
          />
          {errors.tenant?.notes && (
            <p className={`text-sm ${COLORS.danger.text}`}>
              {errors.tenant.notes.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};