import Link from "next/link";

export default function Home() {
  return (
    <div 
      className="relative flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat font-sans"
      style={{ backgroundImage: "url('/gokuldham-bg.png')" }}
    >
      {/* Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      <main className="relative z-10 flex w-full max-w-4xl flex-col items-center justify-center p-8 text-center sm:p-16">
        <div className="mb-12 space-y-4">
          <h1 className="text-5xl font-extrabold tracking-tight md:text-6xl lg:text-7xl text-white drop-shadow-lg">
            Welcome to <span className="text-blue-400">Society</span>Pro
          </h1>
          <p className="mx-auto max-w-2xl text-lg md:text-xl text-zinc-200">
            A digital platform for seamless society management and a vibrant community life.
          </p>
        </div>

        <div className="flex w-full flex-col gap-6 sm:max-w-md sm:flex-row justify-center">
          <Link 
            href="/admin/login"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white hover:bg-blue-700"
          >
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Admin Login
            </div>
          </Link>

          <Link 
            href="/resident/login"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/10 px-8 py-4 font-semibold text-white backdrop-blur-md border border-white/20 hover:bg-white/20"
          >
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Client Login
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
