import Logo from '@/components/auth/logo';
import Selectors from '@/components/navbar/Selectors';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden p-6 md:p-10">
      {/* Background image */}
      <div className="absolute inset-0 bg-[url('/images/auth-bg2.jpg')] bg-cover bg-center bg-no-repeat" />

      {/* Overlay */}
      <div className="absolute inset-0 bg-white/95 dark:bg-black/90" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-sm">
        <Logo />
        {children}
        <Selectors />
      </div>
    </div>
  );
}

