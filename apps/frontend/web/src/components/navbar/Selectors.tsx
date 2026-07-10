import React from 'react';
import { LanguageSelector } from './LanguageSelector';
import { ThemeSelector } from './ThemeSelector';

export default function Selectors() {
  return (
    <div className="my-4 flex items-center justify-center gap-1">
      <LanguageSelector />
      <ThemeSelector />
    </div>
  );
}

