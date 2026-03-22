import fs from 'fs';

const PATH = 'src/app/(main)/dashboard/page.tsx';

let content = fs.readFileSync(PATH, 'utf-8');

// The Storeshop -> Editorial Noir Regex Mapping Pipeline
const mappings = [
    { from: /bg-\[#1c1c1e\]/g, to: 'bg-white dark:bg-zinc-950 shadow-sm' }, 
    { from: /border-\[#2c2c2e\]/g, to: 'border-zinc-200 dark:border-zinc-800' },
    { from: /text-white/g, to: 'text-zinc-900 dark:text-white' },
    { from: /text-zinc-400/g, to: 'text-zinc-500 dark:text-zinc-400' },
    { from: /text-zinc-300/g, to: 'text-zinc-700 dark:text-zinc-300' },
    { from: /text-zinc-200/g, to: 'text-zinc-800 dark:text-zinc-200' },
    { from: /bg-gradient-to-br from-\[#8b5cf6\] to-\[#6d28d9\]/g, to: 'bg-zinc-900 dark:bg-zinc-100' },
    { from: /bg-\[#8b5cf6\]/g, to: 'bg-zinc-900 dark:bg-zinc-100' },
    { from: /text-\[#8b5cf6\]/g, to: 'text-zinc-900 dark:text-zinc-100' },
    { from: /bg-\[rgba\(139,92,246,0\.1\)\]/g, to: 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100' },
    { from: /bg-\[#2c2c2e\]/g, to: 'bg-zinc-100 dark:bg-zinc-900' },
    { from: /bg-\[#202022\]/g, to: 'bg-zinc-50 dark:bg-zinc-900/50' },
    { from: /bg-indigo-500\/10 text-indigo-400 border border-indigo-500\/20/g, to: 'bg-zinc-100 text-zinc-900 border border-zinc-200 dark:bg-zinc-900/60 dark:text-zinc-300 dark:border-zinc-800' },
    { from: /bg-emerald-500\/10 text-emerald-400 border border-emerald-500\/20/g, to: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30' },
    { from: /bg-amber-500\/10 text-amber-400 border border-amber-500\/20/g, to: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30' },
    { from: /stroke-\[#8b5cf6\]/g, to: 'stroke-zinc-900 dark:stroke-zinc-100' },
    { from: /stroke-\[#6d28d9\]/g, to: 'stroke-zinc-400 dark:stroke-zinc-500' },
    { from: /stroke-\[rgba\(255,255,255,0\.15\)\]/g, to: 'stroke-zinc-200 dark:stroke-zinc-800' }
];

// Reverting text-white text-zinc-900 dark:text-white to simple
mappings.forEach(map => {
    content = content.replace(map.from, map.to);
});

// Since some classes like text-zinc-900 dark:text-white could get multiplied, fix duplicates
content = content.replace(/text-zinc-500 dark:text-zinc-400 dark:text-zinc-500 dark:text-zinc-400/g, 'text-zinc-500 dark:text-zinc-400');
content = content.replace(/text-zinc-900 dark:text-white dark:text-white/g, 'text-zinc-900 dark:text-white');

fs.writeFileSync(PATH, content);
console.log('Successfully aligned Dashboard Aesthetic Map!');
