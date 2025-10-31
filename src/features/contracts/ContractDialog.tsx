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
import { Switch } from '../../components/ui/switch';
import { Contract, Tenant, Property, ContractStatus } from '../../types';
import { tenantsService } from '../../lib/serviceProxy';
import { propertiesService } from '../../lib/serviceProxy';
import { FileText, X, Bell } from 'lucide-react';

const contractSchema = z.object({
  tenant_id: z.string().min(1, 'Tenant is required'),
  property_id: z.string().min(1, 'Property is required'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  rent_amount: z.string().optional(),
  status: z.enum(['Active', 'Archived', 'Inactive']),
  notes: z.string().optional(),
  rent_increase_reminder_enabled: z.boolean().optional(),
  rent_increase_reminder_days: z.string().optional(),
  expected_new_rent: z.string().optional(),
  reminder_notes: z.string().optional(),
}).refine((data) => {
  if (data.start_date && data.end_date) {
    return new Date(data.end_date) > new Date(data.start_date);
  }
  return true;
}, {
  message: 'End date must be after start date',
  path: ['end_date'],
});

type ContractFormData = z.infer<typeof contractSchema>;

interface ContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: Contract | null;
  onSubmit: (data: ContractFormData, pdfFile?: File) => Promise<void>;
  loading?: boolean;
}

export const ContractDialog = ({
  open,
  onOpenChange,
  contract,
  onSubmit,
  loading = false,
}: ContractDialogProps) => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      status: 'Active',
    },
  });

  const selectedTenantId = watch('tenant_id');
  const selectedPropertyId = watch('property_id');
  const selectedStatus = watch('status');
  const reminderEnabled = watch('rent_increase_reminder_enabled');

  useEffect(() => {
    if (open) {
      const initForm = async () => {
        await loadData();
        if (contract) {
          reset({
            tenant_id: contract.tenant_id || '',
            property_id: contract.property_id || '',
            start_date: contract.start_date || '',
            end_date: contract.end_date || '',
            rent_amount: contract.rent_amount?.toString() || '',
            status: contract.status as ContractStatus,
            notes: contract.notes || '',
            rent_increase_reminder_enabled: contract.rent_increase_reminder_enabled || false,
            rent_increase_reminder_days: contract.rent_increase_reminder_days?.toString() || '90',
            expected_new_rent: contract.expected_new_rent?.toString() || '',
            reminder_notes: contract.reminder_notes || '',
          });
          setPdfFile(null);
        } else {
          reset({
            tenant_id: '',
            property_id: '',
            start_date: '',
            end_date: '',
            rent_amount: '',
            status: 'Active',
            notes: '',
            rent_increase_reminder_enabled: false,
            rent_increase_reminder_days: '90',
            expected_new_rent: '',
            reminder_notes: '',
          });
          setPdfFile(null);
        }
      };
      initForm();
    }
  }, [open, contract, reset]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const [tenantsData, propertiesData] = await Promise.all([
        tenantsService.getAll(),
        propertiesService.getAll(),
      ]);
      setTenants(tenantsData);
      setProperties(propertiesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleFormSubmit = async (data: ContractFormData) => {
    const cleanedData = {
      ...data,
      rent_amount: data.rent_amount?.trim() || undefined,
      notes: data.notes?.trim() || undefined,
      expected_new_rent: data.expected_new_rent?.trim() || undefined,
      reminder_notes: data.reminder_notes?.trim() || undefined,
    };
    await onSubmit(cleanedData, pdfFile || undefined);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    } else {
      setPdfFile(null);
      if (file) {
        alert('Please select a PDF file');
      }
    }
  };

  const removePdfFile = () => {
    setPdfFile(null);
    const fileInput = document.getElementById('pdf-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{contract ? 'Edit Contract' : 'Create New Contract'}</DialogTitle>
          <DialogDescription>
            {contract
              ? 'Update the contract information below.'
              : 'Fill in the contract details to create a new rental agreement.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tenant_id">Tenant *</Label>
              <Select
                value={selectedTenantId || ''}
                onValueChange={(value) => setValue('tenant_id', value)}
                disabled={loadingData || loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a tenant" />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.name}
                      {tenant.email && ` (${tenant.email})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tenant_id && (
                <p className={`text-sm ${COLORS.danger.text}`}>{errors.tenant_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="property_id">Property *</Label>
              <Select
                value={selectedPropertyId || ''}
                onValueChange={(value) => setValue('property_id', value)}
                disabled={loadingData || loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a property" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.address} - {property.status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.property_id && (
                <p className={`text-sm ${COLORS.danger.text}`}>{errors.property_id.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                {...register('start_date')}
                disabled={loading}
              />
              {errors.start_date && (
                <p className={`text-sm ${COLORS.danger.text}`}>{errors.start_date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date *</Label>
              <Input
                id="end_date"
                type="date"
                {...register('end_date')}
                disabled={loading}
              />
              {errors.end_date && (
                <p className={`text-sm ${COLORS.danger.text}`}>{errors.end_date.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rent_amount">Monthly Rent Amount</Label>
              <Input
                id="rent_amount"
                type="number"
                step="0.01"
                placeholder="1000.00"
                {...register('rent_amount')}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={selectedStatus}
                onValueChange={(value) => setValue('status', value as ContractStatus)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Archived">Archived</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pdf-upload">Contract PDF (Optional)</Label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Input
                  id="pdf-upload"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  disabled={loading}
                  className="cursor-pointer"
                />
              </div>
              {pdfFile && (
                <div className={`flex items-center gap-2 px-3 py-2 ${COLORS.primary.bgLight} rounded-lg border ${COLORS.primary.border}`}>
                  <FileText className={`h-4 w-4 ${COLORS.primary.text}`} />
                  <span className={`text-sm ${COLORS.primary.textLight} truncate max-w-[150px]`}>
                    {pdfFile.name}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={removePdfFile}
                    className={`min-h-[44px] min-w-[44px] md:h-auto md:w-auto p-2 md:p-0 ${COLORS.primary.text} hover:${COLORS.primary.dark}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <p className={`text-xs ${COLORS.muted.textLight}`}>
              Upload a PDF copy of the signed contract
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional contract information..."
              {...register('notes')}
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className={`h-5 w-5 ${COLORS.warning.text}`} />
                <div>
                  <Label htmlFor="rent_increase_reminder_enabled" className="text-base font-semibold">
                    Rent Increase Reminder
                  </Label>
                  <p className={`text-xs ${COLORS.muted.textLight}`}>Get reminded to contact owner about rent increase</p>
                </div>
              </div>
              <Switch
                id="rent_increase_reminder_enabled"
                checked={reminderEnabled || false}
                onCheckedChange={(checked) => setValue('rent_increase_reminder_enabled', checked)}
                disabled={loading}
              />
            </div>

            {reminderEnabled && (
              <div className="space-y-4 pl-7 animate-in fade-in-50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rent_increase_reminder_days">Remind me (days before end)</Label>
                    <Select
                      value={watch('rent_increase_reminder_days') || '90'}
                      onValueChange={(value) => setValue('rent_increase_reminder_days', value)}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select days" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 days (1 month)</SelectItem>
                        <SelectItem value="60">60 days (2 months)</SelectItem>
                        <SelectItem value="90">90 days (3 months)</SelectItem>
                        <SelectItem value="120">120 days (4 months)</SelectItem>
                        <SelectItem value="180">180 days (6 months)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expected_new_rent">Expected New Rent (Optional)</Label>
                    <Input
                      id="expected_new_rent"
                      type="number"
                      step="0.01"
                      placeholder="1200.00"
                      {...register('expected_new_rent')}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reminder_notes">Reminder Notes (Optional)</Label>
                  <Textarea
                    id="reminder_notes"
                    placeholder="e.g., Owner wants 10% increase, market rate is $1200..."
                    {...register('reminder_notes')}
                    disabled={loading}
                    rows={2}
                  />
                </div>
              </div>
            )}
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
              disabled={loading || loadingData}
              className={`${COLORS.primary.bgGradient} ${COLORS.primary.bgGradientHover}`}
            >
              {loading ? 'Saving...' : contract ? 'Update Contract' : 'Create Contract'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
