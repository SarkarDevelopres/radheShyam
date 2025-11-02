"use client";
import { useEffect, useRef, useState } from "react";
import styles from "../style.module.css";
import { io } from "socket.io-client";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_PORT;
const GAME = "AVIATOR";
const TABLE_ID = "table-1";


export default function AviatorGame() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const resetRef = useRef(null);
  const multiplierRef = useRef(1);
  const socketRef = useRef(null);
  const crashRef = useRef(null);

  const [amnt, setAmnt] = useState(0);
  const [bet, setBet] = useState(0);
  const [locked, setLocked] = useState(false);
  const [viewers, setViewers] = useState(2);
  const [round, setRound] = useState({});
  const [isCrashed, setIsCrashed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerWidth * 1.8)

    // images
    const planeImg = new Image();
    planeImg.src = "/plane.png";
    const bgFar = new Image(); bgFar.src = "/bg_mountains_far.png";
    const bgNear = new Image(); bgNear.src = "/bg_mountains_near.png";

    // motion lines
    const lines = [];
    const lineCount = 30;
    for (let i = 0; i < lineCount; i++) {
      lines.push({
        x: Math.random() * w,
        y: Math.random() * h,
        length: 40 + Math.random() * 60,
        speed: 1.5 + Math.random() * 2.5,
        alpha: 0.25 + Math.random() * 0.75,
      });
    }

    // plane physics / state
    let planeX = w * 0.4;
    let planeY = h * 0.8;
    let t = 0;
    let baseY = planeY;

    // crash state + physics
    let crashed = false;
    let planeGone = false;    // after it falls below screen
    let vy = 0;               // vertical velocity
    let vx = 0;               // horizontal velocity during crash
    let rotation = 0;        // radians
    let angularVel = 0;      // rotation speed
    let alpha = 1;           // fade out
    let explosionParticles = []; // optional particles on initial crash

    // parallax
    let farX = 0, nearX = 0;

    // Helper: spawn explosion particles (very simple)
    function spawnExplosion(x, y) {
      explosionParticles = [];
      const count = 18;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6;
        const speed = 2 + Math.random() * 4;
        explosionParticles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 60 + Math.random() * 30,
          size: 3 + Math.random() * 4,
          alpha: 1,
        });
      }
    }

    // Trigger crash: call from socket event or button
    function triggerCrash() {
      if (crashed || planeGone) return;
      crashed = true;

      // initial stall impulse (slightly up) then gravity takes over
      vy = -2 - Math.random() * 2;
      vx = 1 - Math.random() * 2; // slight horizontal jitter
      angularVel = 0.08 + Math.random() * 0.08; // start rotating
      spawnExplosion(planeX + 75, planeY); // explosion at plane nose
    }
    crashRef.current = triggerCrash;
    // For demo: crash on click
    canvas.addEventListener("click", () => triggerCrash());

    function updateExplosion() {
      for (let p of explosionParticles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08; // small gravity for particles
        p.life--;
        p.alpha = Math.max(0, p.life / 90);
      }
      // discard dead
      explosionParticles = explosionParticles.filter(p => p.life > 0);
    }

    // main draw
    function draw() {
      ctx.clearRect(0, 0, w, h);

      // sky gradient
      const grd = ctx.createLinearGradient(0, 0, 0, h);
      grd.addColorStop(0, "#021B79");
      grd.addColorStop(1, "#0575E6");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);

      // parallax move
      farX -= 0.18;
      nearX -= 0.48;
      if (farX <= -w) farX = 0;
      if (nearX <= -w) nearX = 0;

      if (bgFar.complete) {
        const scale = 0.7;
        ctx.drawImage(bgFar, farX, h - bgFar.height * scale, w, bgFar.height * scale);
        ctx.drawImage(bgFar, farX + w, h - bgFar.height * scale, w, bgFar.height * scale);
      }
      if (bgNear.complete) {
        const scale = 0.65;
        ctx.drawImage(bgNear, nearX, h - bgNear.height * scale, w, bgNear.height * scale);
        ctx.drawImage(bgNear, nearX + w, h - bgNear.height * scale, w, bgNear.height * scale);
      }

      // Draw motion lines (full screen)
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#fff";
      for (let l of lines) {
        ctx.globalAlpha = l.alpha;
        ctx.beginPath();
        ctx.moveTo(l.x, l.y);
        ctx.lineTo(l.x - l.length, l.y);
        ctx.stroke();

        // update x based on multiplier (so lines speed up as multiplier increases)
        l.x -= l.speed * (0.5 + multiplierRef.current / 4);
        if (l.x + l.length < 0) {
          l.x = w + Math.random() * 200;
          l.y = Math.random() * h; // span full screen
          l.speed = 2 + Math.random() * 6;
          l.alpha = 0.25 + Math.random() * 0.75;
        }
      }
      ctx.globalAlpha = 1;

      // --- Flight logic ---
      if (!crashed) {
        // normal ascending + oscillation, multiplier simulated by time
        // multiplierRef.current = Math.min(50, 1 + t / 500); // fake multiplier for demo

        const multiplier = multiplierRef.current;
        baseY = h * 0.6 - Math.log(multiplier + 1) * 150;
        planeY = baseY - Math.sin(t / 200) * 28;
        planeX = w * 0.1 + Math.log(multiplier + 1) * 50;
      } else {
        // --- Crash physics ---
        // gravity grows to feel sharp fall
        const gravity = 0.9;      // stronger gravity for sharp fall
        vy += gravity;            // accelerate down
        planeY += vy;
        planeX += vx;             // horizontal drift during fall
        rotation += angularVel;   // tumble

        // increase rotation speed gradually (chaotic)
        angularVel *= 1.02;

        // fade out as it falls
        alpha -= 0.01;
        if (alpha < 0) alpha = 0;

        // slow down global motion lines a bit to emphasize crash
        for (let l of lines) l.x -= 0.6; // small screen shift to make background continue
      }

      // draw explosion particles (on crash moment and while alive)
      if (explosionParticles.length > 0) {
        updateExplosion();
        for (let p of explosionParticles) {
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = "#ffcc33";
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      // draw plane (with rotation and alpha if crashed)
      if (!planeGone && planeImg.complete) {
        const planeW = 150;
        const planeH = 150;
        ctx.save();
        ctx.globalAlpha = alpha;

        // move origin to plane center for rotation
        ctx.translate(planeX + planeW / 2, planeY);
        ctx.rotate(rotation);
        ctx.drawImage(planeImg, -planeW / 2, -planeH / 2, planeW, planeH);

        ctx.restore();
      }

      // draw multiplier text (top-left)
      ctx.font = "bold 48px Poppins, sans-serif";
      ctx.fillStyle = "#fff";
      ctx.fillText(`${multiplierRef.current.toFixed(2)}x`, 50, 100);

      // when plane is completely below screen, consider it gone
      if (planeY - 200 > h && crashed) {
        planeGone = true;
        // you can emit a socket event here or call a callback to notify backend round ended
        // e.g. socket.emit('round:crash', { roundId });
      }

      t += 16;
      rafRef.current = requestAnimationFrame(draw);
    }

    // Wait for images then start
    Promise.all([
      new Promise((res) => (planeImg.onload = res)),
      new Promise((res) => (bgFar.onload = res)),
      new Promise((res) => (bgNear.onload = res)),
    ]).then(() => {
      rafRef.current = requestAnimationFrame(draw);
    });

    // resize handler
    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    function resetGame() {
    crashed = false;
    planeGone = false;
    alpha = 1;
    rotation = 0;
    vx = 0;
    vy = 0;
    explosionParticles = [];
    multiplierRef.current = 1; // reset multiplier
    planeX = w * 0.1;
    planeY = h * 0.6;
  }

  resetRef.current = resetGame;

    // cleanup
    return () => {
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("click", triggerCrash);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {

    const socket = io(SERVER_URL, { transports: ["websocket"], autoConnect: true });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join", { game: GAME, tableId: TABLE_ID });
    });

    socket.on("round:start", (payload) => {

      console.log("START: ", payload);
      setViewers(payload.viewers);
      // setLoading(false);


      const rid = payload?._doc?._id;
      // console.log("ROOM ID: ", rid);

      // if (rid) roundRef.current = rid;
      setRound({ id: rid, ...payload._doc });
    });

    socket.on("aviator:update", (multiplier) => {
      console.log("Multiplier Data: ",multiplier);
      
      multiplierRef.current = multiplier.multiplier;
    });

    socket.on("aviator:crash", (data) => {
      console.log("Crashed: ",data);
      
      crashRef.current();
      setIsCrashed(true)
      setLocked(true)

    });

    socket.on("round:end", () => {
      if (!isCrashed) {
        crashRef.current();
      }
      setLocked(false);
      resetRef.current();
    });

    return () => {
      socket.off(); socket.disconnect();
    };
  }, []);


  return (
    <div className="w-screen h-screen overflow-hidden position-relative">
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className={styles.totalPlaying}>{viewers}</div>
      <div className={styles.aviatorBettingArea}>
        <div className={styles.stakeDiv}>
          <div className={styles.stakeChoice}>
            {[20, 50, 100, 300, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000].map((amt) => (
              <button
                key={amt}
                onClick={() => setAmnt(amt)}
                className={amnt === amt ? styles.selectedStake : ""}
              >
                {amt}
              </button>
            ))}
          </div>
          <div className={styles.placeBtn}>
            <button
              // onClick={async () => {
              //   await onPlaceBet();
              // }}
              style={{ backgroundColor: "#0ac900ff", padding: 10, borderRadius: 10, color: "#ffffffff", fontWeight: 600, fontSize: 22, border: "none", outline: "none" }}
            >
              Place Bet
            </button>

            <button
              style={{ backgroundColor: "#0ac900ff", padding: 10, borderRadius: 10, color: "#ffffffff", fontWeight: 600, fontSize: 22, border: "none", outline: "none" }}
              onClick={() => {
                setBet(null);
              }}
            >
              Cash In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
