import React, { useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { COLORS } from '@/config/colors';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Checkbox } from '../../../components/ui/checkbox';
import { Button } from '../../../components/ui/button';
import { Upload, FileText, X } from 'lucide-react';
import { TenantWithContractFormData } from '../EnhancedTenantDialog';

interface ContractSettingsStepProps {
  form: UseFormReturn<TenantWithContractFormData>;
  isLoading: boolean;
  pdfFile: File | null;
  setPdfFile: (file: File | null) => void;
}

export const ContractSettingsStep: React.FC<ContractSettingsStepProps> = ({
  form,
  isLoading,
  pdfFile,
  setPdfFile,
}) => {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const rentIncreaseEnabled = watch('contract.rent_increase_reminder_enabled');

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Please select a PDF file.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('File size must be less than 10MB.');
        return;
      }
      setPdfFile(file);
    }
  }, [setPdfFile]);

  const removePdfFile = useCallback(() => {
    setPdfFile(null);
    // Reset the file input
    const fileInput = document.getElementById('contract-pdf') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }, [setPdfFile]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Contract Settings & Upload</h3>
        <p className="text-sm text-gray-600">
          Configure additional contract settings and upload the contract PDF.
        </p>
      </div>

      <div className="space-y-4">
        {/* Rent Increase Reminder Settings */}
        <div className="space-y-4 p-4 border rounded-lg">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="rent_increase_reminder_enabled"
              checked={!!rentIncreaseEnabled}
              onCheckedChange={(checked) => 
                setValue('contract.rent_increase_reminder_enabled', !!checked)
              }
              disabled={isLoading}
            />
            <Label 
              htmlFor="rent_increase_reminder_enabled"
              className="text-sm font-medium"
            >
              Enable rent increase reminders
            </Label>
          </div>

          {rentIncreaseEnabled && (
            <div className="space-y-4 ml-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contract.rent_increase_reminder_days">
                    Reminder Days Before End
                  </Label>
                  <Input
                    id="contract.rent_increase_reminder_days"
                    type="number"
                    placeholder="90"
                    min="1"
                    max="365"
                    {...register('contract.rent_increase_reminder_days', {
                      valueAsNumber: true,
                    })}
                    disabled={isLoading}
                  />
                  {errors.contract?.rent_increase_reminder_days && (
                    <p className={`text-sm ${COLORS.danger.text}`}>
                      {errors.contract.rent_increase_reminder_days.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contract.expected_new_rent">
                    Expected New Rent ($)
                  </Label>
                  <Input
                    id="contract.expected_new_rent"
                    type="number"
                    placeholder="1650"
                    step="0.01"
                    min="0"
                    {...register('contract.expected_new_rent', {
                      valueAsNumber: true,
                    })}
                    disabled={isLoading}
                  />
                  {errors.contract?.expected_new_rent && (
                    <p className={`text-sm ${COLORS.danger.text}`}>
                      {errors.contract.expected_new_rent.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contract.reminder_notes">Reminder Notes</Label>
                <Textarea
                  id="contract.reminder_notes"
                  placeholder="Additional notes for rent increase reminders..."
                  {...register('contract.reminder_notes')}
                  disabled={isLoading}
                  rows={2}
                />
                {errors.contract?.reminder_notes && (
                  <p className={`text-sm ${COLORS.danger.text}`}>
                    {errors.contract.reminder_notes.message}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Contract PDF Upload */}
        <div className="space-y-4 p-4 border rounded-lg">
          <div className="space-y-2">
            <Label>Contract PDF (Optional)</Label>
            <p className="text-sm text-gray-600">
              Upload a signed contract PDF for record keeping.
            </p>
          </div>

          {!pdfFile ? (
            <div className="space-y-2">
              <input
                id="contract-pdf"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                disabled={isLoading}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('contract-pdf')?.click()}
                disabled={isLoading}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose PDF File
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium">{pdfFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={removePdfFile}
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};