import React from 'react';
import { TypographyH1 } from '../typography/h1';

export default function Logo() {
  return (
    <div className="mb-4 flex items-center justify-center gap-3">
      <div className="flex aspect-square size-10 items-center justify-center overflow-hidden">
        <img src="/logo.png" alt="Bite Club" className="size-full object-cover" />
      </div>
      <TypographyH1 className="bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent">BiteClub</TypographyH1>
    </div>
  );
}