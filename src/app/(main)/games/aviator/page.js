"use client";
import { useEffect, useRef, useState } from "react";
import { FaLock } from "react-icons/fa";
import styles from "../style.module.css";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_PORT;
const GAME = "AVIATOR";
const TABLE_ID = "table-1";

export const fakeUsernames = [
  "SkyJumper", "CodeNomad", "PixelDrift", "AeroNova", "FrostByte", "LunaScope", "JetStreamX", "EmberEdge", "NexusRider", "QuantumWolf",
  "BytePilot", "ZephyrZone", "NeonPulse", "CloudHiker", "TurboEcho", "SonicTide", "DreamForge", "StarRift", "VortexCore", "NovaLine",
  "ShadowStrike", "GhostReign", "HeadshotGuru", "ApexTiger", "NightCraze", "Sn1perSoul", "RapidBlaze", "ToxicRush", "InfernoX", "DriftViper",
  "HexHunter", "VenomNova", "SteelSpectre", "ZeroLag", "BulletByte", "CyberClash", "WildRacer", "MysticFang", "Gl1tchMode", "FrostRogue",
  "LazyLatte", "HappyNibbles", "SleepyCloud", "CookieOrbit", "ChillVibesOnly", "MangoSpark", "SillyGoose", "TinyGalaxy", "StarryMint", "QuirkQueen",
  "CozyBandit", "PinkParadox", "DramaLlama", "SushiDreamer", "BananaBloop", "RainyDaze", "LostInLoFi", "BobaKnight", "KawaiiByte", "CosmicDonut",
  "BlockChainer", "HashMiner", "NeuralNode", "ByteSmith", "GPUFiend", "StackTracer", "MetaGhost", "CryptoPilot", "Web3Wizard", "NFTitan",
  "QuantumBug", "AIOverlord", "DeFiDrifter", "CloudLooper", "LogicLoop", "RustReactor", "KernelKid", "NodeKnight", "LambdaLad", "SudoSoul",
  "Rahul_09", "Aarav_X", "KiraChan", "Anjali_777", "Zoya_22", "RajTechie", "ArmanLive", "TanviSpark", "AyushPlayz", "SnehaDev",
  "Neo47", "Blaze_101", "Xeno999", "ZaraByte", "DevanshOp", "Luna_808", "Maverick09", "PriyaNova", "KaiStorm", "RohanFlyer",
  "GameNirvana", "EchoKnight", "ShadowNova", "CrimsonDusk", "SolarNova", "NexusPrime", "TurboWolf", "ViperSoul", "RoguePulse", "CosmoDrift",
  "NightRider", "AceOfSky", "ThunderTrek", "PixelRacer", "AstroSpark", "DriftByte", "QuantumAce", "SkyTrekker", "LunaRogue", "StarlineX",
  "FrostKnight", "GlitchPulse", "RapidEdge", "ZeroFang", "NovaDrift", "SkySpectre", "BlitzCore", "MetaVortex", "EchoStrike", "ByteViper",
  "CoffeeZombie", "WittyPanda", "LazyKoala", "BubbleMuffin", "DreamyOwl", "TinyPhoenix", "JellyPops", "SnackQueen", "MangoMocha", "SleepyFawn",
  "SoftComet", "CheerfulChai", "PastaDreamer", "SundaeStorm", "SunnySprout", "SillyCactus", "ComfyPenguin", "BubbleLush", "ChocoRipple", "DoodleStar",
  "DataDaemon", "LogicPilot", "ScriptMage", "DevDroid", "BugSmasher", "StackSorcerer", "NullNinja", "QueryKing", "CodeYoda", "KernelGhost",
  "CacheWizard", "APINinja", "ServerSamurai", "LambdaLord", "ScriptedSoul", "CloudVortex", "NodeWizard", "PatchMaster", "DevSpectre", "LoopGuru",
  "CryptoQueen", "BitRider", "WalletWarrior", "HashLord", "DappDrifter", "MetaMiner", "NFTNomad", "defi@342", "TokenTiger", "SatoshiSage",
  "ChainCoder", "WalletWhale", "MintMage", "Web3Knight", "CryptoFalcon", "BlockWolf", "MetaGhosty", "HodlHawk", "TokenNinja", "CoinCraft",
  "Rajesh_99", "Vikram007", "SnehaPlayz", "Tanisha_08", "ArjunOp", "KavyaLive", "RaviXP", "NehaSpark", "IshaanTech", "PoojaNova",
  "Manish_X", "SimranByte", "Tanishq_22", "Aditi_777", "YashGamez", "NishaDev", "Ankit_Pro", "SonalPlayz", "Rehan_89", "TaraNova",
  "KabirX", "DiyaOp", "VaniTech", "KaranLive", "Meera_09", "AryanByte", "IraPlayz", "HarshDev", "RidhiNova", "KrishX",
  "OmTechie", "NitinOp", "Aanya_777", "LakshNova", "AarohiPlayz", "Ishan_21", "SiaByte", "AdvikDev", "MihirLive", "AanyaSpark"
];

function getRandomUsernames(sourceArray) {
  // pick a random number between 10–25
  const count = Math.floor(Math.random() * (25 - 5 + 1)) + 10;

  // copy and shuffle the array (Fisher–Yates shuffle)
  const shuffled = [...sourceArray];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // return first N unique names
  return shuffled.slice(0, count).map(name => name.toLowerCase());
}


export default function AviatorGame() {
  const router = useRouter();
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const resetRef = useRef(null);
  const multiplierRef = useRef(1);
  const displayMultiplierRef = useRef(1);
  const socketRef = useRef(null);
  const crashRef = useRef(null);

  const [amnt, setAmnt] = useState(0);
  const [bet, setBet] = useState(0);
  const [locked, setLocked] = useState(false);
  const [viewers, setViewers] = useState(2);
  const [round, setRound] = useState({});
  const [isCrashed, setIsCrashed] = useState(false);
  const [userExists, setUserExists] = useState(false);
  const [userName, setUserName] = useState("");
  const [roundEndAt, setRoundEndAt] = useState(null);
  const isRoundEndedRef = useRef(false);
  const stopBgRef = useRef(null);
  const startBgRef = useRef(null);

  const [userList, setUserList] = useState([])


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
      const crashSound = new Audio("/sounds/crash.mp3");
      crashSound.volume = 0.8; // adjust volume (0 to 1)
      if (crashed || planeGone) return;
      crashed = true;
      try {
        crashSound.play().catch(err => console.log("Audio play blocked:", err));
      } catch (err) {
        console.error("Error playing crash sound:", err);
      }

      // initial stall impulse (slightly up) then gravity takes over
      vy = -2 - Math.random() * 2;
      vx = 1 - Math.random() * 2; // slight horizontal jitter
      angularVel = 0.08 + Math.random() * 0.08; // start rotating
      spawnExplosion(planeX + 75, planeY); // explosion at plane nose
    }
    crashRef.current = triggerCrash;
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
        // Smoothly move displayMultiplier toward the true multiplier
        const target = multiplierRef.current;
        const current = displayMultiplierRef.current;

        // interpolation factor: smaller = smoother, larger = faster (0.1 → 0.3)
        displayMultiplierRef.current += (target - current) * 0.15;

        const multiplier = displayMultiplierRef.current;
        baseY = h * 0.7 - Math.log(multiplier + 1) * 150;
        planeY = baseY - Math.sin(t / 200) * 20;
        planeX = w * 0.01 + Math.log(multiplier + 1) * 50;
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
      ctx.font = "italic bold 60px Poppins, sans-serif";
      ctx.fillStyle = isRoundEndedRef.current ? "#e40000" : "#fff"; // 🔴 red if round ended
      ctx.fillText(`${displayMultiplierRef.current.toFixed(2)}x`, 50, 100);

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
      planeX = w * 0.4;
      planeY = h * 0.8;
    }

    resetRef.current = resetGame;

    // cleanup
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {

    let uid = getUid();
    let userName = localStorage.getItem("userName");

    if (uid && userName) {
      setUserName(userName);
      setUserExists(true);
    }

    setUserList(getRandomUsernames(fakeUsernames));
    const socket = io(SERVER_URL, { transports: ["websocket"], autoConnect: true });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join", { game: GAME, tableId: TABLE_ID });
    });

    socket.on("round:start", (payload) => {
      setUserList(getRandomUsernames(fakeUsernames));
      startBgRef?.current();
      console.log("START: ", payload);
      setViewers(payload.viewers);
      const rid = payload?._id;
      isRoundEndedRef.current = false;
      setIsCrashed(false);
      setLocked(false);
      resetRef.current();
      // if (rid) roundRef.current = rid;
      setRoundEndAt(payload?.betsCloseAt)
      setRound({ id: rid, ...payload });
    });

    socket.on("aviator:update", (multiplier) => {
      console.log("Multiplier Data: ", multiplier);

      multiplierRef.current = multiplier.multiplier;
    });

    socket.on("aviator:crash", (data) => {
      crashRef?.current();
      stopBgRef?.current();
      console.log("Crashed: ", data);
      setIsCrashed(true)
      setLocked(true)

    });

    socket.on("round:end", () => {
      if (!isCrashed) {
        crashRef.current();
      }
      isRoundEndedRef.current = true;
    });

    return () => {
      socket.off(); socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const bgMusic = new Audio("/sounds/flight_bg.mp3");
    bgMusic.loop = true;
    bgMusic.volume = 0.3;

    // ✅ Start only after first user interaction (required by browser policy)
    const startAudio = () => {
      bgMusic.play().catch(() => { });
      window.removeEventListener("click", startAudio);
    };
    window.addEventListener("click", startAudio);

    // ✅ Create a function to fade out later (not immediately)
    const fadeOut = () => {
      const fade = setInterval(() => {
        if (bgMusic.volume > 0.05) {
          bgMusic.volume -= 0.05;
        } else {
          clearInterval(fade);
          bgMusic.pause();
        }
      }, 100);
    };

    // store the function so you can trigger it from crashRef or sockets
    stopBgRef.current = fadeOut;
    startBgRef.current = startAudio;

    return () => {
      bgMusic.pause();
      bgMusic.currentTime = 0;
      window.removeEventListener("click", startAudio);
    };
  }, []);



  function getUid() {
    if (typeof window === "undefined") return null;
    let userToken = localStorage.getItem("userToken");
    return userToken;
  }

  const onPlaceBet = async () => {
    if (locked) {
      toast.warn("Round Locked !");
      return;
    }
    if (!amnt && displayMultiplierRef.current === 1) {
      toast.error("Cannot place bets");
    }
    const uid = getUid();
    if (!uid) {
      toast.error("Log-In to place bets");
    }
    if (roundEndAt) {
      let timeNow = new Date().getTime();
      if (timeNow >= roundEndAt) {
        toast.error("Round already ended !");
        router.reload()
      }
    }
    if (!roundEndAt) {
      toast.error("Bets cannot be placed !");
    }
    let market = Number(displayMultiplierRef.current.toFixed(2));
    socketRef.current.emit(
      "bet:aviator",
      {
        userId: uid, // replace with your actual authenticated id
        roundId: round.id,
        game: GAME,
        tableId: TABLE_ID,
        market: market, // 'UP' | 'DOWN' | 'SEVEN'
        stake: Number(amnt),
      },
      (res) => {
        if (!res?.ok) {
          toast.error(res?.error || "Failed to place bet.");
          return;
        }
        setBet(null);
        toast.success(`Bet placed on ${market} for ${amnt}.`, {
          autoClose: 3000,
          pauseOnFocusLoss: false,
        });
        setAmnt(0);
      }
    );
  }

  const takeBackBet = async () => {
    if (locked) {
      toast.warn("Round Locked !");
      return;
    }
    if (roundEndAt) {
      let timeNow = new Date().getTime();
      if (timeNow >= roundEndAt) {
        toast.error("Round already ended !");
        router.reload()
      }
    }
    if (!roundEndAt) {
      toast.error("Cashout not possible !");
    }
    let uid = getUid();
    let req = await fetch(`${process.env.NEXT_PUBLIC_SERVER_PORT}/api/bets/cashInAviator`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${uid}`,
      },
      body: JSON.stringify({
        "userToken": uid,
        "roundId": round.id
      })
    });
    let res = await req.json();
    if (res.ok) {
      toast.success(`${res.message}`);
    }
    else {
      toast.error(`${res.message}`)
    }
  }


  return (
    <div>
      <div style={{ width: "100%", minHeight: 600, height: "100%", overflow: 'hidden', position: 'relative' }}>
        <canvas ref={canvasRef} className="w-full h-full" />
        {/* <div className={styles.totalPlaying}>{viewers}</div> */}
        <div className={styles.aviatorBettingArea}>
          <div className={styles.stakeDiv}>
            <div className={styles.stakeChoice}>
              {[20, 50, 100, 300, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAmnt(amt)}
                  className={amnt === amt ? styles.selectedStake : styles.aviatorButtons}
                >
                  {amt}
                </button>
              ))}
            </div>
            <div className={styles.placeBtn}>
              <button
                onClick={async () => {
                  await onPlaceBet();
                }}
                style={{ backgroundColor: `${locked ? "#00188eff" : "#0ac900ff"}`, padding: 10, borderRadius: 10, color: "#ffffffff", fontWeight: 600, fontSize: 22, border: "none", outline: "none" }}
              >
                {
                  locked ? <FaLock /> : "Place Bet"
                }
              </button>

              <button
                style={{ backgroundColor: `${locked ? "#00188eff" : "#0ac900ff"}`, padding: 10, borderRadius: 10, color: "#ffffffff", fontWeight: 600, fontSize: 22, border: "none", outline: "none" }}
                onClick={async () => {
                  await takeBackBet()
                  setBet(null);
                }}
              >{
                  locked ? <FaLock /> : "Cash In"
                }
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.aviatorUsersBox}>
        <h3>{`Now Playing: ${userList.length > 0 && userExists ? userList.length + 1 : userList.length && !userExists ? userList.length : 0}`}</h3>
        <div className={styles.aviatorUsersList}>
          {
            userExists ? <div>
              <span>{userName.slice(0, 1)}</span>
              <p>{userName}</p>
            </div> : <></>
          }
          {
            userList.map((e, i) => {
              return <div key={i}>
                <span>{e.slice(0, 1)}</span>
                <p>{e}</p>
              </div>
            })
          }
        </div>
      </div>
    </div>
  );
}
