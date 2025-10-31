import { ReactNode } from 'react';
import { Card } from '../ui/card';
import { COLORS } from '@/config/colors';

interface MobileCardViewProps<T> {
  items: T[];
  renderCardContent: (item: T, index: number) => ReactNode;
  loading?: boolean;
}

export const MobileCardView = <T,>({
  items,
  renderCardContent,
  loading = false,
}: MobileCardViewProps<T>) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className={`p-4 shadow-sm ${COLORS.border.light} ${COLORS.card.bg}`}>
            <div className="space-y-3">
              <div className="h-5 bg-gray-200 animate-pulse rounded w-3/4" />
              <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2" />
              <div className="h-4 bg-gray-200 animate-pulse rounded w-2/3" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return null; // Empty state is handled by parent
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <Card
          key={`mobile-card-${index}`}
          className={`p-4 shadow-sm hover:shadow-md transition-shadow ${COLORS.border.light} ${COLORS.card.bg}`}
        >
          {renderCardContent(item, index)}
        </Card>
      ))}
    </div>
  );
};

