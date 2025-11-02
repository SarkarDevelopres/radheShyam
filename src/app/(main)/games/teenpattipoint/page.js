"use client";
import React, { useEffect, useRef, useState, useMemo } from "react";
import { io } from "socket.io-client";
import styles from "../style.module.css";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BetOptions } from "../7updown/page";
import { GiSpikedDragonHead, GiTigerHead, GiClubs, GiSpades, GiHearts, GiDiamonds } from "react-icons/gi";
import { TbPlayCardK, TbPlayCardQ, TbPlayCardJ, TbPlayCard8Filled, TbPlayCardAFilled } from "react-icons/tb";
import { IoPerson } from "react-icons/io5";
import { TbPlayCardOff } from "react-icons/tb";
import Spinner from "react-bootstrap/Spinner";

/** ---------- CONFIG ---------- */
const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_PORT;
const GAME = "TEENPATTI_POINT";
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
class TeenPattiCanvas {
    constructor(canvas, assets) {
        this.c = canvas;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("2D context not available");
        this.ctx = ctx;
        this.imgs = {};
        this.assets = assets;

        this.state = {
            phase: "idle", // bet | reveal | result
            playerACards: [null, null, null],
            playerBCards: [null, null, null],
            winner: null,
            userPick: null,
        };

        // Flip states
        this.slotA1 = { x: 0, y: 0, flipProgress: 1, face: "back" };
        this.slotA2 = { x: 0, y: 0, flipProgress: 1, face: "back" };
        this.slotA3 = { x: 0, y: 0, flipProgress: 1, face: "back" };

        this.slotB1 = { x: 0, y: 0, flipProgress: 1, face: "back" };
        this.slotB2 = { x: 0, y: 0, flipProgress: 1, face: "back" };
        this.slotB3 = { x: 0, y: 0, flipProgress: 1, face: "back" };

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

        this.cardH = Math.min(h * 0.3, 180);
        this.cardW = this.cardH * (120 / 170);
        const cardsOffSet = this.cardW * 1.2;

        const cx = w / 2;
        const topY = h * 0.1;
        const bottomY = h * 0.56;

        this.slotA2.x = cx - this.cardW / 2;
        this.slotA2.y = topY;
        this.slotA1.x = this.slotA2.x - cardsOffSet;
        this.slotA1.y = topY;
        this.slotA3.x = this.slotA2.x + cardsOffSet;
        this.slotA3.y = topY;

        this.slotB2.x = cx - this.cardW / 2;
        this.slotB2.y = bottomY;
        this.slotB1.x = this.slotB2.x - cardsOffSet;
        this.slotB1.y = bottomY;
        this.slotB3.x = this.slotB2.x + cardsOffSet;
        this.slotB3.y = bottomY;
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

    /** ---------- Game Control ---------- */
    setPick(pick) { 
       console.log( "I was called");       
        this.state.userPick = pick;
     }

    startRound() {
        this.state = {
            phase: "bet",
            playerA: null,
            playerB: null,
            winner: null,
            userPick: null,
        };
        this.slotA1 = { x: 0, y: 0, flipProgress: 1, face: "back" };
        this.slotA2 = { x: 0, y: 0, flipProgress: 1, face: "back" };
        this.slotA3 = { x: 0, y: 0, flipProgress: 1, face: "back" };

        this.slotB1 = { x: 0, y: 0, flipProgress: 1, face: "back" };
        this.slotB2 = { x: 0, y: 0, flipProgress: 1, face: "back" };
        this.slotB3 = { x: 0, y: 0, flipProgress: 1, face: "back" };
        this._computeLayout();
        this.render();
    }

    /** ---------- Flip Animation ---------- */
    _animateFlip(slot, faceKey, next) {
        let start = null;
        const duration = 400;

        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const elapsed = timestamp - start;
            const progress = Math.min(elapsed / duration, 1);
            slot.flipProgress = progress;

            // Once we pass halfway, permanently change face
            if (progress >= 0.5 && slot.face !== faceKey) {
                slot.face = faceKey;
            }

            // Redraw all cards (preserves previously flipped faces)
            this.render();

            // Draw current flipping card in transitional state
            this._drawCard(slot, progress < 0.5 ? "cardBack" : slot.face);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                slot.flipProgress = 1;
                slot.face = faceKey;
                // final redraw
                this.render();
                if (next) next();
            }
        };

        requestAnimationFrame(animate);
    }




    /** ---------- Async utility ---------- */
    _delay(ms) {
        return new Promise((res) => setTimeout(res, ms));
    }

    /** ---------- Sequential Reveal ---------- */
    async showHands(playerA, playerB, winner) {
        this.state.phase = "result";
        const A = playerA.cards || [];
        const B = playerB.cards || [];
        this.state.winner = winner;

        if (A.length < 3 || B.length < 3) return;

        // Reveal Player A
        await this._delay(300);
        await new Promise((r) => this._animateFlip(this.slotA1, faceKeyFromServer(A[0]), r));
        await this._delay(300);
        await new Promise((r) => this._animateFlip(this.slotA2, faceKeyFromServer(A[1]), r));
        await this._delay(300);
        await new Promise((r) => this._animateFlip(this.slotA3, faceKeyFromServer(A[2]), r));

        // Reveal Player B
        await this._delay(600);
        await new Promise((r) => this._animateFlip(this.slotB1, faceKeyFromServer(B[0]), r));
        await this._delay(300);
        await new Promise((r) => this._animateFlip(this.slotB2, faceKeyFromServer(B[1]), r));
        await this._delay(300);
        await new Promise((r) => this._animateFlip(this.slotB3, faceKeyFromServer(B[2]), r));

        console.log("Winner:", winner);
        this.render();

        const ctx = this.ctx;
        ctx.font = `${Math.round(this.cardH / 8)}px system-ui`;
        ctx.fillStyle = "#9AA4AF";
        ctx.textAlign = "center";
        ctx.fillText(`Winner Is : ${winner == 'WINNER_PLAYERA' ? "Player A" : winner == 'WINNER_PLAYERB' ? "Player B" : "Tie"}`, this.slotA2.x + this.cardW / 2, this.slotA2.y - 20);
    }

    /** ---------- Card Drawing ---------- */
    _drawCard(slot, faceKey) {
        const ctx = this.ctx;
        const progress = slot.flipProgress ?? 1;
        const angle = progress * Math.PI;
        const scaleX = Math.cos(angle);

        ctx.save();
        ctx.translate(slot.x + this.cardW / 2, slot.y + this.cardH / 2);
        ctx.scale(scaleX, 1);

        const showBack = progress < 0.5;
        const imgKey = showBack ? "cardBack" : faceKey;
        const img = this.imgs[imgKey] || this.imgs.cardBack;

        if (img) {
            const isFront = !showBack && scaleX < 0;
            if (isFront) ctx.scale(-1, 1);
            ctx.drawImage(img, -this.cardW / 2, -this.cardH / 2, this.cardW, this.cardH);
        }

        ctx.restore();
    }

    /** ---------- Rendering ---------- */
    render() {
        const ctx = this.ctx;
        const { width, height } = this.c.getBoundingClientRect();
        ctx.clearRect(0, 0, width, height);
        this._computeLayout();

        // Draw cards using each slot's stored face
        this._drawCard(this.slotA1, this.slotA1.face || "cardBack");
        this._drawCard(this.slotA2, this.slotA2.face || "cardBack");
        this._drawCard(this.slotA3, this.slotA3.face || "cardBack");
        this._drawCard(this.slotB1, this.slotB1.face || "cardBack");
        this._drawCard(this.slotB2, this.slotB2.face || "cardBack");
        this._drawCard(this.slotB3, this.slotB3.face || "cardBack");

        ctx.font = `${Math.round(this.cardH / 8)}px system-ui`;
        ctx.fillStyle = "#9AA4AF";
        ctx.textAlign = "center";
        ctx.fillText("Player B", this.slotB2.x + this.cardW / 2, this.slotB2.y + this.cardH + 20);
        ctx.fillText("Player A", this.slotA2.x + this.cardW / 2, this.slotA2.y + this.cardH + 20);
    }

    _clear() {
        const ctx = this.ctx;
        const { width, height } = this.c.getBoundingClientRect();
        ctx.clearRect(0, 0, width, height);
    }
}




export default function TeenPattiPointPage() {
    const router = useRouter();
    const canvasRef = useRef(null);
    const abRef = useRef(null);
    const socketRef = useRef(null);
    const roundRef = useRef(null);

    const icons1 = [
        <TbPlayCardAFilled key="snap" style={{ color: "red" }} />,
        <TbPlayCard8Filled key="dragon" style={{ color: "white" }} />,
    ];

    const icons2 = [
        <React.Fragment key="black">
            <GiClubs style={{ color: "black" }} />
            <GiDiamonds style={{ color: "red" }} />
            <GiSpades style={{ color: "black" }} />
        </React.Fragment>,
        <React.Fragment key="red">
            <GiHearts style={{ color: "red" }} />
            <GiClubs style={{ color: "black" }} />
            <GiDiamonds style={{ color: "red" }} />
        </React.Fragment>,
    ];

    const icons3 = [
        <React.Fragment key="clubs-spades">
            <GiClubs style={{ color: "black" }} />
            <GiClubs style={{ color: "black" }} />
        </React.Fragment>,
        <React.Fragment key="hearts-diamonds">
            <GiHearts style={{ color: "red" }} />
            <GiHearts style={{ color: "red" }} />
        </React.Fragment>,
    ];
    const icons8 = [
        <React.Fragment key="clubs-spades">
            <GiSpades key="spade" style={{ color: "black" }} />
            <GiDiamonds key="diamond" style={{ color: "red" }} />
        </React.Fragment>,
        <React.Fragment key="hearts-diamonds">
            <GiSpades key="spade" style={{ color: "black" }} />
            <GiDiamonds key="diamond" style={{ color: "red" }} />
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

    const icons6 = [
        <React.Fragment key="KandQforA">
            <TbPlayCardK key="king" style={{ color: "black" }} />
            <TbPlayCardQ key="queen" style={{ color: "red" }} />
        </React.Fragment>,
        <React.Fragment key="KandQforB">
            <TbPlayCardK key="king" style={{ color: "black" }} />
            <TbPlayCardQ key="queen" style={{ color: "red" }} />
        </React.Fragment>
    ]
    const icons7 = [
        <React.Fragment key="JandQforA">
            <TbPlayCardJ key="king" style={{ color: "black" }} />
            <TbPlayCardQ key="queen" style={{ color: "red" }} />
        </React.Fragment>,
        <React.Fragment key="JandQforB">
            <TbPlayCardJ key="king" style={{ color: "black" }} />
            <TbPlayCardQ key="queen" style={{ color: "red" }} />
        </React.Fragment>
    ]
    const [bet, setBet] = useState(null);
    const [amnt, setAmnt] = useState(0);
    const [round, setRound] = useState(null);
    const [now, setNow] = useState(Date.now());
    const [isLocked, setLocked] = useState(true);
    const [loading, setLoading] = useState(true);

    const [viewers, setViewers] = useState(1);
    const [winners, setWinners] = useState(0);
    const [losers, setLosers] = useState(0);

    const [lastGameResult, setLastGameResult] = useState([])

    const [options] = useState(["Player A", "Player B"]);
    const [options2] = useState(["PlayerA Trio", "PlayerB Trio"]);
    const [options3] = useState(["PlayerA Pair", "PlayerB Pair"]);
    const [options4] = useState(["PlayerA StraightFlush", "PlayerB StraightFlush"]);
    const [options5] = useState(["PlayerA Flush", "PlayerB Flush"]);
    const [options6] = useState(["PlayerA K & Q", "PlayerA K & Q"]);
    const [options7] = useState(["PlayerA J & Q", "PlayerB J & Q"]);
    const [options8] = useState(["PlayerA Straight", "PlayerA Straight"]);

    const [realOptions] = useState(["Winner_PlayerA", "Winner_PlayerB"]);
    const [realOptions2] = useState(["PlayerA_Trio", "PlayerB_Trio"]);
    const [realOptions3] = useState(["PlayerA_Pair", "PlayerB_Pair"]);
    const [realOptions4] = useState(["PlayerA_StraightFlush", "PlayerB_StraightFlush"]);
    const [realOptions5] = useState(["PlayerA_Flush", "PlayerB_Flush"]);
    const [realOptions6] = useState(["PlayerA_KandQ", "PlayerA_KandQ"]);
    const [realOptions7] = useState(["PlayerA_JandQ", "PlayerB_JandQ"]);
    const [realOptions8] = useState(["PlayerA_Straight", "PlayerA_Straight"]);

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
        abRef.current = new TeenPattiCanvas(canvasRef.current, ASSETS);

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
                    if (payload.resultList[i] == "WINNER_PLAYERA") {
                        cardImgList.push('/andar-card.png')
                    } else {
                        cardImgList.push('/bahar-card.png')
                    }
                }
                setLastGameResult([...cardImgList]);
            }
            setLoading(false);


            const rid = payload?._doc?._id;
            // console.log("ROOM ID: ", rid);

            if (rid) roundRef.current = rid;
            setRound({ id: rid, ...payload._doc });
        });

        socket.on("round:lock", () => {
            setLocked(true);
            setLoading(true);
        });

        socket.on("round:revealDeck", (payload) => {
            console.log("CARDS: ", payload);
            setLoading(false);
            // const andarKey = faceKeyFromServer(payload?.andarCard);
            // const baharKey = faceKeyFromServer(payload?.baharCard);
            // const index = payload?.index;
            let { playerA, playerB, winner } = payload;
            abRef.current.showHands(playerA, playerB, winner);
            // abRef.current.showDeck(andarKey, baharKey, index);
        })

        socket.on("round:result", (payload) => {
            console.log("RESULT:", payload);
            setLoading(false);
            let meta = payload.result
            console.log("User Pick; ", abRef.current.state);
            

            let win = checkIfWon(abRef.current.state.userPick, {meta});
            console.log("Is Winner: ",win);
            

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
    const resultMs = useMemo(() => (round ? (round.settleAt ?? 0) - now : 0), [round, now]);

    const placeBet = async () => {
        if (isLocked) {
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
        const market = bet;
        console.log("BET is:", market);
        

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

    function checkIfWon(betMarket, { meta }) {
        console.log("META: ",meta);
        console.log("MArket: ",betMarket);
        
        const { playerA, playerB, winner } = meta;
        const [player, category] = betMarket.split("_");

        if (player === "Winner") return winner === category;

        const p = player === "PlayerA" ? playerA : playerB;
        return !!p[category]; // true if that property is true
    }
    return (
        <div className={styles.mainDiv}>
            <h2>TeenPatti Point</h2>

            <div className={styles.metaRow}>
                {round
                    ? isLocked
                        ? `Locked · result in ${fmtSec(resultMs)}s`
                        : `Closes in ${fmtSec(lockMs)}s`
                    : "Waiting for round..."}
            </div>
            <div className={styles.metaRow}>
                {lastGameResult.length == 0
                    ? "Entered Mid Game, Wait until Round Ends"
                    : ""}
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
                                icon={icons1}
                                optionArray={realOptions}
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
                                optionArray={realOptions2}
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
                                optionArray={realOptions3}
                                isLocked={isLocked}
                            />
                        ))}
                    </div>
                    <div className={styles.betBoxes}>
                        {options8.map((label, i) => (
                            <BetOptions
                                key={i}
                                name={label}
                                bet={bet}
                                setBet={setBet}
                                index={i}
                                amnt={amnt}
                                setAmnt={setAmnt}
                                onPlaceBet={placeBet}
                                icon={icons4}
                                optionArray={realOptions8}
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
                                icon={icons8}
                                optionArray={realOptions4}
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
                                optionArray={realOptions5}
                                isLocked={isLocked}
                            />
                        ))}
                    </div>
                    <div className={styles.betBoxes}>
                        {options6.map((label, i) => (
                            <BetOptions
                                key={i}
                                name={label}
                                bet={bet}
                                setBet={setBet}
                                index={i}
                                amnt={amnt}
                                setAmnt={setAmnt}
                                onPlaceBet={placeBet}   // BetOptions will call with no args
                                icon={icons6}
                                optionArray={realOptions6}
                                isLocked={isLocked}
                            />
                        ))}
                    </div>
                    <div className={styles.betBoxes}>
                        {options7.map((label, i) => (
                            <BetOptions
                                key={i}
                                name={label}
                                bet={bet}
                                setBet={setBet}
                                index={i}
                                amnt={amnt}
                                setAmnt={setAmnt}
                                onPlaceBet={placeBet}   // BetOptions will call with no args
                                icon={icons7}
                                optionArray={realOptions7}
                                isLocked={isLocked}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
