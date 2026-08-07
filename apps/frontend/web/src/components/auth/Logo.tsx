import React from 'react';
import { TypographyH1 } from '../typography/h1';

export default function Logo() {
  return (
    <div className="mb-4 flex items-center justify-center gap-3">
      <div className="flex aspect-square size-10 items-center justify-center overflow-hidden">
        <img src="/logo.png" alt="Bite Club" className="size-full object-cover" />
      </div>
      <TypographyH1 className="text-primary">BiteClub</TypographyH1>
    </div>
  );
}