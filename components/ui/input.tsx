import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-xl border-2 border-zinc-200 bg-zinc-50 px-3.5 py-2 text-base transition-all outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-zinc-900 focus-visible:ring-4 focus-visible:ring-zinc-900/10 focus-visible:bg-white disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:border-zinc-200 disabled:opacity-60 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-zinc-800 dark:border-zinc-700 dark:focus-visible:border-zinc-100 dark:focus-visible:ring-zinc-100/10 dark:focus-visible:bg-zinc-900 dark:disabled:bg-zinc-800 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
