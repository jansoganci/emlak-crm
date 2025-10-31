import { useState, useEffect } from 'react';
import { TableCell, TableHead, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { ContractDialog } from './ContractDialog';
import { contractsService } from '../../lib/serviceProxy';
import { ContractWithDetails } from '../../types';
import { toast } from 'sonner';
import { FileText, AlertCircle, Bell, Calendar, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { COLORS, getStatusBadgeClasses } from '@/config/colors';
import { TableActionButtons } from '../../components/common/TableActionButtons';
import { ListPageTemplate } from '../../components/templates/ListPageTemplate';
import * as z from 'zod';
import { getToday, parseDateToStartOfDay, daysDifference } from '../../lib/dates';

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

export const Contracts = () => {
  const [contracts, setContracts] = useState<ContractWithDetails[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<ContractWithDetails[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<ContractWithDetails | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<ContractWithDetails | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadContracts();
  }, []);

  useEffect(() => {
    filterContracts();
  }, [searchQuery, statusFilter, contracts]);

  const filterContracts = () => {
    let filtered = [...contracts];

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (contract) =>
          contract.tenant?.name?.toLowerCase().includes(query) ||
          contract.property?.address?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((contract) => contract.status === statusFilter);
    }

    setFilteredContracts(filtered);
  };

  const loadContracts = async () => {
    try {
      setLoading(true);
      const data = await contractsService.getAll();
      setContracts(data);
    } catch (error) {
      toast.error('Failed to load contracts');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContract = () => {
    setSelectedContract(null);
    setDialogOpen(true);
  };

  const handleEditContract = (contract: ContractWithDetails) => {
    setSelectedContract(contract);
    setDialogOpen(true);
  };

  const handleDeleteClick = (contract: ContractWithDetails) => {
    setContractToDelete(contract);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!contractToDelete) return;

    try {
      setActionLoading(true);

      if (contractToDelete.contract_pdf_path) {
        try {
          await contractsService.deleteContractPdf(contractToDelete.contract_pdf_path);
        } catch (error) {
          console.warn('Failed to delete PDF:', error);
        }
      }

      await contractsService.delete(contractToDelete.id);
      toast.success('Contract deleted successfully');
      await loadContracts();
      setDeleteDialogOpen(false);
      setContractToDelete(null);
    } catch (error) {
      toast.error('Failed to delete contract');
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmit = async (data: ContractFormData, pdfFile?: File) => {
    try {
      setActionLoading(true);

      const contractData = {
        ...data,
        rent_amount: data.rent_amount ? parseFloat(data.rent_amount) : null,
        rent_increase_reminder_enabled: data.rent_increase_reminder_enabled || false,
        rent_increase_reminder_days: data.rent_increase_reminder_days ? parseInt(data.rent_increase_reminder_days) : 90,
        rent_increase_reminder_contacted: false,
        expected_new_rent: data.expected_new_rent ? parseFloat(data.expected_new_rent) : null,
        reminder_notes: data.reminder_notes || null,
      };

      let contract;
      if (selectedContract) {
        contract = await contractsService.update(selectedContract.id, contractData);
        toast.success('Contract updated successfully');
      } else {
        contract = await contractsService.createWithStatusUpdate(contractData);
        toast.success('Contract created successfully');
      }

      if (pdfFile && contract) {
        try {
          await contractsService.uploadContractPdfAndPersist(pdfFile, contract.id.toString());
          toast.success('Contract PDF uploaded successfully');
        } catch (error) {
          toast.error('Contract saved but PDF upload failed');
          console.error(error);
        }
      }

      await loadContracts();
      setDialogOpen(false);
      setSelectedContract(null);
    } catch (error) {
      toast.error(selectedContract ? 'Failed to update contract' : 'Failed to create contract');
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      Active: { label: 'Active', className: getStatusBadgeClasses('active') },
      Inactive: { label: 'Inactive', className: getStatusBadgeClasses('inactive') },
      Archived: { label: 'Archived', className: getStatusBadgeClasses('archived') },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Active;

    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const isExpiringSoon = (endDate: string, status: string): boolean => {
    if (status !== 'Active') return false;
    const end = parseDateToStartOfDay(endDate);
    const today = getToday();
    const daysUntilExpiry = daysDifference(end, today);
    return daysUntilExpiry <= 90 && daysUntilExpiry >= 0;
  };

  return (
    <>
      <ListPageTemplate
        title="Rental Contracts"
        items={filteredContracts}
        loading={loading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search contracts..."
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        filterOptions={[
          { value: 'all', label: 'All Status' },
          { value: 'Active', label: 'Active' },
          { value: 'Inactive', label: 'Inactive' },
          { value: 'Archived', label: 'Archived' },
        ]}
        filterPlaceholder="Filter by status"
        onAdd={handleAddContract}
        addButtonLabel="Add Contract"
        emptyState={{
          title: searchQuery || statusFilter !== 'all' ? 'No contracts found' : 'No contracts yet',
          description: searchQuery || statusFilter !== 'all'
            ? 'Try adjusting your search or filter'
            : 'Get started by creating your first rental contract',
          icon: <FileText className={`h-16 w-16 ${COLORS.muted.text}`} />,
          actionLabel: 'Create Your First Contract',
          showAction: !searchQuery && statusFilter === 'all',
        }}
        renderTableHeaders={() => (
          <>
            <TableHead>Tenant</TableHead>
            <TableHead>Property</TableHead>
            <TableHead>Period</TableHead>
            <TableHead>Rent</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Reminder</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </>
        )}
        renderTableRow={(contract) => (
          <TableRow>
            <TableCell>
              <div className="font-medium truncate max-w-[180px] md:max-w-none">{contract.tenant?.name || 'Unknown'}</div>
              {contract.tenant?.email && (
                <div className={`text-xs ${COLORS.muted.textLight} truncate max-w-[180px] md:max-w-none`}>{contract.tenant.email}</div>
              )}
            </TableCell>
            <TableCell>
              <div className={`text-sm ${COLORS.gray.text700} truncate max-w-[150px] md:max-w-[250px]`}>
                {contract.property?.address || 'Unknown'}
              </div>
            </TableCell>
            <TableCell>
              <div className="text-sm">
                <div>{format(new Date(contract.start_date), 'MMM dd, yyyy')}</div>
                <div className={`${COLORS.muted.textLight}`}>to</div>
                <div className="flex items-center gap-1">
                  {format(new Date(contract.end_date), 'MMM dd, yyyy')}
                  {isExpiringSoon(contract.end_date, contract.status) && (
                    <AlertCircle className={`h-3 w-3 ${COLORS.warning.text}`} />
                  )}
                </div>
              </div>
            </TableCell>
            <TableCell>
              {contract.rent_amount ? (
                <div className="font-medium">${contract.rent_amount.toLocaleString()}</div>
              ) : (
                <span className={`${COLORS.muted.textLight}`}>-</span>
              )}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                {getStatusBadge(contract.status)}
                {contract.contract_pdf_path && (
                  <span title="PDF attached">
                    <FileText className={`h-4 w-4 ${COLORS.primary.text}`} />
                  </span>
                )}
              </div>
            </TableCell>
            <TableCell>
              {contract.rent_increase_reminder_enabled ? (
                <div className="flex items-center gap-1" title={`Reminder set for ${contract.rent_increase_reminder_days} days before end`}>
                  <Bell className={`h-4 w-4 ${COLORS.warning.text}`} />
                  <span className={`text-xs ${COLORS.warning.text}`}>{contract.rent_increase_reminder_days}d</span>
                </div>
              ) : (
                <span className={`${COLORS.muted.textLight} text-xs`}>None</span>
              )}
            </TableCell>
            <TableCell className="text-right">
              <TableActionButtons
                onEdit={() => handleEditContract(contract)}
                onDelete={() => handleDeleteClick(contract)}
                showView={false}
              />
            </TableCell>
          </TableRow>
        )}
        renderCardContent={(contract) => (
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className={`font-semibold text-base ${COLORS.gray.text900}`}>
                  {contract.tenant?.name || 'Unknown Tenant'}
                </div>
                {contract.tenant?.email && (
                  <div className={`text-xs ${COLORS.gray.text500} mt-0.5`}>
                    {contract.tenant.email}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {getStatusBadge(contract.status)}
                {contract.contract_pdf_path && (
                  <span title="PDF attached">
                    <FileText className={`h-4 w-4 ${COLORS.primary.text}`} />
                  </span>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="space-y-2">
              <div className={`text-sm ${COLORS.gray.text700} truncate`}>
                {contract.property?.address || 'Unknown Property'}
              </div>

              <div className="text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className={`h-3 w-3 ${COLORS.muted.textLight}`} />
                  <span>{format(new Date(contract.start_date), 'MMM dd, yyyy')}</span>
                  <span className={COLORS.muted.textLight}>→</span>
                  <div className="flex items-center gap-1">
                    <span>{format(new Date(contract.end_date), 'MMM dd, yyyy')}</span>
                    {isExpiringSoon(contract.end_date, contract.status) && (
                      <AlertCircle className={`h-3 w-3 ${COLORS.warning.text}`} />
                    )}
                  </div>
                </div>
              </div>

              {contract.rent_amount && (
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className={`h-4 w-4 ${COLORS.muted.textLight}`} />
                  <span className={`font-medium ${COLORS.gray.text900}`}>
                    ${contract.rent_amount.toLocaleString()}/month
                  </span>
                </div>
              )}

              {contract.rent_increase_reminder_enabled && (
                <div className="flex items-center gap-2 text-sm">
                  <Bell className={`h-4 w-4 ${COLORS.warning.text}`} />
                  <span className={COLORS.warning.text}>
                    Reminder: {contract.rent_increase_reminder_days} days before end
                  </span>
                </div>
              )}
            </div>

            {/* Footer - Actions */}
            <div className="flex gap-2 pt-2 border-t">
              <TableActionButtons
                onEdit={() => handleEditContract(contract)}
                onDelete={() => handleDeleteClick(contract)}
                showView={false}
              />
            </div>
          </div>
        )}
        deleteDialog={{
          open: deleteDialogOpen,
          title: 'Delete Contract',
          description: `Are you sure you want to delete the contract for ${contractToDelete?.tenant?.name}? This action cannot be undone.`,
          onConfirm: handleDeleteConfirm,
          onCancel: () => setDeleteDialogOpen(false),
          loading: actionLoading,
        }}
      />

      <ContractDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        contract={selectedContract}
        onSubmit={handleSubmit}
        loading={actionLoading}
      />
    </>
  );
};
