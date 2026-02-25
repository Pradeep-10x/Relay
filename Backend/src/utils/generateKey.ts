export const generateBaseKey = (name: string): string => {
  return name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '').slice(0,4);
}