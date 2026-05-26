import { TitleBar } from './TitleBar';

export function LoadingScreen({ progress = 0 }) {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <TitleBar variant="dark" title="Fattern" />
      <div className="flex flex-1 items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, rgba(4,14,10,1) 0%, rgba(8,28,18,1) 50%, rgba(4,14,10,1) 100%)' }}>
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-white/10 blur-xl" />
          <div className="relative rounded-2xl bg-white/5 p-3 backdrop-blur-sm">
            <img
              src="/fattern-monogram.svg"
              alt="Fattern"
              className="h-16 w-16 drop-shadow-2xl"
              style={{ filter: 'brightness(1.1) contrast(1.1)' }}
            />
          </div>
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-white/70">Starter opp</p>
          <p className="text-3xl font-semibold">Fattern</p>
        </div>
      </div>
      <div className="mt-10 w-72">
        <div className="h-2 rounded-full bg-white/30">
          <div
            className="h-full rounded-full bg-white transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-3 text-center text-xs uppercase tracking-widest text-white/70 animate-pulse">
          Initialiserer · {Math.round(progress)}%
        </p>
      </div>
      </div>
    </div>
  );
}