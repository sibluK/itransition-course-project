import { Button } from "@/components/ui/button";
import { useFields } from "@/hooks/useFields";
import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { closestCorners, DndContext } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, arrayMove, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { GripVertical } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { useTranslation } from "react-i18next";

type FieldType = "sl_string" | "ml_string" | "number" | "link" | "boolean";

interface FieldConfig {
    fieldKey: string;
    label: string;
    description: string;
    isEnabled: boolean;
    displayOrder: number;
}

export default function Fields() {
    const { inventoryId } = useParams();
    const { data: fieldsData, isLoading, error, saveFields } = useFields({ inventoryId: Number(inventoryId) });
    const [fieldConfigs, setFieldConfigs] = useState<Record<string, FieldConfig>>({});
    const { t } = useTranslation();

    const FIELD_TYPES: { type: FieldType; label: string; info: string }[] = [
        { type: "sl_string", label: t("sl_string_label"), info: t("sl_string_description") },
        { type: "ml_string", label: t("ml_string_label"), info: t("ml_string_description") },
        { type: "number", label: t("number_label"), info: t("number_description") },
        { type: "link", label: t("link_label"), info: t("link_description") },
        { type: "boolean", label: t("boolean_label"), info: t("boolean_description") },
    ];

    useEffect(() => {
        setInitialData();
    }, [fieldsData]);

    const handleSave = async () => {
        const updates = Object.values(fieldConfigs)
            .map(config => ({
                fieldKey: config.fieldKey,
                label: config.label,
                description: config.description,
                isEnabled: config.isEnabled,
                displayOrder: config.displayOrder,
            }));
        await saveFields(updates);
    };

    const handleCancel = () => {
        setInitialData();
    }

    const setInitialData = () => {
        if (fieldsData) {
            const configs: Record<string, FieldConfig> = {};
            fieldsData.forEach((field: FieldConfig) => {
                configs[field.fieldKey] = {
                    fieldKey: field.fieldKey,
                    label: field.label,
                    description: field.description,
                    isEnabled: field.isEnabled,
                    displayOrder: field.displayOrder,
                };
            });
            setFieldConfigs(configs);
        }
    }

    const updateFieldConfigs = (fieldKey: string, updates: Partial<FieldConfig>) => {
        setFieldConfigs(prev => {
            const existing = prev[fieldKey] || {
                fieldKey,
                label: "",
                description: "",
                isEnabled: false,
                displayOrder: 0,
            };
            return {
                ...prev,
                [fieldKey]: { ...existing, ...updates },
            };
        });
    }

    if (isLoading) return <Spinner className="w-[40px] h-[40px] mx-auto" />;
    if (error) return <div>Error loading fields</div>;

    return (
        <div className="flex flex-col gap-5 pt-2 container">
            {FIELD_TYPES.map(({ type, label, info }) => (
                <FieldTypeSection
                    key={type}
                    type={type}
                    title={label}
                    info={info}
                    configs={fieldConfigs}
                    onChange={updateFieldConfigs}
                />
            ))}
            <div className="mt-4">
                <Button onClick={handleSave}>{t("button-save")}</Button>
                <Button variant="outline" className="ml-2" onClick={handleCancel}>{t("button-cancel")}</Button>
            </div>
        </div>
    );
}

function FieldTypeSection({ type, title, info, configs, onChange }: {
    type: FieldType;
    title: string;
    info: string;
    configs: Record<string, FieldConfig>;
    onChange: (fieldKey: string, updates: Partial<FieldConfig>) => void;
}) {
    const { t } = useTranslation();
    const [order, setOrder] = useState<string[]>([`${type}_1`, `${type}_2`, `${type}_3`]);

    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            const oldIndex = order.indexOf(active.id);
            const newIndex = order.indexOf(over.id);
            const newOrder = arrayMove(order, oldIndex, newIndex);
            setOrder(newOrder);

            newOrder.forEach((fieldKey, index) => {
                onChange(fieldKey, { displayOrder: index + 1 });
            });
        }
    };

    return (
        <>
            <div className="flex flex-wrap justify-between">
                <div>
                    <h2 className="text-xl font-semibold mb-3">{title} {t("fields")}</h2>
                    <p className="text-muted-foreground mb-2">{info}</p>
                </div>
                <div className="flex gap-5 flex-wrap">
                    <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
                        <SortableContext items={order} strategy={horizontalListSortingStrategy}>
                            {order.map(fieldKey => {
                                const config = configs[fieldKey] || {
                                    fieldKey,
                                    label: "",
                                    description: "",
                                    isEnabled: false,
                                    displayOrder: 0,
                                };

                                return (
                                    <CustomInputCard
                                        key={fieldKey}
                                        fieldKey={fieldKey}
                                        config={config}
                                        onChange={onChange}
                                    />
                                );
                            })}
                        </SortableContext>
                    </DndContext>
                </div>
            </div>
            <Separator />
        </>
    );
}

interface CardProps {
    fieldKey: string;
    config: FieldConfig;
    onChange: (fieldKey: string, updates: Partial<FieldConfig>) => void;
}

function CustomInputCard({ fieldKey, config, onChange }: CardProps) {
    const { listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: fieldKey });
    const { t } = useTranslation();
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        outline: isDragging ? '2px solid blue' : 'none',
    };

    return (
        <Card key={fieldKey} ref={setNodeRef} style={style} className="w-full md:max-w-fit">
            <CardHeader className="flex flex-row items-center gap-4">
                <Button
                    variant={"ghost"}
                    {...listeners}
                    className="text-secondary-foreground/50 cursor-grab p-0 m-0"
                    >
                    <span className="sr-only">Move task</span>
                    <GripVertical />
                </Button>
                <span className="text-lg font-medium">{config.displayOrder}</span>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <div className="flex items-center">
                    <Switch 
                        checked={config.isEnabled}
                        onCheckedChange={(checked) => onChange(fieldKey, { isEnabled: checked })}
                        className="mr-2"
                        id="is-enabled"
                    />
                    <Label htmlFor="is-enabled">{t("switch-enabled")}</Label>
                </div>
                <div>
                    <Label htmlFor="label" className="mb-1 block">{t("field-label")}:</Label>
                    <Input 
                        type="text"
                        id="label"
                        placeholder={t("field-label-placeholder")}
                        value={config.label}
                        onChange={(e) => onChange(fieldKey, { label: e.target.value })}
                        disabled={!config.isEnabled}
                    />
                </div>
                <div>
                    <Label htmlFor="label" className="mb-1 block">{t("inventory_description")}:</Label>
                    <Textarea
                        id="description"
                        placeholder={t("inv-creation-description-placeholder")}
                        value={config.description}
                        onChange={(e) => onChange(fieldKey, { description: e.target.value })}
                        disabled={!config.isEnabled}
                    />
                </div>
            </CardContent>
        </Card>
    );
}