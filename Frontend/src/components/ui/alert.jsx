import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const alertVariants = cva(
  "relative w-full rounded-md border px-6 py-4 text-sm flex items-center justify-center gap-4 shadow-sm text-center",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border-border",
        destructive:
          "bg-red-50 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-200 dark:border-red-800",
        success:
          "bg-green-50 text-green-800 border-green-300 dark:bg-green-950 dark:text-green-200 dark:border-green-800",
        info:
          "bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Alert({ className, variant, ...props }) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "font-semibold text-base leading-snug tracking-tight text-foreground",
        className
      )}
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "mt-1 text-sm leading-relaxed text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
