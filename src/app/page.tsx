import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-navy flex items-center justify-center">
      <div className="max-w-[440px] w-full mx-auto min-h-screen bg-cream flex flex-col items-center justify-center px-6 py-12">
        {/* Decorative circles */}
        <div className="absolute top-16 left-8 w-20 h-20 rounded-full bg-coral opacity-20 pointer-events-none" />
        <div className="absolute top-32 right-6 w-12 h-12 rounded-full bg-lemon opacity-30 pointer-events-none" />
        <div className="absolute bottom-24 left-12 w-16 h-16 rounded-full bg-mint opacity-20 pointer-events-none" />

        <div className="text-center">
          <p className="text-coral font-bold text-sm tracking-widest uppercase mb-3">
            Georgetown, Penang
          </p>
          <h1 className="text-navy font-black text-5xl leading-tight mb-4">
            The<br />PlayGround
          </h1>
          <p className="text-ink/60 text-lg mb-8">
            8 zones · 100 games · 5 museums
          </p>
          <Link
            href="/login"
            className="inline-block bg-coral text-white font-bold text-sm px-8 py-4 border-2 border-ink"
            style={{ boxShadow: '4px 4px 0px #1A1A1A' }}
          >
            ENTER TEAM CODE
          </Link>
        </div>
      </div>
    </div>
  );
}
