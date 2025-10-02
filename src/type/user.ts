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
};