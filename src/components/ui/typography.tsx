import * as React from "react"

import { cn } from "@/lib/utils"

/** Page / section title */
function H1({ className, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1
      className={cn(
        "scroll-m-20 font-heading text-4xl font-extrabold tracking-tight text-foreground lg:text-5xl",
        className,
      )}
      {...props}
    />
  )
}

function H2({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      className={cn(
        "scroll-m-20 font-heading text-3xl font-semibold tracking-tight text-foreground first:mt-0",
        className,
      )}
      {...props}
    />
  )
}

function H3({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      className={cn(
        "scroll-m-20 font-heading text-2xl font-semibold tracking-tight text-foreground",
        className,
      )}
      {...props}
    />
  )
}

function H4({ className, ...props }: React.ComponentProps<"h4">) {
  return (
    <h4
      className={cn(
        "scroll-m-20 font-heading text-xl font-semibold tracking-tight text-foreground",
        className,
      )}
      {...props}
    />
  )
}

function P({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("leading-7 text-foreground", className)} {...props} />
}

function Lead({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p className={cn("text-muted-foreground text-xl leading-relaxed", className)} {...props} />
  )
}

function Large({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("text-lg font-semibold text-foreground", className)} {...props} />
}

function Small({ className, ...props }: React.ComponentProps<"small">) {
  return (
    <small className={cn("text-sm leading-none font-medium text-foreground", className)} {...props} />
  )
}

function Muted({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-muted-foreground text-sm", className)} {...props} />
}

function Blockquote({ className, ...props }: React.ComponentProps<"blockquote">) {
  return (
    <blockquote
      className={cn("mt-6 border-l-2 border-border pl-6 text-muted-foreground italic", className)}
      {...props}
    />
  )
}

function InlineCode({ className, ...props }: React.ComponentProps<"code">) {
  return (
    <code
      className={cn(
        "bg-muted relative rounded-md px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
        className,
      )}
      {...props}
    />
  )
}

function Ul({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul className={cn("my-6 ml-6 list-disc [&>li]:mt-2", className)} {...props} />
}

function Ol({ className, ...props }: React.ComponentProps<"ol">) {
  return <ol className={cn("my-6 ml-6 list-decimal [&>li]:mt-2", className)} {...props} />
}

function Li({ className, ...props }: React.ComponentProps<"li">) {
  return <li className={cn("leading-7", className)} {...props} />
}

export { Blockquote, H1, H2, H3, H4, InlineCode, Large, Lead, Li, Muted, Ol, P, Small, Ul }
