import React, { ReactNode } from 'react';
import { MainLayout } from '../layout/MainLayout';
import { PageContainer } from '../layout/PageContainer';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Card } from '../ui/card';
import { EmptyState } from '../common/EmptyState';
import { MobileCardView } from '../common/MobileCardView';
import { Search, Plus } from 'lucide-react';
import { COLORS } from '@/config/colors';

export interface FilterOption {
  value: string;
  label: string;
}

export interface EmptyStateConfig {
  title: string;
  description: string;
  icon: ReactNode;
  actionLabel?: string;
  showAction?: boolean;
}

export interface DeleteDialogConfig {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export interface ListPageTemplateProps<T> {
  title: string;
  items: T[];
  loading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterOptions?: FilterOption[];
  filterPlaceholder?: string;
  onAdd: () => void;
  addButtonLabel: string;
  emptyState: EmptyStateConfig;
  renderTableHeaders: () => ReactNode;
  renderTableRow: (item: T, index: number) => ReactNode;
  renderCardContent?: (item: T, index: number) => ReactNode;
  deleteDialog?: DeleteDialogConfig;
}

export function ListPageTemplate<T>({
  title,
  items,
  loading,
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filterValue,
  onFilterChange,
  filterOptions,
  filterPlaceholder = 'Filter',
  onAdd,
  addButtonLabel,
  emptyState,
  renderTableHeaders,
  renderTableRow,
  renderCardContent,
  deleteDialog,
}: ListPageTemplateProps<T>) {
  return (
    <MainLayout title={title}>
      <PageContainer>
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${COLORS.muted.textLight}`} />
              <Input
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>
            {filterOptions && onFilterChange && filterValue !== undefined && (
              <Select value={filterValue} onValueChange={onFilterChange}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={filterPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <Button
            onClick={onAdd}
            variant="default"
          >
            <Plus className="h-4 w-4" />
            {addButtonLabel}
          </Button>
        </div>

        {loading ? (
          <Card className={`p-8 shadow-lg ${COLORS.border.light} ${COLORS.card.bgBlur}`}>
            <div className={`text-center ${COLORS.muted.textLight}`}>Loading...</div>
          </Card>
        ) : items.length === 0 ? (
          <EmptyState
            title={emptyState.title}
            description={emptyState.description}
            icon={emptyState.icon}
            actionLabel={emptyState.actionLabel}
            onAction={emptyState.showAction ? onAdd : undefined}
            showAction={emptyState.showAction}
          />
        ) : (
          <>
            {/* Desktop Table - Hidden on mobile */}
            <div className="hidden md:block">
              <Card className={`shadow-lg ${COLORS.border.light} ${COLORS.card.bgBlur} overflow-hidden`}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {renderTableHeaders()}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => (
                      <React.Fragment key={`item-${index}`}>
                        {renderTableRow(item, index)}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>

            {/* Mobile Cards - Hidden on desktop */}
            {renderCardContent && (
              <div className="md:hidden">
                <MobileCardView
                  items={items}
                  renderCardContent={renderCardContent}
                  loading={loading}
                />
              </div>
            )}
          </>
        )}
      </PageContainer>

      {deleteDialog && (
        <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && deleteDialog.onCancel()}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{deleteDialog.title}</AlertDialogTitle>
              <AlertDialogDescription>{deleteDialog.description}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteDialog.loading}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={deleteDialog.onConfirm}
                disabled={deleteDialog.loading}
                className={`${COLORS.danger.bg} ${COLORS.danger.hover} ${COLORS.text.white}`}
              >
                {deleteDialog.loading ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </MainLayout>
  );
}
