import { ReactNode, memo } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { COLORS } from '@/config/colors';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  showAction?: boolean;
}

export const EmptyState = memo(({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  showAction = true,
}: EmptyStateProps) => {
  return (
    <Card className={`p-8 shadow-lg ${COLORS.border.light} ${COLORS.card.bgBlur}`}>
      <div className="text-center">
        {icon && <div className="flex justify-center mb-4">{icon}</div>}
        <h3 className={`text-lg font-medium ${COLORS.gray.text900} mb-2`}>{title}</h3>
        <p className={`${COLORS.muted.textLight} mb-4`}>{description}</p>
        {showAction && onAction && actionLabel && (
          <Button
            onClick={onAction}
            className={`${COLORS.primary.bgGradient} ${COLORS.primary.bgGradientHover} shadow-md ${COLORS.primary.shadow}`}
          >
            {actionLabel}
          </Button>
        )}
      </div>
    </Card>
  );
});

EmptyState.displayName = 'EmptyState';
