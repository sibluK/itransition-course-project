import { boolean, integer, pgTable, varchar, index, numeric, pgEnum, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const fieldTypeEnum = pgEnum('field_type', [
    'sl_string',
    'ml_string',
    'number',
    'link',
    'boolean',
]);

export const inventoriesTable = pgTable("inventories", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    creatorId: varchar({ length: 255 }).notNull(),
    title: varchar({ length: 255 }).notNull(),
    description: varchar({ length: 1024 }),
    image_url: varchar({ length: 255 }),
    categoryId: integer(),
    isPublic: boolean().notNull().default(false),
    version: integer().notNull().default(1),
    updatedAt: timestamp().notNull().defaultNow(),
    createdAt: timestamp().notNull().defaultNow(),
    },
    (table) => [
        index("inventory_search_idx").using(
            "gin",
            sql`(
                setweight(to_tsvector('english', ${table.title}), 'A') ||
                setweight(to_tsvector('english', ${table.description}), 'B')
            )`,
        ),
        index("title_idx").on(table.title),
    ],
);

export const categoriesTable = pgTable("categories", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull()
});

export const tagsTable = pgTable("tags", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull()
    },
    (table) => [
        uniqueIndex("tags_name_unique_idx").on(sql`lower(${table.name})`),
        index("tags_name_idx").on(table.name),
    ],
);

export const inventoryTagsTable = pgTable("inventory_tags", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    inventoryId: integer().notNull().references(() => inventoriesTable.id, { onDelete: 'cascade' }),
    tagId: integer().notNull().references(() => tagsTable.id, { onDelete: 'cascade' }),
    },
    (table) => [
        uniqueIndex("inventory_tags_unique_idx").on(table.inventoryId, table.tagId),
    ],
);

export const inventoryWriteAccessTable = pgTable("inventory_write_access", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    inventoryId: integer().notNull().references(() => inventoriesTable.id, { onDelete: 'cascade' }),
    userId: varchar({ length: 255 }).notNull(),
});

export const itemsTable = pgTable("items", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    inventoryId: integer().notNull().references(() => inventoriesTable.id, { onDelete: 'cascade' }),
    c_sl_string_1: varchar({ length: 255 }),
    c_sl_string_2: varchar({ length: 255 }),
    c_sl_string_3: varchar({ length: 255 }),
    c_ml_string_1: varchar({ length: 1024 }),
    c_ml_string_2: varchar({ length: 1024 }),
    c_ml_string_3: varchar({ length: 1024 }),
    c_number_1: numeric(),
    c_number_2: numeric(),
    c_number_3: numeric(),
    c_link_1: varchar({ length: 255 }),
    c_link_2: varchar({ length: 255 }),
    c_link_3: varchar({ length: 255 }),
    c_boolean_1: boolean(),
    c_boolean_2: boolean(),
    c_boolean_3: boolean(),
    updatedAt: timestamp().notNull().defaultNow(),
    createdAt: timestamp().notNull().defaultNow(),
});

export const customFieldsTable = pgTable("custom_fields", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    customId: varchar({ length: 255 }).notNull(),
    inventoryId: integer().notNull().references(() => inventoriesTable.id, { onDelete: 'cascade'}),
    fieldKey: varchar({ length: 255 }).notNull(),
    fieldType: fieldTypeEnum().notNull(),
    label: varchar({ length: 255 }).notNull(),
    isEnabled: boolean().notNull().default(false),
    displayOrder: integer().notNull().default(0),
});