import React, { useEffect, useRef } from "react";

export default function Confetti() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const W = canvas.width = window.innerWidth;
    const H = canvas.height = window.innerHeight;
    const colors = ["#ff7a3d", "#f5b73c", "#20a66a", "#5b8def", "#e45b5b", "#a76fe0"];
    const pieces = Array.from({ length: 140 }, () => ({
      x: Math.random() * W, y: -20 - Math.random() * H * 0.6,
      r: 4 + Math.random() * 5, c: colors[Math.floor(Math.random() * colors.length)],
      speed: 2 + Math.random() * 3, drift: Math.random() * 2 - 1,
      rot: Math.random() * 360, spin: Math.random() * 8 - 4,
    }));
    let raf, frame = 0;
    function draw() {
      frame++;
      ctx.clearRect(0, 0, W, H);
      pieces.forEach(p => {
        p.y += p.speed; p.x += p.drift; p.rot += p.spin;
        ctx.save();
        ctx.translate(p.x, p.y); ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6);
        ctx.restore();
      });
      if (frame < 170) raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} className="confettiCanvas" />;
}
