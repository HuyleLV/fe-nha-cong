export function toSlug(input: string): string {
  if (!input) return "";
  return input
    .normalize("NFD")            
    .replace(/[\u0300-\u036f]/g, "")  
    .toLowerCase()
    .replace(/đ/g, "d")             
    .replace(/[^a-z0-9\s-]/g, "")    
    .trim()
    .replace(/[\s_-]+/g, "-")          
    .replace(/^-+|-+$/g, "");          
}
