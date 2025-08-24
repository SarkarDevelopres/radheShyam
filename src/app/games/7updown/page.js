"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import styles from "../style.module.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaCaretUp, FaCaretDown, FaLock } from "react-icons/fa";
import { GiClubs, GiSpades, GiHearts, GiDiamonds } from "react-icons/gi";
import { TbPlayCard7 } from "react-icons/tb";
import Spinner from 'react-bootstrap/Spinner';

// IMPORTANT: must be a FULL URL, e.g. http://localhost:4000 or https://api.example.com
const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_PORT;

const TABLE_ID = "table-1";
// MUST MATCH what server uses for this game in engine/init code
const GAME = "SEVEN_UP_DOWN";

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

function isLoggedIn() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("userToken");
}

function getUid() {
  // if (typeof window === "undefined") return null;
  return "689ed0deca58facca988473c";
}


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

  showResult(faceKey) {
    // flip from back to face
    this.state.phase = "result";
    this.state.cardFaceKey = faceKey;
    this._flip(this.slot, () => { this.render(); });
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
    const msg =
      this.state.phase === "bet" ? "Bets open…" :
        this.state.phase === "result" ? (this.state.win === null ? "Result" : (this.state.win ? "You Win" : "You Lose")) :
          "Waiting…";
    ctx.fillText(msg, w / 2, this.slot.y + this.cardH + 18);
    ctx.restore();
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

export function BetOptions({ name, bet, icon, setBet, index, amnt, setAmnt, onPlaceBet, optionArray, isLocked }) {
  const [showStake, setShowStake] = useState(false);

  return (
    <div className={styles.betButtons}>
      <div className={styles.mainBetOption}>
        <div>
          <span>{name}</span>
          {icon ? icon[index] : <></>}
        </div>
        {isLocked ? (<button className={styles.lockedBtn}><FaLock /></button>
        ) : (<button
          onClick={() => {
            setBet(optionArray[index]);
            setShowStake(true);
          }}
          className={bet === optionArray[index] ? styles.selectedTeam : ""}
        >
          Bet
        </button>)}
      </div>

      {showStake && (
        <div className={styles.stakeDiv}>
          <div className={styles.stakeChoice}>
            {[100, 200, 300, 400, 500, 1000].map((amt) => (
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
              onClick={async () => {
                await onPlaceBet();
                setShowStake(false);
              }}
            >
              Place Bet
            </button>

            <button
              onClick={() => {
                setShowStake(false);
                setBet(null);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SevenUpDown() {
  const router = useRouter();

  const icons1 = [
  <FaCaretUp key="up" style={{ color: "red" }} />,
  <TbPlayCard7 key="snap" style={{ color: "white" }} />,
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
  <GiClubs key="club" style={{ color: "black" }} />,
  <GiHearts key="heart" style={{ color: "red" }} />,
  <GiSpades key="spade" style={{ color: "black" }} />,
  <GiDiamonds key="diamond" style={{ color: "red" }} />,
];

const icons3 = [
  <GiClubs key="club" style={{ color: "black" }} />,
  <GiHearts key="heart" style={{ color: "red" }} />,
  <GiSpades key="spade" style={{ color: "black" }} />,
  <GiDiamonds key="diamond" style={{ color: "red" }} />,
];



  const [amnt, setAmnt] = useState(0);
  const [options] = useState(["UP", "SEVEN", "DOWN"]);
  const [options2] = useState(["BLACK", "RED"]);
  const [options3] = useState(["CLUB", "HEARTS", "SPADES", "DIAMONDS"]);
  const [bet, setBet] = useState(null);

  const canvasRef = useRef(null);
  const aaaRef = useRef(null);
  const socketRef = useRef(null);
  const roundIdRef = useRef(null);
  const resultRef = useRef(null);

  const [userId, setUserId] = useState("");
  const [round, setRound] = useState(null); // { id, startAt, betsCloseAt, resultAt, endAt, status }
  const [now, setNow] = useState(Date.now());
  const [balance, setBalance] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLocked, setLocked] = useState(false);

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

  // Connect socket once
  useEffect(() => {

    if (!canvasRef.current) return;

    aaaRef.current = new AAACanvas(canvasRef.current, ASSETS);

    const socket = io(SERVER_URL, {
      transports: ["websocket"], // avoid long-poll fallbacks
    });
    socketRef.current = socket;

    const uid = getUid();
    if (uid) setUserId(uid);

    socket.on("connect", () => {
      console.log("✅ Connected:", socket.id);
      socket.emit("join", { game: GAME, tableId: TABLE_ID });

      // Get wallet once on connect
      const uid2 = getUid();
      if (uid2) {
        socket.emit("wallet:get", uid2, (res) => {
          if (res?.ok) setBalance(res.balance || 0);
        });
      }
    });

    socket.on("round:start", (r) => {
      // r should contain: id, startAt, betsCloseAt, resultAt, endAt, status
      setLoading(false)
      if (resultRef.current) resultRef.current.style.opacity = 0;
      setRound(r);
      setResult(null);
      aaaRef.current?.flipBack()
    });

    socket.on("round:lock", () => {
      console.log("Betting locked");
      setLoading(true)
      setLocked(true)
      setRound((prev) => (prev ? { ...prev, status: "LOCKED" } : prev));
    });

    // Expecting server to emit dice details for 7updown
    socket.on("round:result", (res) => {
      setLoading(false)

      if (res?.roundId) roundIdRef.current = res.roundId;
      const faceKey = faceKeyFromServer(res?.card || res?.result?.card || res?.meta?.card);
      const pick = String(aaaRef.current?.state?.userPick || "").toUpperCase();
      const outcome = String(res?.outcome || res?.result?.outcome || "").toUpperCase();
      aaaRef.current?.showResult(faceKey);
      setLocked(false)
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    return () => {
      socket.off(); // remove all listeners
      socket.disconnect();
    };
  }, []); // <-- IMPORTANT: empty deps; don’t depend on userId

  // Derived countdowns (align with engine fields: betsCloseAt, resultAt)
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

  async function placeBet() {
    const token = isLoggedIn();
    if (!token) {
      alert("Log in to place bets!");
      router.push("/login");
      return;
    }
    setLocked(true)
    if (bet === null || amnt <= 0) {
      alert("Select an option and stake amount.");
      return;
    }

    const selection = bet;
    if (!socketRef.current) return;
    if (!round?.id) {
      toast.error("Round not ready yet. Please wait a second.");
      return;
    }
    if (locked) {
      toast.warn("Betting is locked for this round.");
      return;
    }

    const s = Number(amnt);
    if (!s || s <= 0) {
      toast.error("Enter a valid stake.");
      return;
    }

    // Use your real user id here; demo hardcode only if server accepts it
    const uid = getUid();

    socketRef.current.emit(
      "bet:place",
      {
        userId: uid, // replace with your actual authenticated id
        roundId: round.id,
        game: GAME,
        tableId: TABLE_ID,
        market: selection, // 'UP' | 'DOWN' | 'SEVEN'
        stake: s,
      },
      (res) => {
        if (!res?.ok) {
          alert(res?.error || "Failed to place bet.");
          return;
        }
        setBalance(res.balance ?? balance);
        setBet(null);
        setAmnt(0);
        toast.success(`Bet placed on ${selection} for ${s}.`, {
          autoClose: 3000,
          pauseOnFocusLoss: false,
        });
      }
    );
  }

  return (
    <div className={styles.mainDiv}>

      <h2>7 Up Down</h2>

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
          <div ref={resultRef} className={styles.resultDiv}>
            <span>{result}</span>
          </div>
        </div>
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
              onPlaceBet={placeBet}
              icon={icons1}
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
              onPlaceBet={placeBet}
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
              onPlaceBet={placeBet}
              icon={icons3}
              optionArray={options3}
              isLocked={isLocked}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default SevenUpDown;
