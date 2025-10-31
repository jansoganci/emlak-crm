import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { COLORS } from '@/config/colors';

const buttonVariants = cva(
  'relative group inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 appearance-none [-webkit-appearance:none] [-moz-appearance:none] align-middle',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline: cn(
          'border-2 shadow-sm transition-all',
          COLORS.border.DEFAULT_class,
          COLORS.card.bg,
          'hover:bg-gray-50 hover:text-foreground hover:border-gray-400'
        ),
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-11 px-4 py-2 md:h-9',
        sm: 'h-10 rounded-md px-3 text-xs md:h-8',
        lg: 'h-12 rounded-md px-8 md:h-10',
        icon: 'min-h-[44px] min-w-[44px] md:h-9 md:w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  neon?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, neon = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {/* Top neon line - visible when neon=true OR variant=outline */}
        {(neon || variant === 'outline') && (
          <span
            className={cn(
              'absolute h-px opacity-0 transition-all duration-500 ease-in-out inset-x-0 inset-y-0 bg-gradient-to-r w-3/4 mx-auto from-transparent',
              `via-${COLORS.primary.DEFAULT}`,
              'to-transparent pointer-events-none',
              variant === 'outline' ? 'group-hover:opacity-60' : 'group-hover:opacity-100'
            )}
            aria-hidden="true"
          />
        )}
        
        {/* Bottom neon line - visible when neon=true OR variant=outline */}
        {(neon || variant === 'outline') && (
          <span
            className={cn(
              'absolute group-hover:opacity-30 transition-all duration-500 ease-in-out inset-x-0 h-px -bottom-px bg-gradient-to-r w-3/4 mx-auto from-transparent',
              `via-${COLORS.primary.DEFAULT}`,
              'to-transparent pointer-events-none'
            )}
            aria-hidden="true"
          />
        )}
        
        {/* Content wrapper for proper z-index and alignment */}
        <span className="relative inline-flex items-center gap-2">
          {children}
        </span>
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
