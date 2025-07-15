"use client";

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X, CheckCircle, AlertCircle, Info } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:max-w-[420px] md:max-w-[480px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-lg border p-4 shadow-md transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-bottom-full data-[state=closed]:slide-out-to-right-full duration-200",
  {
    variants: {
      variant: {
        default: "border-gray-200 bg-secondary text-black -900 wark:bg-secondary wark:bg-secondary wark:text-black -100",
        success: "border-green-500/20 bg-green-50 text-black -900 wark:border-green-500/30 wark:bg-secondary -900/80 wark:text-black -100",
        destructive: "border-red-500/20 bg-red-50 text-red-900 wark:border-red-500/30 wark:bg-red-900 wark:text-red-100",
        info: "border-blue-500/20 bg-blue-50 text-blue-900 wark:border-blue-500/30 wark:bg-blue-900/80 wark:text-blue-100",
        warning: "border-yellow-500/20 bg-yellow-50 text-yellow-900 wark:border-yellow-500/30 wark:bg-yellow-900/80 wark:text-yellow-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border px-3 text-sm font-medium ring-offset-background transition-colors focus:outline-none focus:ring-1 focus:ring-ring disabled:pointer-events-none disabled:opacity-50",
      "border-gray-200 bg-white hover:bg-gray-100 text-gray-900 wark:border-gray-700 wark:bg-gray-800 wark:hover:bg-gray-700 wark:text-gray-100",
      "group-[.destructive]:border-red-300 group-[.destructive]:hover:border-red-300 group-[.destructive]:hover:bg-red-100 group-[.destructive]:hover:text-red-600 group-[.destructive]:focus:ring-red-500",
      "group-[.success]:border-green-300 group-[.success]:hover:border-green-300 group-[.success]:hover:bg-green-100 group-[.success]:hover:text-green-600 group-[.success]:focus:ring-green-500",
      "group-[.info]:border-blue-300 group-[.info]:hover:border-blue-300 group-[.info]:hover:bg-blue-100 group-[.info]:hover:text-blue-600 group-[.info]:focus:ring-blue-500",
      "group-[.warning]:border-yellow-300 group-[.warning]:hover:border-yellow-300 group-[.warning]:hover:bg-yellow-100 group-[.warning]:hover:text-yellow-600 group-[.warning]:focus:ring-yellow-500",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-gray-500 opacity-70 transition-opacity hover:text-gray-900 focus:opacity-100 focus:outline-none focus:ring-1 group-hover:opacity-100 wark:text-gray-400 wark:hover:text-gray-100",
      "group-[.destructive]:text-red-400 group-[.destructive]:hover:text-red-600",
      "group-[.success]:text-green-400 group-[.success]:hover:text-green-600",
      "group-[.info]:text-blue-400 group-[.info]:hover:text-blue-600",
      "group-[.warning]:text-yellow-400 group-[.warning]:hover:text-yellow-600",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

// Add icon support based on variant
const ToastIcon = ({ variant }: { variant?: "default" | "destructive" | "success" | "info" | "warning" }) => {
  switch (variant) {
    case "success":
      return <CheckCircle className="h-5 w-5 text-green-600 wark:text-green-400" />;
    case "destructive":
      return <AlertCircle className="h-5 w-5 text-red-600 wark:text-red-400" />;
    case "info":
      return <Info className="h-5 w-5 text-blue-600 wark:text-blue-400" />;
    case "warning":
      return <AlertCircle className="h-5 w-5 text-yellow-600 wark:text-yellow-400" />;
    default:
      return null;
  }
};

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-90 mt-1", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  ToastIcon,
}
