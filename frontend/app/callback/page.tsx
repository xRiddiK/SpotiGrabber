'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (!code) {
      router.replace('/');
      return;
    }

    fetch('/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.access_token) {
          router.replace(`/?access_token=${data.access_token}`);
        } else {
          router.replace('/');
        }
      })
      .catch(() => {
        router.replace('/');
      });
  }, [router]);

  return <p>Loading...</p>;
}