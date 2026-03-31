import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { forwardRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

const Accordion = forwardRef<
  HTMLDivElement,
  { children: ReactNode; className?: string }
>(({ children, className }, ref) => (
  <AccordionPrimitive.Root
    ref={ref}
    type="single"
    collapsible
    className={cn(className)}
  >
    {children}
  </AccordionPrimitive.Root>
));
Accordion.displayName = "Accordion";

interface AccordionItemProps {
  header: ReactNode;
  children: ReactNode;
  className?: string;
  value?: string;
}

const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ header, children, className, value = "item" }, ref) => (
    <AccordionPrimitive.Item ref={ref} value={value} className={cn(className)}>
      <AccordionPrimitive.Trigger className="flex w-full items-center justify-between text-left cursor-pointer">
        {header}
      </AccordionPrimitive.Trigger>
      <AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        {children}
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  ),
);
AccordionItem.displayName = "AccordionItem";

export { Accordion, AccordionItem };
