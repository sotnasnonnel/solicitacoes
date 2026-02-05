"use client";

import { useEffect } from "react";

export function FXProvider() {
  // 1) Glow que segue o mouse (atualiza variáveis CSS --mx/--my)
  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduce) return;

    let raf = 0;
    let x = 0.2;
    let y = 0.1;

    const onMove = (e: MouseEvent) => {
      const nx = e.clientX / window.innerWidth;
      const ny = e.clientY / window.innerHeight;

      // anima suave (lerp)
      const step = () => {
        x += (nx - x) * 0.08;
        y += (ny - y) * 0.08;

        document.documentElement.style.setProperty("--mx", `${(x * 100).toFixed(2)}%`);
        document.documentElement.style.setProperty("--my", `${(y * 100).toFixed(2)}%`);
        raf = requestAnimationFrame(step);
      };

      if (!raf) raf = requestAnimationFrame(step);
    };

    window.addEventListener("mousemove", onMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };
  }, []);

  // 2) Scroll reveal (qualquer elemento com class "reveal")
  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduce) return;

    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.isIntersecting) {
            (en.target as HTMLElement).classList.add("in");
            io.unobserve(en.target);
          }
        }
      },
      { threshold: 0.12 }
    );

    els.forEach((el) => io.observe(el));

    return () => io.disconnect();
  }, []);

  return null;
}
