"use client";
import React, { useEffect, useRef, useState, useMemo } from "react";
import { io } from "socket.io-client";
import styles from "../style.module.css";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BetOptions } from "../7updown/page";
import { GiSpikedDragonHead, GiTigerHead, GiClubs, GiSpades, GiHearts, GiDiamonds } from "react-icons/gi";
import { IoPerson } from "react-icons/io5";
import { TbPlayCardOff } from "react-icons/tb";
import Spinner from "react-bootstrap/Spinner";

/** ---------- CONFIG ---------- */
const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_PORT;
const GAME = "ANDAR_BAHAR";
const TABLE_ID = "table-1";

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

/** ---------- Helper ---------- */
function fmtSec(ms) {
  return Math.max(0, Math.ceil(ms / 1000));
}
function faceKeyFromServer(card) {
  if (!card) return "";
  let rank = String(card.rank).toLowerCase();
  if (rank === "a" || rank === "ace") rank = "ace";
  const suit = String(card.suit).toLowerCase();
  return `${rank}_${suit}`;
}

/** ---------- Canvas ---------- */
class AndarBaharCanvas {
  constructor(canvas, assets) {
    this.c = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D context not available");
    this.ctx = ctx;
    this.imgs = {};
    this.assets = assets;

    this.state = {
      phase: "idle", // bet | reveal | result
      joker: null,
      andar: null,
      bahar: null,
      winner: null,
      userPick: null,
    };

    // Flip states
    this.slotJ = { x: 0, y: 0, flipProgress: 1, face: "back" };
    this.slotA = { x: 0, y: 0, flipProgress: 1, face: "back" };
    this.slotB = { x: 0, y: 0, flipProgress: 1, face: "back" };

    this.cardW = 120;
    this.cardH = 170;

    this._load().then(() => {
      this._setDPR();
      this._computeLayout();
      this.render();
    });
  }

  /** ---------- DPR / Layout ---------- */
  _setDPR() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.c.getBoundingClientRect();
    this.c.width = rect.width * dpr;
    this.c.height = rect.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  _computeLayout() {
    const rect = this.c.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    this.cardH = Math.min(h * 0.4, 180);
    this.cardW = this.cardH * (120 / 170);

    const cx = w / 2;
    const topY = h * 0.05;
    const bottomY = h * 0.5;
    const gap = this.cardW * 1.8;

    this.slotJ.x = cx - this.cardW / 2;
    this.slotJ.y = topY;
    this.slotA.x = gap / 5;
    this.slotA.y = bottomY;
    this.slotB.x = cx + gap / 5;
    this.slotB.y = bottomY;
  }

  /** ---------- Asset Loader ---------- */
  _load() {
    const load = (src) =>
      new Promise((res, rej) => {
        const i = new Image();
        i.onload = () => res(i);
        i.onerror = rej;
        i.src = src;
      });
    return Promise.all(
      Object.entries(this.assets).map(([k, v]) =>
        load(v).then((img) => (this.imgs[k] = img))
      )
    );
  }

  /** ---------- Game Phases ---------- */
  setPick(pick) { this.state.userPick = pick; this.render(); }
  startRound() {
    this.state = {
      phase: "bet",
      joker: null,
      andar: null,
      bahar: null,
      winner: null,
    };
    this.render();
  }

  showJoker(faceKey) {
    this.state.phase = "revealJoker";
    this._animateFlip(this.slotJ, () => {
      this.state.joker = faceKey;
    });
  }

  showResult(andarKey, baharKey, winner) {
    this.state.phase = "result";
    this._animateFlip(this.slotA, () => {
      this.state.andar = andarKey;
    });
    setTimeout(() => {
      this._animateFlip(this.slotB, () => {
        this.state.bahar = baharKey;
        this.state.winner = winner;
      });
    }, 300);
  }

  /** ---------- Flip Animation Core ---------- */
  _animateFlip(slot, onMid) {
    let start = null;
    const duration = 400;

    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      slot.flipProgress = progress;

      // mid-flip face change
      if (progress >= 0.5 && !slot._mid) {
        slot._mid = true;
        onMid && onMid();
      }

      this.render();
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        slot.flipProgress = 1;
        slot._mid = false;
        this.render();
      }
    };

    requestAnimationFrame(animate);
  }

  /** ---------- Rendering ---------- */
  _drawCard(slot, faceKey) {
    const ctx = this.ctx;
    const progress = slot.flipProgress ?? 1;
    const angle = progress * Math.PI; // 0 → π
    const scaleX = Math.cos(angle);

    ctx.save();
    ctx.translate(slot.x + this.cardW / 2, slot.y + this.cardH / 2);
    ctx.scale(scaleX, 1);

    const showBack = progress < 0.5;
    const imgKey = showBack ? "cardBack" : faceKey;
    const img = this.imgs[imgKey] || this.imgs.cardBack;



    if (img) {
      const isFront = !showBack && scaleX < 0;
      if (isFront) {
        // Flip horizontally once more so image isn’t mirrored
        ctx.scale(-1, 1);
      }
      ctx.drawImage(
        img,
        -this.cardW / 2,
        -this.cardH / 2,
        this.cardW,
        this.cardH
      );
    }
    ctx.restore();
  }

  render() {
    const ctx = this.ctx;
    const { width, height } = this.c.getBoundingClientRect();
    ctx.clearRect(0, 0, width, height);
    this._computeLayout();

    this._drawCard(this.slotA, this.state.andar);
    this._drawCard(this.slotJ, this.state.joker);
    this._drawCard(this.slotB, this.state.bahar);

    ctx.font = `${Math.round(this.cardH / 8)}px system-ui`;
    ctx.fillStyle = "#9AA4AF";
    ctx.textAlign = "center";
    ctx.fillText(
      "Andar",
      this.slotA.x + this.cardW / 2,
      this.slotA.y + this.cardH + 20
    );
    ctx.fillText(
      "Joker",
      this.slotJ.x + this.cardW / 2,
      this.slotJ.y + this.cardH + 20
    );
    ctx.fillText(
      "Bahar",
      this.slotB.x + this.cardW / 2,
      this.slotB.y + this.cardH + 20
    );
  }
}



export default function AndarBaharPage() {
  const router = useRouter();
  const canvasRef = useRef(null);
  const abRef = useRef(null);
  const socketRef = useRef(null);
  const roundRef = useRef(null);

  const icons1 = [
    <GiSpikedDragonHead key="dragon" style={{ color: "red" }} />,
    <TbPlayCardOff key="snap" style={{ color: "white" }} />,
    <GiTigerHead key="tiger" style={{ color: "orange" }} />,
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
    <React.Fragment key="clubs-spades">
      <GiClubs style={{ color: "black" }} />
      <GiSpades style={{ color: "black" }} />
    </React.Fragment>,
    <React.Fragment key="hearts-diamonds">
      <GiHearts style={{ color: "red" }} />
      <GiDiamonds style={{ color: "red" }} />
    </React.Fragment>,
  ];

  const icons4 = [
    <GiClubs key="club" style={{ color: "black" }} />,
    <GiHearts key="heart" style={{ color: "red" }} />,
    <GiSpades key="spade" style={{ color: "black" }} />,
    <GiDiamonds key="diamond" style={{ color: "red" }} />,
  ];

  const icons5 = [
    <GiClubs key="club" style={{ color: "black" }} />,
    <GiHearts key="heart" style={{ color: "red" }} />,
    <GiSpades key="spade" style={{ color: "black" }} />,
    <GiDiamonds key="diamond" style={{ color: "red" }} />,
  ];

  const [bet, setBet] = useState(null);
  const [amnt, setAmnt] = useState(0);
  const [round, setRound] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [isLocked, setLocked] = useState(true);
  const [loading, setLoading] = useState(true);

  const [viewers, setViewers] = useState(1);
  const [winners, setWinners] = useState(0);
  const [losers, setLosers] = useState(0);

  const [options] = useState(["ANDAR", "TIE", "BAHAR"]);
  const [options2] = useState(["ANDAR BLACK", "ANDAR RED"]);
  const [options3] = useState(["BAHAR BLACK", "BAHAR RED"]);
  const [options4] = useState(["ANDAR CLUBS", "ANDAR HEARTS", "ANDAR SPADES", "ANDAR DIAMONDS"]);
  const [options5] = useState(["BAHAR CLUBS", "BAHAR HEARTS", "BAHAR SPADES", "BAHAR DIAMONDS"]);

  // resize canvas crisp
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => {
      abRef.current?._computeLayout?.();
      abRef.current?.render?.();
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);


  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    abRef.current = new AndarBaharCanvas(canvasRef.current, ASSETS);

    const socket = io(SERVER_URL, { transports: ["websocket"], autoConnect: true });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join", { game: GAME, tableId: TABLE_ID });
      // console.log("Connected to AndarBahar");
    });

    socket.on("round:start", (payload) => {
      console.log("START: ", payload);
      canvasRef.current.style.backgroundColor = "#0b1920";
      abRef.current?.startRound();
      setViewers(payload.viewers);
      setLosers(0);
      setWinners(0);
      setLoading(false);


      const rid = payload?._id || payload?.id || payload?.roundId;
      // console.log("ROOM ID: ", rid);

      if (rid) roundRef.current = rid;
      setRound({ id: rid, ...payload });
    });

    socket.on("andarbahar:joker", (payload) => {
      // console.log("PAYLOAD2: ", payload);
      const jokerKey = faceKeyFromServer(payload?.joker);
      // console.log(jokerKey);

      abRef.current?.showJoker(jokerKey);
      setLocked(false);
    });

    socket.on("round:lock", () => {
      setLocked(true);
      setLoading(true);
    });

    socket.on("round:result", (payload) => {
      console.log("RESULT:", payload);
      setLoading(false);

      const deriveGroup = (suit) => {
        const s = String(suit).toUpperCase();
        if (s === "HEARTS" || s === "DIAMONDS") return "RED";
        if (s === "CLUBS" || s === "SPADES") return "BLACK";
        return "";
      };
      // const jokerKey = faceKeyFromServer(payload?.joker);
      const andarKey = faceKeyFromServer(payload?.andarCard);
      const baharKey = faceKeyFromServer(payload?.baharCard);

      const andarSuit = payload?.andarCard.suit.toUpperCase();
      const baharSuit = payload?.baharCard.suit.toUpperCase();

      const andarGroup = deriveGroup(andarSuit);
      const baharGroup = deriveGroup(baharSuit);

      const winner = String(payload?.winner || "").toUpperCase();
      let pick = abRef.current.state.userPick;
      let win = false;
      if (pick == winner) win = true;
      else if (pick === "ANDAR_RED" && andarGroup == "RED") win = true;
      else if (pick === "ANDAR_BLACK" && andarGroup == "BLACK") win = true;
      else if (pick === "BAHAR_RED" && baharGroup == "RED") win = true;
      else if (pick === "BAHAR_BLACK" && baharGroup == "BLACK") win = true;
      else if (pick === `ANDAR_${andarSuit}`) win = true;
      else if (pick === `BAHAR_${baharSuit}`) win = true;

      setTimeout(() => abRef.current?.showResult(andarKey, baharKey, winner), 700);

      setWinners(payload.winners)
      setLosers(payload.losers)

      try {
        if (canvasRef.current && abRef.current.state.userPick) {
          canvasRef.current.style.transition = "background-color 300ms ease";
          canvasRef.current.style.backgroundColor = win ? "#057a22ff" : "#740d0dff";
        }
      } catch (_) { }
    });

    socket.on("round:end", () => {
      setLocked(false);
      abRef.current?.startRound();
    });

    return () => {
      socket.off(); socket.disconnect();
    };
  }, []);

  function normalizeBetName(bet) {
    if (!bet) return "";
    return String(bet)
      .trim()              // remove extra spaces
      .toUpperCase()       // TIGER HEARTS
      .replace(/\s+/g, "_"); // TIGER_HEARTS
  }

  const lockMs = useMemo(() => (round ? (round.betsCloseAt ?? 0) - now : 0), [round, now]);
  const resultMs = useMemo(() => (round ? (round.resultAt ?? 0) - now : 0), [round, now]);
  const locked = useMemo(() => !round || round.status !== "OPEN" || lockMs <= 0, [round, lockMs]);

  const placeBet = async () => {
    if (locked) {
      toast.warn("Betting locked!");
      return;
    }
    if (!bet || amnt <= 0) {
      toast.error("Select bet and amount");
      return;
    }

    const selection = bet; // "HIGH" | "LOW"
    const uid = localStorage.getItem("userToken") || "demo-user";
    const rid = round?.id || roundRef.current;
    const lowerBet = selection.toLowerCase(); // "high" | "low"
    const market = normalizeBetName(lowerBet);

    socketRef.current.emit(
      "bet:place",
      { userId: uid, roundId: rid, game: GAME, tableId: TABLE_ID, market, stake: Number(amnt) },
      (res) => {
        if (!res?.ok) return toast.error(res?.error || "Failed");
        toast.success(`Bet ${bet} ₹${amnt} placed`);
        setLocked(true);
        abRef.current.setPick(market)
        setBet(null); setAmnt(0);
      }
    );
  };

  return (
    <div className={styles.mainDiv}>
      <h2>Andar Bahar Lite</h2>

      <div className={styles.metaRow}>
        {round
          ? locked
            ? `Locked · result in ${fmtSec(resultMs)}s`
            : `Closes in ${fmtSec(lockMs)}s`
          : "Waiting for round..."}
      </div>

      <div className={styles.gameBody}>
        <div className={styles.gameDisplay}>
          {loading && (
            <div className={styles.loadDiv}>
              <Spinner animation="border" variant="primary" className={styles.spinnerDiv} />
            </div>
          )}
          <canvas className={styles.canvas} ref={canvasRef} />
          <div className={styles.playingViewersDiv}>
            <div style={{color:"#057a22ff"}}>
              <span>Won:</span>
              <IoPerson/>
              <span>{winners}</span>
            </div>
            <div style={{width:"100px", color:"#fff"}}>
              <span>Playing:</span>
              <IoPerson/>
              <span>{viewers}</span>
            </div>
            <div style={{color:"#740d0dff"}}>
              <span>Lost:</span>
              <IoPerson/>
              <span>{losers}</span>
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
                setBet={setBet}
                index={i}
                amnt={amnt}
                setAmnt={setAmnt}
                onPlaceBet={placeBet}
                optionArray={options}
                icon={icons1}
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
                setBet={setBet}
                index={i}
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
                setBet={setBet}
                index={i}
                amnt={amnt}
                setAmnt={setAmnt}
                onPlaceBet={placeBet}
                icon={icons3}
                optionArray={options3}
                isLocked={isLocked}
              />
            ))}
          </div>
          <div className={styles.betBoxes}>
            {options4.map((label, i) => (
              <BetOptions
                key={i}
                name={label}
                bet={bet}
                setBet={setBet}
                index={i}
                amnt={amnt}
                setAmnt={setAmnt}
                onPlaceBet={placeBet}   // BetOptions will call with no args
                icon={icons4}
                optionArray={options4}
                isLocked={isLocked}
              />
            ))}
          </div>
          <div className={styles.betBoxes}>
            {options5.map((label, i) => (
              <BetOptions
                key={i}
                name={label}
                bet={bet}
                setBet={setBet}
                index={i}
                amnt={amnt}
                setAmnt={setAmnt}
                onPlaceBet={placeBet}   // BetOptions will call with no args
                icon={icons5}
                optionArray={options5}
                isLocked={isLocked}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
