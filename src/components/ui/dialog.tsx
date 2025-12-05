"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { Slot } from "@radix-ui/react-slot"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

type DialogContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  labelId: string
  descriptionId: string
}

const DialogContext = React.createContext<DialogContextValue | null>(null)

const useDialogContext = (component: string) => {
  const context = React.useContext(DialogContext)
  if (!context) {
    throw new Error(`${component} must be used within <Dialog>`)
  }
  return context
}

type DialogProps = React.PropsWithChildren<{
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}>

const Dialog = ({ children, open: openProp, defaultOpen = false, onOpenChange }: DialogProps) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const isControlled = openProp !== undefined
  const open = isControlled ? Boolean(openProp) : uncontrolledOpen

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(nextOpen)
      }
      onOpenChange?.(nextOpen)
    },
    [isControlled, onOpenChange, setUncontrolledOpen]
  )

  const labelId = React.useId()
  const descriptionId = React.useId()

  const value = React.useMemo(
    () => ({
      open,
      setOpen,
      labelId,
      descriptionId,
    }),
    [open, setOpen, labelId, descriptionId]
  )

  return <DialogContext.Provider value={value}>{children}</DialogContext.Provider>
}

type DialogPortalProps = {
  children?: React.ReactNode
  container?: Element | DocumentFragment | null
}

const DialogPortal = ({ children, container }: DialogPortalProps) => {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted) return null

  const target = container ?? (typeof document !== "undefined" ? document.body : null)
  if (!target) return null

  return createPortal(children, target)
}

type DialogTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean
}

const DialogTrigger = React.forwardRef<HTMLButtonElement, DialogTriggerProps>(
  ({ asChild = false, onClick, ...props }, ref) => {
    const { open, setOpen } = useDialogContext("DialogTrigger")
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        type={asChild ? undefined : "button"}
        ref={ref}
        data-state={open ? "open" : "closed"}
        {...props}
        onClick={(event: React.MouseEvent<HTMLElement>) => {
          onClick?.(event as React.MouseEvent<HTMLButtonElement>)
          if (!event.defaultPrevented) {
            setOpen(true)
          }
        }}
      />
    )
  }
)
DialogTrigger.displayName = "DialogTrigger"

type DialogCloseProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean
}

const DialogClose = React.forwardRef<HTMLButtonElement, DialogCloseProps>(
  ({ asChild = false, onClick, ...props }, ref) => {
    const { open, setOpen } = useDialogContext("DialogClose")
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        type={asChild ? undefined : "button"}
        ref={ref}
        data-state={open ? "open" : "closed"}
        {...props}
        onClick={(event: React.MouseEvent<HTMLElement>) => {
          onClick?.(event as React.MouseEvent<HTMLButtonElement>)
          if (!event.defaultPrevented) {
            setOpen(false)
          }
        }}
      />
    )
  }
)
DialogClose.displayName = "DialogClose"

const DialogOverlay = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, onClick, ...props }, ref) => {
    const { open, setOpen } = useDialogContext("DialogOverlay")
    if (!open) return null

    return (
      <div
        ref={ref}
        data-state={open ? "open" : "closed"}
        className={cn(
          "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          className
        )}
        onClick={(event) => {
          onClick?.(event)
          if (!event.defaultPrevented && event.target === event.currentTarget) {
            setOpen(false)
          }
        }}
        {...props}
      />
    )
  }
)
DialogOverlay.displayName = "DialogOverlay"

const DialogContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen, labelId, descriptionId } = useDialogContext("DialogContent")

    React.useEffect(() => {
      if (!open) return
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setOpen(false)
        }
      }
      document.addEventListener("keydown", handleKeyDown)
      return () => document.removeEventListener("keydown", handleKeyDown)
    }, [open, setOpen])

    if (!open) return null

    return (
      <DialogPortal>
        <DialogOverlay />
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelId}
          aria-describedby={descriptionId}
          data-state={open ? "open" : "closed"}
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
            className
          )}
          {...props}
        >
          {children}
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </div>
      </DialogPortal>
    )
  }
)
DialogContent.displayName = "DialogContent"

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => {
    const { labelId } = useDialogContext("DialogTitle")
    return <h2 id={labelId} ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
  }
)
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    const { descriptionId } = useDialogContext("DialogDescription")
    return <p id={descriptionId} ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  }
)
DialogDescription.displayName = "DialogDescription"

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
