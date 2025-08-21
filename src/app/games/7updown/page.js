"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import styles from "../style.module.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// IMPORTANT: must be a FULL URL, e.g. http://localhost:4000 or https://api.example.com
const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_PORT ;

const TABLE_ID = "table-1";
// MUST MATCH what server uses for this game in engine/init code
const GAME = "SEVEN_UP_DOWN";

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

export function BetOptions({ name, bet, setBet, index, amnt, setAmnt, onPlaceBet }) {
  const [showStake, setShowStake] = useState(false);
  return (
    <div className={styles.betButtons}>
      <div className={styles.mainBetOption}>
        <span>{name}</span>
        <button
          onClick={() => {
            setBet(index);
            setShowStake(true);
          }}
          className={bet === index ? styles.selectedTeam : ""}
        >
          Bet
        </button>
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

  const [amnt, setAmnt] = useState(0);
  const [options] = useState(["UP", "SEVEN", "DOWN"]);
  const [bet, setBet] = useState(null);

  const socketRef = useRef(null);
  const resultRef = useRef(null);

  const [userId, setUserId] = useState("");
  const [round, setRound] = useState(null); // { id, startAt, betsCloseAt, resultAt, endAt, status }
  const [now, setNow] = useState(Date.now());
  const [balance, setBalance] = useState(0);
  const [result, setResult] = useState(null);

  // Smooth countdown tick
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(t);
  }, []);

  // Connect socket once
  useEffect(() => {
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
      if (resultRef.current) resultRef.current.style.opacity = 0;
      setRound(r);
      setResult(null);
      toast.info("Round started, place bets!", {
        autoClose: 2000,
        pauseOnFocusLoss: false,
      });
    });

    socket.on("round:lock", () => {
      console.log("Betting locked");
      toast.warn("Betting locked.", {
        autoClose: 3000,
        pauseOnFocusLoss: false,
      });
      setRound((prev) => (prev ? { ...prev, status: "LOCKED" } : prev));
    });

    // Expecting server to emit dice details for 7updown
    socket.on("round:result", ({ roundId, d1, d2, total, outcome }) => {
      setResult(total);
      if (resultRef.current) resultRef.current.style.opacity = 1;

      const uid3 = getUid();
      if (uid3) {
        socket.emit("wallet:get", uid3, (res) => {
          if (res?.ok) setBalance(res.balance || 0);
        });
      }
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

    if (bet === null || amnt <= 0) {
      alert("Select an option and stake amount.");
      return;
    }

    const selection = options[bet];
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
          <video key={round?.id || "loop"} autoPlay muted playsInline loop>
            <source src="../dice-roll.mp4" type="video/mp4" />
          </video>
          <div ref={resultRef} className={styles.resultDiv}>
            <span>{result}</span>
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
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SevenUpDown;
