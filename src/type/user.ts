export type Gender = "male" | "female" | "other";
export type Role = "customer" | "owner" | "admin";

export interface User {
    id: number;               
    name: string;                 
    email: string;                  
    password_hash: string;       
    phone?: string | null;        
    gender?: Gender | null;      
    dateOfBirth?: Date | null;   
    avatarUrl?: string | null;   
    address?: string | null;     
    referralCode?: string | null;   
    referralBy?: string | null;  
    rewardBalance: number;          
    role: Role;                   
    createdAt: Date;       
    updatedAt: Date;               
    // Optional social/verification fields (may be provided by backend)
    provider?: string | null;
    providerId?: string | null;
    emailVerified?: boolean;
    phoneVerified?: boolean;
}

export interface LoginAdminRequest {
    email: string;
    password_hash: string;
}

export type Me = { 
    id: number; 
    name?: string; 
    email?: string 
    role: string; 
    avatarUrl?: string;
    phone?: string;
    // Optional fields mirrored for richer UI
    provider?: string | null;
    providerId?: string | null;
    emailVerified?: boolean;
    phoneVerified?: boolean;
};

export interface LoginUserRequest {
    // email hoặc số điện thoại
    identifier: string;
    password_hash: string;
}

export interface resLoginUser {
    message?: string;
    user?: User;
    expiresIn?: string;
    accessToken?: string;
}

export interface RegisterUserRequest {
    name?: string;
    phone?: string;
    email?: string;
    password_hash?: string;
    confirmPassword?: string;
    agree?: boolean;
}

export interface resRegisterUser {
    message?: string;
    user?: User;
}