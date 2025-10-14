    export type SeoCheck = {
        id: string;
        label: string;
        ok: boolean;
        score: number;  
        hint?: string;
        weight?: number;   
    };
    
    export type SeoScoreResult = {
        score: number; 
        checks: SeoCheck[];
        good: SeoCheck[];
        warn: SeoCheck[];
        bad:  SeoCheck[];
        meta: {
            totalWords: number;
            density: number;      
            avgSentenceLen: number; 
            titleLen: number;
            slugLen: number;
            descLen: number;
            kwCount: number;
        };
    };