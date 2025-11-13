export interface User {
    id: string;
    name: string;
    email: string;
    joinedAt: Date;
    imageUrl: string;
    lastLogin: Date;
    role: 'admin' | 'user';
    status: 'active' | 'blocked';
}

export type AccessUser = Omit<User, 'lastLogin' | 'role' | 'status' | 'joinedAt'>;

export interface Inventory {
    id: number;
    creatorId: string;
    title: string;
    description?: string;
    image_url?: string;
    categoryId?: number;
    isPublic: boolean;
    version: number;
    updatedAt: Date;
    createdAt: Date;
}

export interface Category {
    id: number;
    name: string;
}

export interface Tag {
    id: number;
    name: string;
}

export interface Item {
    id: number;
    inventoryId: number;
    customId?: string;
    c_sl_string_1?: string;
    c_sl_string_2?: string;
    c_sl_string_3?: string;
    c_ml_string_1?: string;
    c_ml_string_2?: string;
    c_ml_string_3?: string;
    c_number_1?: number;
    c_number_2?: number;
    c_number_3?: number;
    c_link_1?: string;
    c_link_2?: string;
    c_link_3?: string;
    c_boolean_1?: boolean;
    c_boolean_2?: boolean;
    c_boolean_3?: boolean;
    version: number;
    updatedAt: Date;
    createdAt: Date;
}

export type FieldType = 'sl_string' | 'ml_string' | 'number' | 'link' | 'boolean';

export interface CustomField {
    id: number;
    inventoryId: number;
    fieldKey: string;
    fieldType: FieldType;
    label: string;
    description: string;
    isEnabled: boolean;
    displayOrder: number;
}

export interface InventoryWithCategoryAndTags {
    inventory: Inventory;
    category: Category;
    tags: Tag[];
}

export interface DiscussionPost {
    id: number;
    inventoryId: number;
    userId: string;
    userEmail: string;
    userImageUrl: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

export type HomeInventory = Pick<Inventory, 'id' | 'title' | 'description'> & {
    user: AccessUser;
}

export interface HomeInventoriesResponse {
    latestInventories: HomeInventory[];
    popularInventories: HomeInventory[];
}

export interface InventoryUpdatePayload {
    id: number;
    version: number;
    image_url?: string;
    title: string;
    description?: string;
    categoryId?: number;
    isPublic: boolean;
    tags: string[];
}