'use client';
import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

export function SheetContent({
    className,
    side = 'right',
    ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    side?: 'top' | 'right' | 'bottom' | 'left';
}) {
    return (
        <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className='fixed inset-0 bg-black/40' />
            <DialogPrimitive.Content
                className={cn(
                    'fixed z-50 bg-white shadow-xl',
                    side === 'right' &&
                        'right-0 top-0 h-full w-80 rounded-l-2xl',
                    side === 'left' && 'left-0 top-0 h-full w-80 rounded-r-2xl',
                    side === 'top' && 'top-0 left-0 w-full h-80 rounded-b-2xl',
                    side === 'bottom' &&
                        'bottom-0 left-0 w-full h-80 rounded-t-2xl',
                    className
                )}
                {...props}
            />
        </DialogPrimitive.Portal>
    );
}
