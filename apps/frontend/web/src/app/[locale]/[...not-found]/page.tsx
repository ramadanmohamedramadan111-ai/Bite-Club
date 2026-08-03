import type { Metadata } from 'next';
import React from 'react';
import NotFound from '../not-found';

export default function page() {
  return <NotFound />;
}



export const metadata: Metadata = {
  title: "Page Not Found | Bite Club",
  description: "The page you are looking for does not exist on Bite Club.",
};
