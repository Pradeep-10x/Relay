export const extractMentions = (text: string) => {
    const regex = /@([a-zA-Z0-9_]+)/g;
    const matches = [...text.matchAll(regex)];
    return matches.map((m) => m[1]);
};