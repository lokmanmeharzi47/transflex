"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Capacitor } from '@capacitor/core';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      router.replace('/splash');
    } else {
      router.replace('/portal');
    }
  }, [router]);

  return null;
}
