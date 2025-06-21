'use client'

import { useToast as useToastPrimitive, toast as toastPrimitive } from "@/components/ui/use-toast";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success" | "info" | "warning";
  duration?: number;
};

// Export the hook
export function useToast() {
  const { toast, dismiss, toasts } = useToastPrimitive();

  return {
    toast: (props: ToastProps) => {
      toast({
        ...props,
      });
    },
    dismiss,
    toasts
  };
}

// Also export a direct toast function
export const toast = (props: ToastProps) => {
  toastPrimitive({
    ...props,
  });
};
