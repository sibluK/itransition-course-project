import { Popover } from "@radix-ui/react-popover";
import { useState } from "react";
import { PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "./ui/command";

interface AutocompleteProps {
    suggestions: string[];
    value: string[];
    onChange: (value: string[]) => void;
    placeholder: string;
    search: string;
    onSearchChange: (value: string) => void;
}

export function Autocomplete({ suggestions, value, onChange, placeholder, search, onSearchChange }: AutocompleteProps) {
    const [open, setOpen] = useState(false);

    const addTag = (tag: string) => {
        if (!tag) return;
        if (!value.includes(tag)) {
            onChange([...value, tag]);
        }
        setOpen(false);
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button 
                    variant="outline" 
                    className="w-full justify-start overflow-hidden"
                    onClick={() => setOpen(true)}
                >
                    {placeholder}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
                <Command>
                    <CommandInput 
                        value={search}
                        onValueChange={onSearchChange}
                        placeholder={placeholder}
                    />
                    <CommandEmpty className="p-3 text-sm">No results.</CommandEmpty>
                    <CommandGroup>
                        {suggestions.map((suggestion) => (
                            <CommandItem 
                                key={suggestion}
                                onSelect={() => addTag(suggestion)}
                            >
                                {suggestion}
                            </CommandItem> 
                        ))}
                    </CommandGroup>
                    {search && !suggestions.includes(search) && (
                        <div className="p-2 border-t">
                            <button
                                type="button"
                                className="w-full text-left text-sm"
                            onClick={() => addTag(search)}
                            >
                            Add "{search}"
                            </button>
                        </div>
                    )}
                </Command>
            </PopoverContent>
        </Popover>
    );
}