import { useEffect, useState } from 'react';
import { LuSun, LuMoon } from 'react-icons/lu';
import { Button } from './button';

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(
    () =>
      localStorage.getItem('theme') === 'dark' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <Button
      onClick={() => setIsDark(prev => !prev)}
      className="p-2 rounded bg-primary text-primary-foreground hover:opacity-90 transition"
      aria-label="Toggle dark mode"
    >
      {isDark ? <LuMoon size={20} /> : <LuSun size={20} />}
    </Button>
  );
}
