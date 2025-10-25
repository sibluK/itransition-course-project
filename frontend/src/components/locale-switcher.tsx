import { useTranslation } from "react-i18next";
import { supportedLngs } from "../i18n/config.ts";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function LocaleSwitcher() {
    const { i18n } = useTranslation();

    return (
        <Select value={i18n.resolvedLanguage} onValueChange={(value) => i18n.changeLanguage(value)}>
            <SelectTrigger className="w-[120px]">
                <SelectValue placeholder={supportedLngs[i18n.resolvedLanguage as keyof typeof supportedLngs || 'en']} />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    {Object.entries(supportedLngs).map(([code, name]) => (
                        <SelectItem value={code} key={code}>
                            {name}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}