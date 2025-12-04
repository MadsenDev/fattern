export function LoadingScreen({ progress = 0 }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-900 text-white">
      <div className="flex items-center gap-4">
        <img src="/fattern-monogram.svg" alt="Fattern" className="h-16 w-16 drop-shadow-2xl" />
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
  );
}