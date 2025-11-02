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
const GAME = "ANDAR_BAHAR_CLASSIC";
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
        this.lastDrawnIndex = 0;

        this.state = {
            phase: "idle", // bet | reveal | result
            joker: null,
            andar: null,
            bahar: null,
            winner: null,
            userPick: null,
        };
        this.andarSlots = [];
        this.baharSlots = [];
        // Flip states
        this.slotJ = { x: 0, y: 0, flipProgress: 1, face: "back" };

        this.totalSlots = 14


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
        const padding = Math.max(12, Math.min(w, h) * 0.06);
        const areaW = w - padding * 2;
        const areaH = h - padding * 2;
        const CARD_ASPECT = 160 / 224;
        const cardJY = (areaW / CARD_ASPECT) / 3.5;
        const cardJX = cardJY * CARD_ASPECT;

        this.cardJH = cardJY;
        this.cardJW = cardJX;

        this.cardH = Math.min(h * 0.20, 180);
        this.cardW = this.cardH * (120 / 170);

        const cx = w / 2;
        const gap = this.cardW * 1.8;

        this.slotJ.x = (w - this.cardJW) / 2;
        this.slotJ.y = (h - this.cardJH) / 2;

        let topRowHeight = h * 0.04;
        let rowFirstCardWidth = this.cardW + this.cardW * 0.2;
        let rowFirstCardX = gap / 7
        let rowDifferFactor = this.cardH * 0.58

        let baharRowFirstCardX = cx + (this.cardJW / 2) + rowFirstCardX;


        const totalSlots = 14;
        const cols = 2; // two columns per row
        const rows = totalSlots / cols;

        for (let i = 0; i < totalSlots; i++) {
            const col = i % cols;                 // 0 or 1
            const row = Math.floor(i / cols);     // 0–6

            // --- Andar (A-side) ---
            const slotAName = `slotA${i + 1}`;
            const ax = rowFirstCardWidth * col + rowFirstCardX;
            const ay = topRowHeight + rowDifferFactor * row;
            this[slotAName] = { x: ax, y: ay, flipProgress: 0, face: "back" };

            // --- Bahar (B-side) ---
            const slotBName = `slotB${i + 1}`;
            const bx = rowFirstCardWidth * col + baharRowFirstCardX;
            const by = topRowHeight + rowDifferFactor * row;
            this[slotBName] = { x: bx, y: by, flipProgress: 0, face: "back" };
        }

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
    setPick(pick) { this.state.userPick = pick }
    startRound() {
        this.state = {
            phase: "bet",
            joker: null,
            andar: null,
            bahar: null,
            winner: null,
        };
        this.andarSlots = [];
        this.baharSlots = [];
        this.lastDrawnIndex = 0;
        this._clear();
        this.render();
    }

    showJoker(faceKey) {
        this.state.phase = "revealJoker";
        this._animateFlip(this.slotJ, faceKey, "joker");
    }

    showResult(winner) {
        this.state.phase = "end";
        const rect = this.c.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;
        const ctx = this.ctx
        ctx.font = `${Math.round(this.cardH / 6)}px system-ui`;
        ctx.fillStyle = "#ffffffff";
        ctx.textAlign = "center";
        ctx.fillText(
            `${winner} Wins`,
            (w / 2),
            (h / 2 - h / 4)
        );
    }

    showDeck(andarKey, baharKey, index) {
        this.state.phase = "result";
        this.andarSlots.push(andarKey);
        this.lastDrawnIndex = index + 1;
        let andarSlotName = `slotA${index + 1}`;
        let baharSlotName = `slotB${index + 1}`;

        setTimeout(() => {
            this._animateFlip(this[andarSlotName], andarKey, "normal", () => {
                this._animateFlip(this[baharSlotName], baharKey, "normal");
            });
        }, 300);
    }

    /** ---------- Flip Animation Core ---------- */
    _animateFlip(slot, faceKey, type, next) {
        let start = null;
        const duration = 400;
        const bg = this.ctx.getImageData(0, 0, this.c.width, this.c.height);



        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const elapsed = timestamp - start;
            const progress = Math.min(elapsed / duration, 1);
            slot.flipProgress = progress;
            // console.log("SLOT: ",slot);

            this.ctx.putImageData(bg, 0, 0);
            if (type == "joker") {
                this._clear();
                this._drawJoker(slot, progress < 0.5 ? "cardBack" : faceKey, progress);

            }
            else {
                this._drawCard(slot, progress < 0.5 ? "cardBack" : faceKey, progress);
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this._drawCard(slot, faceKey, 1);
                if (type == "joker") {
                    this._drawJoker(slot, faceKey, 1);
                    this.ctx.font = `${Math.round(this.cardH / 6)}px system-ui`;
                    this.ctx.fillStyle = "#acacacbb";
                    this.ctx.textAlign = "center";
                    this.ctx.fillText(
                        "Joker",
                        this.slotJ.x + this.cardW,
                        this.slotJ.y + this.cardJH + this.cardJH * 0.2
                    );
                }
                else {
                    this._drawCard(slot, faceKey, 1);
                    this.ctx.font = `${Math.round(this.cardH / 6)}px system-ui`;
                    this.ctx.fillStyle = "#acacacbb";
                    this.ctx.textAlign = "center";
                    this.ctx.fillText(
                        "Andar",
                        this.slotA1.x + this.cardW,
                        this.slotA1.y - 2
                    );

                    this.ctx.fillText(
                        "Bahar",
                        this.slotB1.x + this.cardW,
                        this.slotB1.y - 2
                    );
                    if (this.lastDrawnIndex == 0) {
                        for (let i = 0; i < this.andarSlots.length; i++) {
                            let slotAName = `slotA${i + 1}`;
                            let slotBName = `slotB${i + 1}`;
                            this._drawCard(this[slotAName], this.state.andar);
                            this._drawCard(this[slotBName], this.state.bahar);
                        }
                    }
                    next && next();
                }
            }
        };

        requestAnimationFrame(animate);

    }

    /** ---------- Rendering ---------- */

    _drawJoker(slot, faceKey) {
        const ctx = this.ctx;

        const progress = slot.flipProgress ?? 1;
        const angle = progress * Math.PI; // 0 → π
        const scaleX = Math.cos(angle);

        ctx.save();
        ctx.translate(slot.x + this.cardJW / 2, slot.y + this.cardJH / 2);
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
                -this.cardJW / 2,
                -this.cardJH / 2,
                this.cardJW,
                this.cardJH
            );
        }
        ctx.restore();
    }

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
        this._computeLayout();

        this._drawJoker(this.slotJ, this.state.joker);
        ctx.font = `${Math.round(this.cardH / 6)}px system-ui`;
        ctx.fillStyle = "#acacacbb";
        ctx.textAlign = "center";
        ctx.fillText(
            "Joker",
            this.slotJ.x + this.cardW,
            this.slotJ.y + this.cardJH + this.cardJH * 0.2
        );

    }

    _clear() {
        const ctx = this.ctx;
        const { width, height } = this.c.getBoundingClientRect();
        ctx.clearRect(0, 0, width, height);
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
    const [loading, setLoading] = useState(false);
    const [andarBahar, setAndarBahar] = useState(false)

    const [viewers, setViewers] = useState(1);
    const [winners, setWinners] = useState(0);
    const [losers, setLosers] = useState(0);

    const [lastGameResult, setLastGameResult] = useState([])

    const [options] = useState(["ANDAR", "BAHAR"]);
    const [options2] = useState(["ODD", "EVEN"]);
    const [options3] = useState(["BLACK", "RED"]);
    const [options4] = useState(["CLUBS", "HEARTS", "SPADES", "DIAMONDS"]);

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
            if (payload.resultList) {
                let cardImgList = [];
                for (let i = 0; i < payload.resultList.length; i++) {
                    if (payload.resultList[i] == "ANDAR") {
                        cardImgList.push('/andar-card.png')
                    } else {
                        cardImgList.push('/bahar-card.png')
                    }
                }
                setLastGameResult([...cardImgList]);
            }
            setLoading(false);
            setLocked(false)


            const rid = payload?._doc?._id || payload?.id || payload?.roundId;
            // console.log("ROOM ID: ", rid);

            if (rid) roundRef.current = rid;
            setRound({ id: rid, ...payload._doc });
        });

        socket.on("round:showJoker", (payload) => {
            console.log("PAYLOAD2: ", payload);
            const jokerKey = faceKeyFromServer(payload?.joker);
            // console.log(jokerKey);

            abRef.current?.showJoker(jokerKey);

            let pick = abRef.current.state.userPick
            const odd = payload?.joker.val % 2 == 0 ? false : true;
            const suit = String(payload?.joker.suit).toUpperCase();
            const group = String(payload?.joker).toUpperCase()

            const win = [group, suit].includes(pick) || pick == "ODD" && odd || pick == "EVEN" && !odd;

            console.log("Is Win ?: ", win);
            abRef.current.state.userPick = null;
            setLocked(false);
            setLoading(false);
            setAndarBahar(true);
        });

        socket.on("round:lock", () => {
            setLocked(true);
            setLoading(true);
        });

        socket.on("round:revealDeck", (payload) => {
            console.log("CARDS: ", payload);
            setLoading(false);
            const andarKey = faceKeyFromServer(payload?.andarCard);
            const baharKey = faceKeyFromServer(payload?.baharCard);
            const index = payload?.index;
            abRef.current.andarSlots.push(andarKey);
            abRef.current.baharSlots.push(baharKey);
            abRef.current.showDeck(andarKey, baharKey, index);
        })

        socket.on("round:result", (payload) => {
            console.log("RESULT:", payload);
            setLoading(false);
            setTimeout(() => abRef.current?.showResult(payload?.winner), 700);

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
            setAndarBahar(false);
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

    function isLoggedIn() {
        if (typeof window === "undefined") return null;
        return localStorage.getItem("userToken");
    }

    const lockMs = useMemo(() => (round ? (round.betsCloseAt ?? 0) - now : 0), [round, now]);
    const resultMs = useMemo(() => (round ? (round.resultAt ?? 0) - now : 0), [round, now]);
    // const locked = useMemo(() => !round || round.status !== "OPEN" || lockMs <= 0, [round, lockMs]);

    const placeBet = async () => {
        const token = isLoggedIn();
        if (!token) {
            toast.error("Log in to place bets!");
            router.push("/login");
            return;
        }
        if (isLocked) {
            toast.warn("Betting locked!");
            return;
        }
        if (!bet || amnt <= 0) {
            toast.error("Select bet and amount");
            return;
        }

        const selection = bet;
        const uid = localStorage.getItem("userToken");
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
            <h2>Andar Bahar</h2>

            <div className={styles.metaRow}>
                {round
                    ? isLocked
                        ? `Locked · result in few seconds}s`
                        : `Closes in ${fmtSec(lockMs)}s`
                    : "Waiting for round..."}
            </div>
            <div className={styles.metaRow}>
                {lastGameResult.length == 0
                    ? "Entered Mid Game, Wait until Round Ends"
                    : ""}
            </div>

            <div className={styles.gameBody}>
                <div className={styles.gameDisplayAnadarBaharClassic}>
                    {loading && (
                        <div className={styles.loadDiv}>
                            <Spinner animation="border" variant="primary" className={styles.spinnerDiv} />
                        </div>
                    )}
                    <canvas className={styles.canvasAnadarBaharClassic} ref={canvasRef} />
                    <div className={styles.playingViewersDiv}>
                        <div style={{ color: "#057a22ff" }}>
                            <span>Won:</span>
                            <IoPerson />
                            <span>{winners}</span>
                        </div>
                        <div style={{ width: "100px", color: "#fff" }}>
                            <span>Playing:</span>
                            <IoPerson />
                            <span>{viewers}</span>
                        </div>
                        <div style={{ color: "#740d0dff" }}>
                            <span>Lost:</span>
                            <IoPerson />
                            <span>{losers}</span>
                        </div>
                    </div>
                    <div className={styles.playingViewersDiv}>
                        {lastGameResult.length > 0 ? lastGameResult.map((e, i) => (
                            <img key={i} src={e} alt="result card" width={20} />
                        )) : <sapn>Fetching previous game results...</sapn>}
                    </div>
                </div>

                <div className={styles.betDisplay}>
                    {andarBahar && <div className={styles.betBoxes}>
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
                                isLocked={isLocked}
                            />
                        ))}
                    </div>}
                    {!andarBahar &&
                        <>
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
                        </>
                    }
                </div>
            </div>
        </div>
    );
}
