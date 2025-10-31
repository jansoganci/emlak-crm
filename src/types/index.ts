import type { Database } from './database';

export type PropertyOwner = Database['public']['Tables']['property_owners']['Row'];
export type PropertyOwnerInsert = Database['public']['Tables']['property_owners']['Insert'];
export type PropertyOwnerUpdate = Database['public']['Tables']['property_owners']['Update'];

export type Property = Database['public']['Tables']['properties']['Row'];
export type PropertyInsert = Database['public']['Tables']['properties']['Insert'];
export type PropertyUpdate = Database['public']['Tables']['properties']['Update'];

export type PropertyPhoto = Database['public']['Tables']['property_photos']['Row'];
export type PropertyPhotoInsert = Database['public']['Tables']['property_photos']['Insert'];
export type PropertyPhotoUpdate = Database['public']['Tables']['property_photos']['Update'];

export type Tenant = Database['public']['Tables']['tenants']['Row'];
export type TenantInsert = Database['public']['Tables']['tenants']['Insert'];
export type TenantUpdate = Database['public']['Tables']['tenants']['Update'];

export type Contract = Database['public']['Tables']['contracts']['Row'];
export type ContractInsert = Database['public']['Tables']['contracts']['Insert'];
export type ContractUpdate = Database['public']['Tables']['contracts']['Update'];

export type PropertyStatus = 'Empty' | 'Occupied' | 'Inactive';
export type ContractStatus = 'Active' | 'Archived' | 'Inactive';

export interface PropertyWithOwner extends Property {
  owner?: PropertyOwner;
  photos?: PropertyPhoto[];
}

export interface PropertyWithOwnerDetails extends Property {
  owner: PropertyOwner;
  photos?: PropertyPhoto[];
}

export interface TenantWithProperty extends Tenant {
  property?: Property;
}

export interface ContractWithDetails extends Contract {
  tenant?: Tenant;
  property?: Property;
}

export interface DashboardStats {
  totalProperties: number;
  emptyProperties: number;
  occupiedProperties: number;
  inactiveProperties: number;
  activeContracts: number;
  expiringContracts: number;
}

// Enhanced tenant dialog types
export interface TenantWithContractData {
  tenant: TenantInsert;
  contract: ContractInsert;
  pdfFile?: File;
}

export interface TenantWithContractResult {
  tenant: Tenant;
  contract: Contract;
}
