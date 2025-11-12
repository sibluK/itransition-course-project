import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useState } from "react"
import { useTranslation } from "react-i18next"

interface ComboboxProps {
    data: { label: string; value: string }[];
    value: string;
    onChange: (value: string) => void;
    classname?: string;
}

export function Combobox({ data, value, onChange, classname }: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`${classname} w-full justify-between`}

        >
          {value
            ? data.find((item) => item.value === value)?.label
            : t('inv-creation-category-placeholder')}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-inherit p-0">
        <Command>
          <CommandInput placeholder={t("search_placeholder")} />
          <CommandList>
            <CommandEmpty>{t("no_results_found")}</CommandEmpty>
            <CommandGroup>
              {data.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.label}
                  onSelect={(selectedLabel) => {
                    const selected = data.find((d) => d.label === selectedLabel)
                    if (!selected) {
                      onChange("")
                      setOpen(false)
                      return
                    }
                    if (selected.value === value) {
                      onChange("")
                    } else {
                      onChange(selected.value)
                    }
                    setOpen(false)
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === item.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}