import Image from 'next/image';
import Logo from '@/components/auth/Logo';
import Selectors from '@/components/navbar/Selectors';
import authBg from '@/assets/images/auth/auth-bg.jpg';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden p-6 md:p-10">
      {/* Background image */}
      <Image src={authBg} alt="" fill priority className="object-cover" />

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

