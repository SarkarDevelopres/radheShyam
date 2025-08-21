"use client";

import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import styles from "../style.module.css";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BetOptions } from "../7updown/page";

/** ---------- CONFIG ---------- */
const SERVER_URL = '/'; // if you have NEXT_PUBLIC_SERVER_URL, prefer that
const GAME = "HIGH_LOW";
const TABLE_ID = "default";
const ASSETS = {
  cardBack: "/cards/cardback.png",
  "ace_hearts": "/cards/ace_of_hearts.png",
  "2_hearts": "/cards/2_of_hearts.png",
  "3_hearts": "/cards/3_of_hearts.png",
  "4_hearts": "/cards/4_of_hearts.png",
  "5_hearts": "/cards/5_of_hearts.png",
  "6_hearts": "/cards/6_of_hearts.png",
  "7_hearts": "/cards/7_of_hearts.png",
  "8_hearts": "/cards/8_of_hearts.png",
  "9_hearts": "/cards/9_of_hearts.png",
  "10_hearts": "/cards/10_of_hearts.png",
  "j_hearts": "/cards/jack_of_hearts2.png",
  "q_hearts": "/cards/queen_of_hearts2.png",
  "k_hearts": "/cards/king_of_hearts2.png",
  "ace_diamonds": "/cards/ace_of_diamonds.png",
  "2_diamonds": "/cards/2_of_diamonds.png",
  "3_diamonds": "/cards/3_of_diamonds.png",
  "4_diamonds": "/cards/4_of_diamonds.png",
  "5_diamonds": "/cards/5_of_diamonds.png",
  "6_diamonds": "/cards/6_of_diamonds.png",
  "7_diamonds": "/cards/7_of_diamonds.png",
  "8_diamonds": "/cards/8_of_diamonds.png",
  "9_diamonds": "/cards/9_of_diamonds.png",
  "10_diamonds": "/cards/10_of_diamonds.png",
  "j_diamonds": "/cards/jack_of_diamonds2.png",
  "q_diamonds": "/cards/queen_of_diamonds2.png",
  "k_diamonds": "/cards/king_of_diamonds2.png",
  "ace_spades": "/cards/ace_of_spades.png",
  "2_spades": "/cards/2_of_spades.png",
  "3_spades": "/cards/3_of_spades.png",
  "4_spades": "/cards/4_of_spades.png",
  "5_spades": "/cards/5_of_spades.png",
  "6_spades": "/cards/6_of_spades.png",
  "7_spades": "/cards/7_of_spades.png",
  "8_spades": "/cards/8_of_spades.png",
  "9_spades": "/cards/9_of_spades.png",
  "10_spades": "/cards/10_of_spades.png",
  "j_spades": "/cards/jack_of_spades2.png",
  "q_spades": "/cards/queen_of_spades2.png",
  "k_spades": "/cards/king_of_spades2.png",
  "ace_clubs": "/cards/ace_of_clubs.png",
  "2_clubs": "/cards/2_of_clubs.png",
  "3_clubs": "/cards/3_of_clubs.png",
  "4_clubs": "/cards/4_of_clubs.png",
  "5_clubs": "/cards/5_of_clubs.png",
  "6_clubs": "/cards/6_of_clubs.png",
  "7_clubs": "/cards/7_of_clubs.png",
  "8_clubs": "/cards/8_of_clubs.png",
  "9_clubs": "/cards/9_of_clubs.png",
  "10_clubs": "/cards/10_of_clubs.png",
  "j_clubs": "/cards/jack_of_clubs2.png",
  "q_clubs": "/cards/queen_of_clubs2.png",
  "k_clubs": "/cards/king_of_clubs2.png",
};
/** -------------------------------- */

const CARD_ASPECT = 160 / 224;

class HLCanvas {
  constructor(canvas, assets) {
    this.c = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D context not available");
    this.ctx = ctx;
    this.imgs = {};
    this.assets = assets;

    this.state = {
      phase: "idle",
      baseCard: null,
      nextCard: null,
      userPick: null,
      win: null,
    };

    this.cardW = 160; this.cardH = 224;
    this.slotA = { x: 140, y: 38, flip: 0 };
    this.slotB = { x: 400, y: 38, flip: 0 };

    const ratio = globalThis.devicePixelRatio || 1;
    const logicalW = this.c.width;
    const logicalH = this.c.height;
    this.c.width = logicalW * ratio;
    this.c.height = logicalH * ratio;
    this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    this._load().then(() => this.render());
  }

  async _load() {
    const load = (src) =>
      new Promise((res, rej) => {
        const i = new Image();
        i.onload = () => res(i);
        i.onerror = rej;
        i.src = src;
      });
    for (const [key, src] of Object.entries(this.assets)) {
      this.imgs[key] = await load(src);
    }
  }

  setPick(pick) { this.state.userPick = pick; this.render(); }
  startRound() {
    this.state = { phase: "bet", baseCard: null, nextCard: null, userPick: null, win: null };
    this.slotA.flip = 0; this.slotB.flip = 0;
    this.render();
  }

  revealBase(baseFaceKey) {
    this.state.phase = "revealA";
    this.state.baseCard = baseFaceKey;
    this._flip(this.slotA, () => { this.render(); });
  }

  showResult(nextFaceKey, win) {
    this.state.phase = "result";
    this.state.nextCard = nextFaceKey;
    this.state.win = (win === true);
    this._flip(this.slotB, () => { this.render(); });
  }

  reset() { this.state.phase = "idle"; this.render(); }

  _flip(slot, onMid) {
    const dur = 280;
    const t0 = performance.now();
    const step = (t) => {
      const dt = t - t0;
      slot.flip = Math.max(0, 1 - Math.min(dt, dur) / dur) * 2 - 1;
      if (Math.abs(slot.flip) < 0.02 && !slot._mid) { slot._mid = true; onMid && onMid(); }
      this.render();
      if (dt < dur) requestAnimationFrame(step);
      else { slot.flip = 0; slot._mid = false; this.render(); }
    };
    requestAnimationFrame(step);
  }

  _drawCard(slot, faceKey) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(slot.x + this.cardW / 2, slot.y + this.cardH / 2);
    const scaleX = slot.flip === 0 ? 1 : Math.sign(slot.flip) * Math.max(0.02, Math.abs(slot.flip));
    ctx.scale(scaleX, 1);

    const img = faceKey ? this.imgs[faceKey] : this.imgs.cardBack;
    if (!this.imgs[faceKey] && faceKey) {
      console.warn("Missing asset for", faceKey);
    }
    if (img) ctx.drawImage(img, -this.cardW / 2, -this.cardH / 2, this.cardW, this.cardH);
    ctx.restore();
  }

  _label(text, x, y) {
    const ctx = this.ctx;
    ctx.save();
    ctx.font = "14px system-ui";
    ctx.fillStyle = "#9AA4AF";
    ctx.textAlign = "center";
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  _computeLayout(w, h) {
    const padding = Math.max(12, Math.min(w, h) * 0.04);
    const labelSpace = 22;
    const areaW = w - padding * 2;
    const areaH = h - padding * 2 - labelSpace;

    const gap = Math.max(12, areaW * 0.06);
    const perSlotW = (areaW - gap) / 2;

    const cardHFromWidth = perSlotW / CARD_ASPECT;
    const cardH = Math.min(areaH, cardHFromWidth);
    const cardW = cardH * CARD_ASPECT;

    this.cardW = cardW;
    this.cardH = cardH;

    this.slotA.x = padding + (perSlotW - cardW) / 2;
    this.slotA.y = padding;

    this.slotB.x = padding + perSlotW + gap + (perSlotW - cardW) / 2;
    this.slotB.y = padding;

    this._labelA = { x: this.slotA.x + cardW / 2, y: this.slotA.y + cardH + 16 };
    this._labelB = { x: this.slotB.x + cardW / 2, y: this.slotB.y + cardH + 16 };
  }

  render() {
    const { ctx, c } = this;
    const ratio = globalThis.devicePixelRatio || 1;
    const w = c.width / ratio, h = c.height / ratio;
    ctx.clearRect(0, 0, w, h);

    this._computeLayout(w, h);

    const aFace = (this.state.phase === "revealA" || this.state.phase === "result") ? this.state.baseCard : null;
    const bFace = (this.state.phase === "result") ? this.state.nextCard : null;
    this._drawCard(this.slotA, aFace);
    this._drawCard(this.slotB, bFace);

    this._label("base", this._labelA.x, this._labelA.y);
    this._label("next", this._labelB.x, this._labelB.y);
  }
}

function faceKeyFromServer(card) {
  if (!card) return "";
  let rank = String(card.rank).toLowerCase();
  if (rank === "a" || rank === "ace") rank = "ace";
  const suit = String(card.suit).toLowerCase();
  return `${rank}_${suit}`;
}

export default function HighLowPage() {
  const router = useRouter();
  const canvasRef = useRef(null);
  const hlRef = useRef(null);
  const socketRef = useRef(null);
  const roundIdRef = useRef(null);

  const [round, setRound] = useState(null);
  const [locked, setLocked] = useState(false);
  const lockedRef = useRef(false);

  const [options] = useState(["HIGH", "LOW"]);
  const [bet, setBet] = useState(null);
  const [amnt, setAmnt] = useState(0);

  const [balance, setBalance] = useState(null); // optional; updated from server if provided

  // crisp canvas (square container handled via CSS)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      hlRef.current?.render?.();
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    hlRef.current = new HLCanvas(canvasRef.current, ASSETS);

    const socket = io(SERVER_URL, { transports: ["websocket"], autoConnect: true });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join", { game: GAME, tableId: TABLE_ID });
    });

    socket.on("round:start", (payload) => {
      hlRef.current?.startRound();
      const rid = payload?._id || payload?.id || payload?.roundId;
      if (rid) {
        roundIdRef.current = rid;
        setRound({ id: rid, ...payload });
      }
      if (payload?.baseCard) {
        const key = faceKeyFromServer(payload.baseCard);
        hlRef.current?.revealBase(key);
      }
      lockedRef.current = false;
      setLocked(false);
    });

    socket.on("highlow:base", (payload) => {
      const rid = payload?.roundId || payload?.id;
      if (rid) {
        roundIdRef.current = rid;
        setRound((r) => r ? { ...r, id: rid } : { id: rid });
      }
      if (payload?.baseCard) {
        const key = faceKeyFromServer(payload.baseCard);
        hlRef.current?.revealBase(key);
      }
      lockedRef.current = false;
      setLocked(false);
    });

    socket.on("round:lock", () => {
      lockedRef.current = true;
      setLocked(true);
    });

    socket.on("highlow:reveal", (payload) => {
      if (payload?.roundId) roundIdRef.current = payload.roundId;
      const nextKey = faceKeyFromServer(payload?.nextCard);
      const pick = hlRef.current?.state?.userPick;
      const outcome = String(payload?.outcome || "").toUpperCase();
      let win = null;
      if (pick && (outcome === "HIGH" || outcome === "LOW")) {
        win = outcome.toLowerCase() === pick.toLowerCase();
      }
      hlRef.current?.showResult(nextKey, win);
    });

    socket.on("round:result", (payload) => {
      if (payload?.roundId) roundIdRef.current = payload.roundId;
      const nextKey = faceKeyFromServer(payload?.nextCard);
      const pick = hlRef.current?.state?.userPick;
      const outcome = String(payload?.outcome || "").toUpperCase();
      let win = null;
      if (pick && (outcome === "HIGH" || outcome === "LOW")) {
        win = outcome.toLowerCase() === pick.toLowerCase();
      }
      hlRef.current?.showResult(nextKey, win);

      // unlock for next round will happen on round:end, but if your engine starts immediately, you can also reset here later
    });

    socket.on("round:end", () => {
      lockedRef.current = false;
      setLocked(false);
    });

    return () => {
      socket.off("round:start");
      socket.off("highlow:base");
      socket.off("round:lock");
      socket.off("highlow:reveal");
      socket.off("round:result");
      socket.off("round:end");
      socket.disconnect();
    };
  }, []);

  function isLoggedIn() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("userToken");
  }

  function getUid() {
    // if (typeof window === "undefined") return "demo-user";
    return "689ed0deca58facca988473c"
  }

  // Compatible with BetOptions → it calls onPlaceBet() with no args.
  const placeBet = async () => {
    const token = isLoggedIn();
    if (!token) {
      toast.warn("Log in to place bets!");
      router.push("/login");
      return;
    }

    // must have a selected option + amount
    if (bet === null || amnt <= 0) {
      toast.error("Select High/Low and a stake.");
      return;
    }

    const selection = options[bet]; // "HIGH" | "LOW"
    if (!selection) {
      toast.error("Invalid selection.");
      return;
    }

    if (!socketRef.current) return;

    const rid = round?.id || roundIdRef.current;
    if (!rid) {
      toast.error("Round not ready yet. Please wait a second.");
      return;
    }

    if (locked || lockedRef.current) {
      toast.warn("Betting is locked for this round.");
      return;
    }

    const s = Number(amnt);
    if (!s || s <= 0) {
      toast.error("Enter a valid stake.");
      return;
    }

    const uid = getUid();
    const market = selection.toLowerCase(); // "high" | "low"

    // local UI hint
    hlRef.current?.setPick?.(market);

    socketRef.current.emit(
      "bet:place",
      {
        userId: uid,
        roundId: rid,
        game: GAME,
        tableId: TABLE_ID,
        market,   // "high" | "low"
        stake: s,
      },
      (res) => {
        if (!res?.ok) {
          toast.error(res?.error || "Failed to place bet.");
          return;
        }
        if (typeof res.balance !== "undefined") {
          setBalance(res.balance);
        }
        setBet(null);
        setAmnt(0);
        toast.success(`Bet placed on ${selection} for ${s}.`, {
          autoClose: 3000,
          pauseOnFocusLoss: false,
        });
      }
    );
  };

  return (
    <div className={styles.mainDiv}>
      <ToastContainer />
      <h2>High Low</h2>

      <div className={styles.gameBody}>
        <div className={styles.gameDisplay}>
          <canvas className={styles.canvas} ref={canvasRef} />
        </div>

        <div className={styles.betDisplay}>
          <div className={styles.betBoxes}>
            {options.map((label, i) => (
              <BetOptions
                key={i}
                name={label}
                bet={bet}
                setBet={setBet}
                index={i}
                amnt={amnt}
                setAmnt={setAmnt}
                onPlaceBet={placeBet}   // BetOptions will call with no args
              />
            ))}
          </div>
        </div>

        <p style={{ marginTop: 10, fontSize: 12, color: "#9aa4af" }}>
          Flow: <code>round:start</code> (base shown & bets open) → <code>round:lock</code> (lock) → <code>round:result</code> (next + outcome).
        </p>
      </div>
    </div>
  );
}
