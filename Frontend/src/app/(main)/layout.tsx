import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-black">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* 3D Box & String Background — spans from nav downward */}
        <div aria-hidden className="absolute inset-x-0 top-0 h-full overflow-hidden pointer-events-none z-0 opacity-[0.15] dark:opacity-[0.1]">
          <svg className="absolute w-full h-[120%] -top-24" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1000 1000">
            <defs>
              <g id="layoutBox3d">
                <polygon points="0,-40 60,-10 0,20 -60,-10" className="fill-zinc-200 dark:fill-zinc-800 stroke-zinc-400 dark:stroke-zinc-600" strokeWidth="2" strokeLinejoin="round" />
                <polygon points="-60,-10 0,20 0,80 -60,50" className="fill-zinc-300 dark:fill-zinc-700 stroke-zinc-400 dark:stroke-zinc-600" strokeWidth="2" strokeLinejoin="round" />
                <polygon points="0,20 60,-10 60,50 0,80" className="fill-zinc-100 dark:fill-zinc-900 stroke-zinc-400 dark:stroke-zinc-600" strokeWidth="2" strokeLinejoin="round" />
              </g>
            </defs>
            <polyline points="200,200 300,120 400,180 500,100 600,160 700,240 750,350 850,450" fill="none" className="stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="2" strokeDasharray="8 8" strokeLinejoin="round" />
            <polyline points="850,450 880,560 820,620 870,700 780,760 700,720 500,800 400,850 300,850" fill="none" className="stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="2" strokeDasharray="8 8" strokeLinejoin="round" />
            <polyline points="300,850 240,770 180,700 120,620 100,530 140,440 170,350 200,200" fill="none" className="stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="2" strokeDasharray="8 8" strokeLinejoin="round" />
            <circle cx="530" cy="180" r="4" className="fill-white dark:fill-black stroke-zinc-400 dark:stroke-zinc-600" strokeWidth="2" />
            <circle cx="750" cy="680" r="4" className="fill-white dark:fill-black stroke-zinc-400 dark:stroke-zinc-600" strokeWidth="2" />
            <circle cx="150" cy="550" r="4" className="fill-white dark:fill-black stroke-zinc-400 dark:stroke-zinc-600" strokeWidth="2" />
            <g transform="translate(200, 200)"><use href="#layoutBox3d" /></g>
            <g transform="translate(850, 450)"><use href="#layoutBox3d" /></g>
            <g transform="translate(300, 850)"><use href="#layoutBox3d" /></g>
          </svg>
        </div>

        <Navbar />
        <main className="flex-1 overflow-y-auto w-full relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
}
