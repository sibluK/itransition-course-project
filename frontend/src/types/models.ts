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