"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Capacitor } from '@capacitor/core';

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (Capacitor.isNativePlatform()) {
      router.replace('/splash');
    } else {
      router.replace('/portal');
    }
  }, [router]);

  if (!mounted) return null;
  return null;
}
