"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { io } from "socket.io-client";
import styles from "../style.module.css";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BetOptions } from '../7updown/page'
import { FaCaretUp, FaCaretDown } from "react-icons/fa";
import { GiClubs, GiSpades, GiHearts, GiDiamonds } from "react-icons/gi";
import { TbPlayCardOff } from "react-icons/tb";
import Spinner from 'react-bootstrap/Spinner';


/** ---------- CONFIG ---------- */
const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_PORT; // ✔ URL (https://.. or wss://..)
const GAME = "AMAR_AKBAR_ANTHONY";
const TABLE_ID = "default";

/** Card face assets */
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
function fmtSec(ms) {
  return Math.max(0, Math.ceil(ms / 1000));
}
/** ------------ Canvas (single-card) ------------ */
class AAACanvas {
  constructor(canvas, assets) {
    this.c = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D context not available");
    this.ctx = ctx;

    this.imgs = {};
    this.assets = assets;

    this.state = {
      phase: "idle",   // 'idle' | 'bet' | 'result'
      cardFaceKey: null,
      userPick: null,
      win: null,       // true/false/null
    };

    // single centered card
    this.cardW = 160; this.cardH = 224;
    this.slot = { x: 60, y: 20, flip: 0 };

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
    this.state = { phase: "bet", cardFaceKey: null, userPick: null, win: null };
    this.slot.flip = 0;
    this.render();
  }

  flipBack() {
    this.state.phase = "idle";
    // start with current face
    const oldFace = this.state.cardFaceKey;
    this._flip(this.slot, () => {
      // at midpoint, swap to back
      this.state.cardFaceKey = null;
      this.render();
    });
  }

  showResult(faceKey, win) {
    // flip from back to face
    this.state.phase = "result";
    this.state.cardFaceKey = faceKey;
    this.state.win = (win === true);
    this._flip(this.slot, () => { this.render(); });
  }

  reset() { this.state.phase = "idle"; this.render(); }

  _flip(slot, onMid) {
    const dur = 300;
    const t0 = performance.now();
    const step = (t) => {
      const dt = t - t0;
      slot.flip = Math.max(0, 1 - Math.min(dt, dur) / dur) * 2 - 1; // -1..1
      if (Math.abs(slot.flip) < 0.02 && !slot._mid) { slot._mid = true; onMid && onMid(); }
      this.render();
      if (dt < dur) requestAnimationFrame(step);
      else { slot.flip = 0; slot._mid = false; this.render(); }
    };
    requestAnimationFrame(step);
  }

  _computeLayout(w, h) {
    const padding = Math.max(12, Math.min(w, h) * 0.06);
    const areaW = w - padding * 2;
    const areaH = h - padding * 2;

    // keep card aspect 160/224
    const CARD_ASPECT = 160 / 224;
    const cardH = Math.min(areaH, areaW / CARD_ASPECT);
    const cardW = cardH * CARD_ASPECT;
    this.cardW = cardW; this.cardH = cardH;

    this.slot.x = (w - cardW) / 2;
    this.slot.y = (h - cardH) / 2;
  }

  _drawCard(slot, faceKey) {
    const ctx = this.ctx;
    const img = faceKey ? this.imgs[faceKey] : this.imgs.cardBack;

    ctx.save();
    ctx.translate(slot.x + this.cardW / 2, slot.y + this.cardH / 2);
    const scaleX = slot.flip === 0 ? 1 : Math.sign(slot.flip) * Math.max(0.02, Math.abs(slot.flip));
    ctx.scale(scaleX, 1);
    if (!this.imgs[faceKey] && faceKey) console.warn("Missing asset for", faceKey);
    if (img) ctx.drawImage(img, -this.cardW / 2, -this.cardH / 2, this.cardW, this.cardH);
    ctx.restore();
  }

  render() {
    const { ctx, c } = this;
    const ratio = globalThis.devicePixelRatio || 1;
    const w = c.width / ratio, h = c.height / ratio;
    ctx.clearRect(0, 0, w, h);

    this._computeLayout(w, h);

    const face = (this.state.phase === "result") ? this.state.cardFaceKey : null;
    this._drawCard(this.slot, face);

    // Optional status text
    ctx.save();
    ctx.font = "14px system-ui";
    ctx.fillStyle = "#9AA4AF";
    ctx.textAlign = "center";
        // ctx.restore();
  }
}

/** Helpers */
function faceKeyFromServer(card) {
  if (!card) return "";
  let rank = String(card.rank).toLowerCase();
  if (rank === "a" || rank === "ace") rank = "ace";
  const suit = String(card.suit).toLowerCase(); // hearts/diamonds/spades/clubs
  return `${rank}_${suit}`;
}

export default function AmarAkbarAnthonyPage() {
  const router = useRouter();
  const canvasRef = useRef(null);
  const aaaRef = useRef(null);
  const socketRef = useRef(null);
  const roundIdRef = useRef(null);

  function getUid() {
    // if (typeof window === "undefined") return null;
    return "689ed0deca58facca988473c";
  }
  
  const icons1 = [
  <FaCaretUp key="up" style={{ color: "red" }} />,
  <TbPlayCardOff key="snap" style={{ color: "white" }} />,
  <FaCaretDown key="down" style={{ color: "black" }} />,
];

const icons2 = [
  <React.Fragment key="black">
    <GiClubs style={{ color: "black" }} /> 
    <GiSpades style={{ color: "black" }} />
  </React.Fragment>,
  <React.Fragment key="red">
    <GiHearts style={{ color: "red" }} />
    <GiDiamonds style={{ color: "red" }} />
  </React.Fragment>,
];

const icons3 = [
  <GiClubs key="club" style={{ color: "black" }} />,
  <GiHearts key="heart" style={{ color: "red" }} />,
  <GiSpades key="spade" style={{ color: "black" }} />,
  <GiDiamonds key="diamond" style={{ color: "red" }} />,
];


  const [userId, setUserId] = useState("");

  const [options] = useState(["AMAR", "AKBAR", "ANTHONY"]);
  const [options2] = useState(["BLACK", "RED"]);
  const [options3] = useState(["CLUB", "HEARTS", "SPADES", "DIAMONDS"]);
  const [bet, setBet] = useState(null);
  const [round, setRound] = useState(null);
  const [amnt, setAmnt] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isLocked, setLocked] = useState(false);

  // canvas DPI + resize handling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      aaaRef.current?.render?.();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  // Smooth countdown tick
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(t);
  }, []);

  // socket + events
  useEffect(() => {
    if (!canvasRef.current) return;

    aaaRef.current = new AAACanvas(canvasRef.current, ASSETS);

    const socket = io(SERVER_URL, { transports: ["websocket"], autoConnect: true });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join", { game: GAME, tableId: TABLE_ID });

      // Get wallet once on connect
      const uid2 = getUid();
      if (uid2) {
        socket.emit("wallet:fetch", { userId: uid2 }, (res) => {
          if (res?.ok) {
            console.log(res);
            
            setBalance(res._doc.balance || 0)
          };
        });
      }
    });

    // Bets opened
    socket.on("round:start", (payload) => {
      setLocked(false)
      // payload likely contains {_id, game, tableId, startAt, ...}
      setLoading(false)
      roundIdRef.current = payload?._id || payload?.id || roundIdRef.current;
      setRound(payload);
      aaaRef.current?.startRound();
    });

    socket.on("round:lock", () => {
      console.log("Betting locked");
      setLoading(true)
      setLocked(true)
      setRound((prev) => (prev ? { ...prev, status: "LOCKED" } : prev));
    });

    // Final reveal/result (engine emits this with { outcome, card, roundId })
    socket.on("round:result", (payload) => {
      setLoading(false)
      if (payload?.roundId) roundIdRef.current = payload.roundId;
      const faceKey = faceKeyFromServer(payload?.card || payload?.result?.card || payload?.meta?.card);
      const pick = String(aaaRef.current?.state?.userPick || "").toUpperCase();
      const outcome = String(payload?.outcome || payload?.result?.outcome || "").toUpperCase();
      let win = null;
      if (pick && (outcome === "AMAR" || outcome === "AKBAR" || outcome === "ANTHONY")) {
        win = (pick === outcome);
      }
      // const uid2 = getUid();
      // if (uid2) {
      //   socket.emit("wallet:fetch", { userId: uid2 }, (res) => {
      //     if (res?.ok) {
      //       console.log(res);
            
      //       setBalance(res._doc.balance || 0)
      //     };
      //   });
      // }
      aaaRef.current?.showResult(faceKey, win);
    });

    // If you emit a custom channel for AAA reveal:
    socket.on("aaa:reveal", (payload) => {
      if (payload?.roundId) roundIdRef.current = payload.roundId;
      const faceKey = faceKeyFromServer(payload?.card);
      const pick = String(aaaRef.current?.state?.userPick || "").toUpperCase();
      const outcome = String(payload?.outcome || "").toUpperCase();
      let win = null;
      if (pick && (outcome === "AMAR" || outcome === "AKBAR" || outcome === "ANTHONY")) {
        win = (pick === outcome);
      }
      aaaRef.current?.showResult(faceKey, win);
    });

    return () => {
      socket.off("round:start");
      socket.off("round:result");
      socket.off("aaa:reveal");
      socket.disconnect();
    };
  }, []);

  // utils you referenced in HL page (kept same guards)
  function isLoggedIn() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("userToken");
  }
  const lockMs = useMemo(() => {
    if (!round) return 0;
    return (round.betsCloseAt ?? 0) - now;
  }, [round, now]);

  const resultMs = useMemo(() => {
    if (!round) return 0;
    return (round.resultAt ?? 0) - now;
  }, [round, now]);

  const locked = useMemo(() => {
    if (!round) return true;
    return round.status !== "OPEN" || lockMs <= 0;
  }, [round, lockMs]);
  const placeBet = async (pick, sOverride) => {
    // 1) auth
    const token = isLoggedIn?.();
    if (!token) {
      toast?.warn?.("Log in to place bets!");
      router?.push?.("/login");
      return;
    }

    // 2) pick validation (AMAR/AKBAR/ANTHONY)
    const market = String(pick || "").toUpperCase();
    if (!["AMAR", "AKBAR", "ANTHONY","BLACK","RED","HEARTS","CLUBS","SPADES","DIAMONDS"].includes(market)) {
      toast?.error?.("Select valid bet.");
      return;
    }

    // 3) socket & round checks
    if (!socketRef.current) return;

    const rid = roundIdRef.current;
    if (!rid) {
      toast?.error?.("Round not ready yet. Please wait a second.");
      return;
    }

    if (locked) {
      toast?.warn?.("Betting is locked for this round.");
      return;
    }

    // 4) stake validation
    const s = Number(sOverride ?? amnt);
    if (!s || s <= 0) {
      toast?.error?.("Enter a valid stake.");
      return;
    }

    // 5) user id
    const uid =
      (typeof getUid === "function" && getUid()) ||
      (typeof window !== "undefined" ? (localStorage.getItem("uid") || "689ed0deca58facca988473c") : "689ed0deca58facca988473c");

    // optional: show local selection highlight
    aaaRef.current?.setPick?.(market);

    // 6) send bet
    socketRef.current.emit(
      "bet:place",
      {
        userId: uid,
        roundId: rid,
        game: GAME,        // "AMAR_AKBAR_ANTHONY"
        tableId: TABLE_ID,
        market,            // "AMAR" | "AKBAR" | "ANTHONY"
        stake: s,
      },
      (res) => {
        if (!res?.ok) {
          toast?.error?.(res?.error || "Failed to place bet.");
          return;
        }
        if (typeof setBalance === "function") {
          setBalance(res.balance ?? balance);
        }
        if (typeof setAmnt === "function") setAmnt(0);

        toast?.success?.(`Bet placed on ${market} for ${s}.`, {
          autoClose: 3000,
          pauseOnFocusLoss: false,
        });
      }
    );
  };

  return (
    <div className={styles.mainDiv}>

      <h2>Amar Akbar Anthony</h2>

      <div className={styles.metaRow}>
        <div>Balance: {balance}</div>
        <div>
          {round
            ? locked
              ? `Locked · result in ${fmtSec(resultMs)}s`
              : `Closes in ${fmtSec(lockMs)}s`
            : "Waiting for round..."}
        </div>
      </div>

      <div className={styles.gameBody}>
        <div className={styles.gameDisplay}>
          {loading && <div className={styles.loadDiv}>
            <Spinner animation="border" variant="primary" className={styles.spinnerDiv} />
          </div>}
          <canvas className={styles.canvas} ref={canvasRef} />
        </div>

        <div className={styles.betDisplay}>
          <div className={styles.betBoxes}>
            {options.map((label, i) => (
              <BetOptions
                key={i}
                name={label}
                bet={bet}
                index={i}
                setBet={setBet}
                amnt={amnt}
                setAmnt={setAmnt}
                onPlaceBet={() => placeBet(label)}
                optionArray={options}
                isLocked={isLocked}
              />
            ))}
          </div>
          <div className={styles.betBoxes}>
            {options2.map((label, i) => (
              <BetOptions
                key={i}
                name={label}
                bet={bet}
                index={i}
                setBet={setBet}
                amnt={amnt}
                setAmnt={setAmnt}
                onPlaceBet={() => placeBet(label)}
                icon={icons2}
                optionArray={options2}
                isLocked={isLocked}
              />
            ))}
          </div>
          <div className={styles.betBoxes}>
            {options3.map((label, i) => (
              <BetOptions
                key={i}
                name={label}
                bet={bet}
                index={i}
                setBet={setBet}
                amnt={amnt}
                setAmnt={setAmnt}
                onPlaceBet={() => placeBet(label)}
                icon={icons3}
                optionArray={options3}
                isLocked={isLocked}
              />
            ))}
          </div>
        </div>

        <p style={{ marginTop: 10, fontSize: 12, color: "#9aa4af" }}>
          Flow: <code>round:start</code> (bets open) → <code>round:result</code> (one card + outcome; settle).
        </p>
      </div>
    </div>
  );
}
