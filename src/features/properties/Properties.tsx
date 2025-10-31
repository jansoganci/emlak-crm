import { useState, useEffect } from 'react';
import { TableCell, TableHead, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { PropertyDialog } from './PropertyDialog';
import { EnhancedTenantDialog } from '../tenants/EnhancedTenantDialog';
import { propertiesService } from '../../lib/serviceProxy';
import { PropertyWithOwner, TenantWithContractResult } from '../../types';
import { toast } from 'sonner';
import { MapPin, Building2, User, Images, UserPlus } from 'lucide-react';
import { COLORS, getStatusBadgeClasses } from '@/config/colors';
import { TableActionButtons } from '../../components/common/TableActionButtons';
import { ListPageTemplate } from '../../components/templates/ListPageTemplate';
import * as z from 'zod';

const propertySchema = z.object({
  owner_id: z.string().min(1, 'Owner is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().optional(),
  district: z.string().optional(),
  status: z.enum(['Empty', 'Occupied', 'Inactive']),
  notes: z.string().optional(),
});

type PropertyFormData = z.infer<typeof propertySchema>;

export const Properties = () => {
  const [properties, setProperties] = useState<PropertyWithOwner[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<PropertyWithOwner[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [enhancedTenantDialogOpen, setEnhancedTenantDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<PropertyWithOwner | null>(null);
  const [selectedPropertyForTenant, setSelectedPropertyForTenant] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<PropertyWithOwner | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadProperties();
  }, []);

  useEffect(() => {
    filterProperties();
  }, [searchQuery, statusFilter, properties]);

  const filterProperties = () => {
    let filtered = [...properties];

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (property) =>
          property.address.toLowerCase().includes(query) ||
          property.city?.toLowerCase().includes(query) ||
          property.district?.toLowerCase().includes(query) ||
          property.owner?.name.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((property) => property.status === statusFilter);
    }

    setFilteredProperties(filtered);
  };

  const loadProperties = async () => {
    try {
      setLoading(true);
      const data = await propertiesService.getAll();
      setProperties(data);
    } catch (error) {
      toast.error('Failed to load properties');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProperty = () => {
    setSelectedProperty(null);
    setDialogOpen(true);
  };

  const handleEditProperty = (property: PropertyWithOwner) => {
    setSelectedProperty(property);
    setDialogOpen(true);
  };

  const handleDeleteClick = (property: PropertyWithOwner) => {
    setPropertyToDelete(property);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!propertyToDelete) return;

    try {
      setActionLoading(true);
      await propertiesService.delete(propertyToDelete.id);
      toast.success('Property deleted successfully');
      await loadProperties();
      setDeleteDialogOpen(false);
      setPropertyToDelete(null);
    } catch (error) {
      toast.error('Failed to delete property');
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmit = async (data: PropertyFormData) => {
    try {
      setActionLoading(true);
      if (selectedProperty) {
        await propertiesService.update(selectedProperty.id, data);
        toast.success('Property updated successfully');
      } else {
        await propertiesService.create(data);
        toast.success('Property added successfully');
      }
      await loadProperties();
      setDialogOpen(false);
      setSelectedProperty(null);
    } catch (error) {
      toast.error(selectedProperty ? 'Failed to update property' : 'Failed to add property');
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddTenantToProperty = (propertyId: string) => {
    setSelectedPropertyForTenant(propertyId);
    setEnhancedTenantDialogOpen(true);
  };

  const handleTenantCreated = async (result: TenantWithContractResult) => {
    toast.success(`Tenant ${result.tenant.name} and contract created successfully for property!`);
    await loadProperties();
    setEnhancedTenantDialogOpen(false);
    setSelectedPropertyForTenant(null);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      Empty: { label: 'Empty', className: getStatusBadgeClasses('empty') },
      Occupied: { label: 'Occupied', className: getStatusBadgeClasses('occupied') },
      Inactive: { label: 'Inactive', className: getStatusBadgeClasses('inactive') },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Empty;

    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  return (
    <>
      <ListPageTemplate
        title="Properties"
        items={filteredProperties}
        loading={loading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search properties..."
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        filterOptions={[
          { value: 'all', label: 'All Status' },
          { value: 'Empty', label: 'Empty' },
          { value: 'Occupied', label: 'Occupied' },
          { value: 'Inactive', label: 'Inactive' },
        ]}
        filterPlaceholder="Filter by status"
        onAdd={handleAddProperty}
        addButtonLabel="Add Property"
        emptyState={{
          title: searchQuery || statusFilter !== 'all' ? 'No properties found' : 'No properties yet',
          description: searchQuery || statusFilter !== 'all'
            ? 'Try adjusting your search or filter'
            : 'Get started by adding your first property',
          icon: <Building2 className={`h-16 w-16 ${COLORS.muted.text}`} />,
          actionLabel: 'Add Your First Property',
          showAction: !searchQuery && statusFilter === 'all',
        }}
        renderTableHeaders={() => (
          <>
            <TableHead>Address</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </>
        )}
        renderTableRow={(property) => (
          <TableRow>
            <TableCell>
              <div className="flex items-start gap-2 min-w-0">
                <Building2 className={`h-4 w-4 ${COLORS.primary.text} mt-0.5 flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`font-medium truncate max-w-[200px] md:max-w-none`}>
                      {property.address}
                    </span>
                    {property.photos && property.photos.length > 0 && (
                      <span className={`inline-flex items-center gap-1 text-xs ${COLORS.gray.text500} flex-shrink-0`}>
                        <Images className="h-3 w-3" />
                        {property.photos.length}
                      </span>
                    )}
                  </div>
                  {property.notes && (
                    <div className={`text-xs ${COLORS.gray.text500} mt-1 line-clamp-1`}>
                      {property.notes}
                    </div>
                  )}
                </div>
              </div>
            </TableCell>
            <TableCell>
              {property.city || property.district ? (
                <div className="flex items-center gap-2 text-sm min-w-0">
                  <MapPin className={`h-3 w-3 ${COLORS.muted.textLight} flex-shrink-0`} />
                  <span className={`${COLORS.gray.text600} truncate max-w-[150px] md:max-w-none`}>
                    {[property.city, property.district].filter(Boolean).join(', ')}
                  </span>
                </div>
              ) : (
                <span className={`${COLORS.muted.textLight} text-sm`}>-</span>
              )}
            </TableCell>
            <TableCell>
              {property.owner ? (
                <div className="flex items-center gap-2 text-sm">
                  <User className={`h-3 w-3 ${COLORS.muted.textLight}`} />
                  <span className={COLORS.gray.text700}>{property.owner.name}</span>
                </div>
              ) : (
                <span className={`${COLORS.muted.textLight} text-sm`}>-</span>
              )}
            </TableCell>
            <TableCell>
              {getStatusBadge(property.status)}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-2">
                {property.status === 'Empty' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddTenantToProperty(property.id)}
                    className="text-xs"
                  >
                    <UserPlus className="h-3 w-3 mr-1" />
                    Add Tenant
                  </Button>
                )}
                <TableActionButtons
                  onEdit={() => handleEditProperty(property)}
                  onDelete={() => handleDeleteClick(property)}
                  showView={false}
                />
              </div>
            </TableCell>
          </TableRow>
        )}
        renderCardContent={(property) => (
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Building2 className={`h-4 w-4 ${COLORS.primary.text} flex-shrink-0`} />
                  <span className={`font-semibold text-base ${COLORS.gray.text900}`}>
                    {property.address}
                  </span>
                </div>
                {property.notes && (
                  <p className={`text-xs ${COLORS.gray.text500} mt-1 line-clamp-2`}>
                    {property.notes}
                  </p>
                )}
              </div>
              <div className="flex-shrink-0">
                {getStatusBadge(property.status)}
              </div>
            </div>

            {/* Body */}
            <div className="space-y-2">
              {(property.city || property.district) && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className={`h-4 w-4 ${COLORS.muted.textLight}`} />
                  <span className={COLORS.gray.text600}>
                    {[property.city, property.district].filter(Boolean).join(', ')}
                  </span>
                </div>
              )}
              
              {property.owner && (
                <div className="flex items-center gap-2 text-sm">
                  <User className={`h-4 w-4 ${COLORS.muted.textLight}`} />
                  <span className={COLORS.gray.text700}>{property.owner.name}</span>
                </div>
              )}

              {property.photos && property.photos.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Images className={`h-4 w-4 ${COLORS.muted.textLight}`} />
                  <span className={COLORS.gray.text600}>
                    {property.photos.length} photo{property.photos.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>

            {/* Footer - Actions */}
            <div className="flex flex-col gap-2 pt-2 border-t">
              {property.status === 'Empty' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddTenantToProperty(property.id)}
                  className="w-full justify-start"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Tenant
                </Button>
              )}
              <div className="flex gap-2">
                <TableActionButtons
                  onEdit={() => handleEditProperty(property)}
                  onDelete={() => handleDeleteClick(property)}
                  showView={false}
                />
              </div>
            </div>
          </div>
        )}
        deleteDialog={{
          open: deleteDialogOpen,
          title: 'Delete Property',
          description: `Are you sure you want to delete this property at ${propertyToDelete?.address}? This action cannot be undone and will also delete all associated photos.`,
          onConfirm: handleDeleteConfirm,
          onCancel: () => setDeleteDialogOpen(false),
          loading: actionLoading,
        }}
      />

      <PropertyDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        property={selectedProperty}
        onSubmit={handleSubmit}
        loading={actionLoading}
      />

      <EnhancedTenantDialog
        open={enhancedTenantDialogOpen}
        onOpenChange={setEnhancedTenantDialogOpen}
        onSuccess={handleTenantCreated}
        preSelectedPropertyId={selectedPropertyForTenant}
      />
    </>
  );
};
