"use client";

import { useUiLanguage } from "@/components/providers/ui-language-provider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

type LanguageSwitcherProps = {
  className?: string;
};

export function LanguageSwitcher({ className = "" }: LanguageSwitcherProps) {
  const { language, setLanguage } = useUiLanguage();
  return (
    <ToggleGroup
      multiple={false}
      value={[language]}
      onValueChange={(next) => {
        const v = next[0];
        if (v === "en" || v === "my") setLanguage(v);
      }}
      spacing={0}
      variant="outline"
      size="sm"
      className={cn("rounded-full border border-border bg-muted/50 p-1", className)}
    >
      <ToggleGroupItem
        value="en"
        className="rounded-full px-3 py-1 text-xs font-medium data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
      >
        EN
      </ToggleGroupItem>
      <ToggleGroupItem
        value="my"
        className="rounded-full px-3 py-1 text-xs font-medium data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
      >
        မြန်မာ
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
