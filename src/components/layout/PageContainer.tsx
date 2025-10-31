import { cn } from '../../lib/utils';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const PageContainer = ({ children, className }: PageContainerProps) => {
  return (
    <div
      className={cn(
        'w-full mx-auto space-y-6',
        'px-4 lg:px-6',
        'lg:max-w-[1600px]',
        className
      )}
    >
      {children}
    </div>
  );
};
