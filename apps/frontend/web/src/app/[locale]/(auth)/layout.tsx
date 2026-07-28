import Image from 'next/image';
import Logo from '@/components/auth/Logo';
import Selectors from '@/components/navbar/Selectors';
import authBg from '@/assets/images/auth/auth-bg.jpg';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden p-6 md:p-10 bg-background bg-dot-pattern">
      {/* Ambient background glow blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Styled background image with grayscale mix-blend-overlay */}
      <div className="absolute inset-0 z-0 opacity-15 dark:opacity-10 pointer-events-none">
        <Image 
          src={authBg} 
          alt="" 
          fill 
          priority 
          className="object-cover grayscale" 
        />
        {/* Soft overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/70 to-background" />
      </div>

      {/* Content card container */}
      <div className="relative z-10 w-full max-w-md animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="mb-4 flex justify-center">
          <Logo />
        </div>
        {children}
        <Selectors />
      </div>
    </div>
  );
}
