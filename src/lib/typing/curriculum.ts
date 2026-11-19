import { TypingChapter, TypingStage } from "./types";
import { getKeyFingerInfo } from "./finger-mapping";

export const TYPING_STAGES: TypingStage[] = [
  {
    id: 1,
    title: "Home Row Foundations",
    subtitle: "Posture, Tactile F/J Bumps & 8 Anchor Fingers",
    chapterRange: "Ch. 1 – 40",
    startChapter: 1,
    endChapter: 40,
    totalChapters: 40,
    description: "Master ergonomics, posture, and the 8 base home row keys (A, S, D, F, J, K, L, ;). Build permanent muscle memory without peeking.",
    badge: "Foundation",
    color: "from-blue-500 to-indigo-600",
    targetWpmRange: "12 – 22 WPM",
  },
  {
    id: 2,
    title: "Top Row Expansion",
    subtitle: "Vowels E, I, U, O and Consonants R, T, Y, W, P, Q",
    chapterRange: "Ch. 41 – 90",
    startChapter: 41,
    endChapter: 90,
    totalChapters: 50,
    description: "Learn precise upward diagonal reaches without lifting your palms from resting position. Master high-frequency words and English diphthongs.",
    badge: "Expansion",
    color: "from-emerald-500 to-teal-600",
    targetWpmRange: "20 – 28 WPM",
  },
  {
    id: 3,
    title: "Bottom Row Mastery",
    subtitle: "Downward Reaches V, B, M, N, C, X, Z & Punctuation",
    chapterRange: "Ch. 91 – 145",
    startChapter: 91,
    endChapter: 145,
    totalChapters: 55,
    description: "Execute clean downward finger angles to V, B, N, M, C, X, Z, comma (,) and period (.). Unlock full 3-row fluid English typing.",
    badge: "Alphabet Complete",
    color: "from-amber-500 to-orange-600",
    targetWpmRange: "26 – 32 WPM",
  },
  {
    id: 4,
    title: "Capitalization & Shift Key Sync",
    subtitle: "Opposite-Hand Shift Rules, Proper Nouns & India GK",
    chapterRange: "Ch. 146 – 195",
    startChapter: 146,
    endChapter: 195,
    totalChapters: 50,
    description: "Learn bilateral coordination: Left Shift for right-hand keys, Right Shift for left-hand keys. Type names, capitals, and official SSC exam terms.",
    badge: "Shift Sync",
    color: "from-purple-500 to-violet-600",
    targetWpmRange: "30 – 35 WPM",
  },
  {
    id: 5,
    title: "Number Row & Common Symbols",
    subtitle: "Numbers 1-0, Math & Administrative Symbols (%, ₹, &, -)",
    chapterRange: "Ch. 196 – 250",
    startChapter: 196,
    endChapter: 250,
    totalChapters: 55,
    description: "Direct finger stretches to the top numeric row (1-0), brackets, hyphens, and currency symbols required in government administrative files.",
    badge: "Technical",
    color: "from-cyan-500 to-blue-600",
    targetWpmRange: "32 – 36 WPM",
  },
  {
    id: 6,
    title: "High-Frequency SSC Vocabulary",
    subtitle: "Top 1000 Exam Words, Polity, History & English Roots",
    chapterRange: "Ch. 251 – 305",
    startChapter: 251,
    endChapter: 305,
    totalChapters: 55,
    description: "Drill authentic exam vocabulary: Constitution, Parliament, Judiciary, Sovereignty, Antonyms, and Synonyms tested in CGL & CHSL.",
    badge: "Exam Vocab",
    color: "from-rose-500 to-pink-600",
    targetWpmRange: "35 – 40 WPM",
  },
  {
    id: 7,
    title: "Paragraph Fluency & Cadence",
    subtitle: "Endurance, Rhythm & Backspace Discipline Drills",
    chapterRange: "Ch. 306 – 345",
    startChapter: 306,
    endChapter: 345,
    totalChapters: 40,
    description: "Eliminate pause hesitation, control speed bursts, maintain steady metronome rhythm, and minimize costly backspace penalization.",
    badge: "Fluency",
    color: "from-indigo-500 to-blue-700",
    targetWpmRange: "38 – 45 WPM",
  },
  {
    id: 8,
    title: "SSC CGL & CHSL DEST Exam Simulator",
    subtitle: "Official 10 & 15 Minute Tests (2000 Keystrokes) & Commission Evaluation",
    chapterRange: "Ch. 346 – 365+",
    startChapter: 346,
    endChapter: 365,
    totalChapters: 20,
    description: "Real examination conditions with 10-minute and 15-minute countdowns. Authentic SSC scoring: Gross WPM, Net WPM, Half/Full mistakes, Error %, and Pass/Fail.",
    badge: "Official Exam Simulator",
    color: "from-red-600 to-amber-700",
    targetWpmRange: "35 – 50+ WPM",
  },
];

// Rich vocabulary sets for deterministic progression
const VOCAB_STAGE_1 = [
  "as", "ask", "all", "fall", "sad", "lad", "glad", "salad", "flask", "half",
  "dash", "flash", "falls", "lass", "adds", "flak", "dallas", "kafka", "fad", "alas"
];

const VOCAB_STAGE_2 = [
  "the", "to", "and", "that", "it", "is", "for", "on", "with", "as", "at", "by",
  "from", "this", "they", "we", "say", "her", "she", "or", "an", "will", "my",
  "one", "all", "would", "there", "their", "what", "so", "up", "out", "if", "about",
  "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", "no",
  "just", "him", "know", "take", "people", "into", "year", "your", "good", "some"
];

const VOCAB_STAGE_3 = [
  "government", "public", "service", "commission", "central", "state", "board",
  "bureau", "member", "council", "notice", "paper", "exam", "grade", "section",
  "division", "mark", "rank", "result", "answer", "question", "number", "point",
  "candidate", "application", "selection", "posting", "order", "rule", "policy"
];

const VOCAB_STAGE_4 = [
  "India", "Delhi", "Himalaya", "Ganga", "Brahmaputra", "Parliament", "President",
  "Prime Minister", "Constitution", "Supreme Court", "High Court", "Ministry of Finance",
  "Cabinet Secretariat", "Staff Selection Commission", "Reserve Bank of India",
  "Ashoka Chakra", "Satyameva Jayate", "New Delhi", "Mumbai", "Kolkata", "Chennai"
];

const VOCAB_STAGE_6 = [
  "sovereign", "socialist", "secular", "democratic", "republic", "justice", "liberty",
  "equality", "fraternity", "amendment", "fundamental", "directive", "principles",
  "judiciary", "legislature", "executive", "comptroller", "auditor", "attorney",
  "bureaucracy", "ubiquitous", "ephemeral", "ameliorate", "meticulous", "pragmatic",
  "magnanimous", "benevolent", "judicious", "exemplary", "comprehensive", "diligent"
];

const EXAM_PASSAGES = [
  "The Staff Selection Commission conducts the Combined Graduate Level Examination for recruitment to various Group B and Group C posts in ministries and departments of the Government of India. The examination comprises multiple tiers evaluating quantitative aptitude, reasoning ability, general awareness, English comprehension, and destination computer proficiency.",
  "Democracy thrives on the robust participation of informed citizens. The Constitution of India guarantees fundamental rights to all citizens while establishing directive principles of state policy to guide legislative governance. The balance of power among the Legislature, Executive, and Judiciary ensures constitutional supremacy and the protection of civil liberties.",
  "Economic growth in developing nations requires strategic infrastructure investment, digital literacy, and equitable access to credit. Financial inclusion initiatives launched by central banking authorities have empowered millions of self-help groups, small-scale enterprises, and rural entrepreneurs to participate actively in mainstream formal banking.",
  "Information technology and artificial intelligence are revolutionizing administrative efficiency across public governance platforms. Modern e-governance portals facilitate single-window clearances, transparent direct benefit transfers, and paperless citizen grievance redressal mechanisms, minimizing delays and eliminating bureaucratic friction.",
  "India has a rich cultural heritage spanning several millennia. From the ancient Indus Valley Civilization to the scientific achievements of the modern space program, Indian society has embraced diverse philosophical traditions, architectural wonders, and technological innovations contributing significantly to human advancement.",
  "Environmental conservation and climate resilience are vital national priorities. Sustainable agricultural practices, renewable solar energy expansion, and integrated water management systems are essential to preserve biodiversity, safeguard groundwater aquifers, and ensure sustainable food security for future generations.",
  "A sound educational foundation fosters critical thinking, ethical integrity, and vocational competence among the youth. National educational frameworks emphasize experiential learning, scientific inquiry, multilingual proficiency, and digital capabilities to prepare students for the dynamic requirements of the global knowledge economy.",
  "Public finance and taxation reform play a pivotal role in resource mobilization for capital infrastructure projects. The implementation of the Goods and Services Tax streamlined indirect taxation into a unified national market, eliminating cascading levies and bolstering interstate commercial transit efficiency."
];

function generateStage1Lesson(chId: number): TypingChapter {
  let newKeys: string[] = [];
  let drillText = "";
  let title = "";
  let subtitle = "";
  let instructionList: string[] = [];
  let targetWpm = 12 + Math.floor((chId / 40) * 10);
  let minAccuracy = 92 + Math.floor((chId / 40) * 5);

  if (chId === 1) {
    title = "Hand Placement & Home Row Tactile Bumps";
    subtitle = "Finding F & J without looking at the keyboard";
    newKeys = ["f", "j", " "];
    drillText = "f j f j fj jf f j fj jf f f j j fj fj jf jf f j f j";
    instructionList = [
      "Keep both feet flat on the floor with your back straight and shoulders relaxed.",
      "Feel the raised tactile bumps on key F (left index) and key J (right index).",
      "Rest your left fingers on A-S-D-F and right fingers on J-K-L-;",
      "Never look down at your fingers while typing — train your eyes on the screen.",
    ];
  } else if (chId <= 5) {
    title = `Index Finger Mechanics (${chId <= 3 ? "F and J Drill" : "Spacebar Rhythm"})`;
    subtitle = "Index fingers strike F and J, thumbs tap space";
    newKeys = ["f", "j", " "];
    drillText = "fff jjj fjf jfj ff jj f j f j ff jj fj jf ffff jjjj fjfj jfjf";
    instructionList = [
      "Use your Left Index for F and Right Index for J.",
      "Use either thumb (preferably right thumb) to tap the spacebar smoothly.",
      "Always return your fingers immediately to the home row position.",
    ];
  } else if (chId <= 10) {
    newKeys = ["d", "k"];
    title = "Middle Fingers: Keys D and K";
    subtitle = "Left middle finger strikes D, right middle finger strikes K";
    drillText = "dk dk dd kk fjd kjf ddk kkd fdk jkd kdf jdk dk dk fd jk dk";
    instructionList = [
      "Left Middle finger controls D. Right Middle finger controls K.",
      "Do not move your wrists — let your middle fingers lightly press the keys.",
      "Maintain a light, floating posture above the keyboard.",
    ];
  } else if (chId <= 15) {
    newKeys = ["s", "l"];
    title = "Ring Fingers: Keys S and L";
    subtitle = "Left ring finger strikes S, right ring finger strikes L";
    drillText = "sl sl ss ll fds jkl lsk dsf sld lks as lk sl sl fds jkl";
    instructionList = [
      "Left Ring finger controls S. Right Ring finger controls L.",
      "Ring fingers require practice as they share tendons with adjacent fingers.",
      "Press gently without twisting your hands sideways.",
    ];
  } else if (chId <= 20) {
    newKeys = ["a", ";"];
    title = "Pinky Fingers: Keys A and Semicolon (;)";
    subtitle = "Completing the full 8-finger home row anchor";
    drillText = "a; a; aa ;; asdf jkl; ;lkj fdsa a; a; asdf jkl; a; lk fd sa";
    instructionList = [
      "Left Pinky controls A. Right Pinky controls semicolon (;).",
      "Congratulations! All 8 fingers now have their permanent home row base.",
      "Always anchor your fingertips lightly on ASDF and JKL;.",
    ];
  } else if (chId <= 30) {
    const vocabSlice = VOCAB_STAGE_1.slice((chId - 21) * 2, (chId - 21) * 2 + 4).join(" ");
    title = `Home Row Word Building (Part ${chId - 20})`;
    subtitle = "Typing real words using only home row keys";
    newKeys = ["a", "s", "d", "f", "j", "k", "l", ";"];
    drillText = `${vocabSlice} fall sad glad flask half dash salad all ask ${vocabSlice}`;
    instructionList = [
      "Combine your home row keys into real English words.",
      "Say each letter silently in your mind as you press it.",
      "Prioritize accuracy over speed. Speed naturally follows accuracy.",
    ];
  } else {
    title = `Home Row Fluency & Accuracy Drill ${chId - 30}`;
    subtitle = "Strengthening home row endurance and cadence";
    newKeys = ["a", "s", "d", "f", "j", "k", "l", ";"];
    drillText = "a sad lad asks all lads a salad flask falls half glad as a flash fall";
    instructionList = [
      "Type smoothly without sudden rushes or long pauses.",
      "Aim for 96%+ accuracy to earn all 3 stars.",
      "Keep your wrists elevated and never rest them on the desk.",
    ];
  }

  const primaryKey = newKeys[0] || "f";
  const fingerInfo = getKeyFingerInfo(primaryKey);

  return {
    id: chId,
    stageId: 1,
    stageTitle: "Home Row Foundations",
    stageNumber: 1,
    title,
    subtitle,
    description: `Stage 1 Lesson ${chId}: ${title}. Master the home row without looking down.`,
    instructions: instructionList,
    newKeys,
    allKeys: ["a", "s", "d", "f", "j", "k", "l", ";", " "],
    drillText,
    targetWpm,
    minAccuracy,
    tutorialTip: "Keep your eyes fixed on the text. Feel the bumps on F and J.",
    handGuide: {
      leftHandRest: "A S D F",
      rightHandRest: "J K L ;",
      activeFinger: fingerInfo.finger,
      fingerDescription: `${fingerInfo.name} targets '${primaryKey}'`,
    },
    hasVideoTutorial: chId === 1 || chId === 21,
  };
}

function generateStage2Lesson(chId: number): TypingChapter {
  const offset = chId - 40; // 1 to 50
  let newKeys: string[] = [];
  let drillText = "";
  let title = "";
  let subtitle = "";
  let targetWpm = 20 + Math.floor((offset / 50) * 8);
  let minAccuracy = 94 + Math.floor((offset / 50) * 3);

  if (offset <= 10) {
    newKeys = ["e", "i"];
    title = `Vowels E and I (${offset <= 5 ? "Key Discovery" : "Integration"})`;
    subtitle = "Left middle reaches E, right middle reaches I";
    drillText = "de ki de ki see die kid like lie feed seek side ide kid feed did";
  } else if (offset <= 20) {
    newKeys = ["r", "u"];
    title = `Index Reaches: R and U (Part ${offset - 10})`;
    subtitle = "Left index reaches R, right index reaches U";
    drillText = "fr ju fr ju red fur run rule jar far dark pure sure true full";
  } else if (offset <= 30) {
    newKeys = ["t", "y"];
    title = `Center Top Reaches: T and Y (Part ${offset - 20})`;
    subtitle = "Left index diagonal to T, right index diagonal to Y";
    drillText = "ft jy ft jy the try yet tell day year study today duty rate true";
  } else if (offset <= 40) {
    newKeys = ["w", "o"];
    title = `Ring Top Reaches: W and O (Part ${offset - 30})`;
    subtitle = "Left ring reaches W, right ring reaches O";
    drillText = "sw lo sw lo now how who out flow slow word work good took wool";
  } else {
    newKeys = ["q", "p"];
    title = `Pinky Top Reaches: Q and P (Part ${offset - 40})`;
    subtitle = "Left pinky reaches Q, right pinky reaches P";
    drillText = "aq ;p aq ;p quit quick power part point paper people equal equip play";
  }

  const primaryKey = newKeys[0] || "e";
  const fingerInfo = getKeyFingerInfo(primaryKey);

  return {
    id: chId,
    stageId: 2,
    stageTitle: "Top Row Expansion",
    stageNumber: 2,
    title,
    subtitle,
    description: `Stage 2 Lesson ${offset}: ${title}. Upward reach practice.`,
    instructions: [
      `Reach upward from the home row to strike ${newKeys.join(" and ")}.`,
      "Immediately snap your finger back to its home key anchor.",
      "Keep wrists floating gently above the desk — do not twist your hands.",
    ],
    newKeys,
    allKeys: ["a", "s", "d", "f", "j", "k", "l", ";", "e", "i", "r", "u", "t", "y", "w", "o", "q", "p", " "],
    drillText,
    targetWpm,
    minAccuracy,
    tutorialTip: "Reach upward cleanly without lifting your entire palm.",
    handGuide: {
      leftHandRest: "A S D F",
      rightHandRest: "J K L ;",
      activeFinger: fingerInfo.finger,
      fingerDescription: `${fingerInfo.name} reaches for '${primaryKey}'`,
    },
    hasVideoTutorial: chId === 41,
  };
}

function generateStage3Lesson(chId: number): TypingChapter {
  const offset = chId - 90; // 1 to 55
  let newKeys: string[] = [];
  let drillText = "";
  let title = "";
  let subtitle = "";
  let targetWpm = 26 + Math.floor((offset / 55) * 6);
  let minAccuracy = 95 + Math.floor((offset / 55) * 3);

  if (offset <= 12) {
    newKeys = ["v", "m"];
    title = `Bottom Reaches: V and M (Part ${offset})`;
    subtitle = "Left index drops to V, right index drops to M";
    drillText = "fv jm fv jm move view make must very form main value mark mean";
  } else if (offset <= 24) {
    newKeys = ["b", "n"];
    title = `Bottom Inner Reaches: B and N (Part ${offset - 12})`;
    subtitle = "Left index reaches B, right index reaches N";
    drillText = "fb jn fb jn been bank new name bone banner brain noble born best";
  } else if (offset <= 36) {
    newKeys = ["c", ","];
    title = `Middle Downward Reaches: C and Comma (,) (Part ${offset - 24})`;
    subtitle = "Left middle reaches C, right middle reaches comma";
    drillText = "dc k, dc k, can, clean, call, came, fact, act, case, card, city, cut,";
  } else if (offset <= 45) {
    newKeys = ["x", "."];
    title = `Ring Downward Reaches: X and Period (.) (Part ${offset - 36})`;
    subtitle = "Left ring reaches X, right ring reaches period";
    drillText = "sx l. sx l. next. text. exam. box. mix. tax. six. apex. fix. exact.";
  } else {
    newKeys = ["z", "/"];
    title = `Pinky Downward Reaches: Z and Slash (/) (Part ${offset - 45})`;
    subtitle = "Left pinky drops to Z, right pinky drops to slash";
    drillText = "az ;/ az ;/ zero zone size quiz lazy prize / ssc/cgl chsl/dest";
  }

  const primaryKey = newKeys[0] || "v";
  const fingerInfo = getKeyFingerInfo(primaryKey);

  return {
    id: chId,
    stageId: 3,
    stageTitle: "Bottom Row Mastery",
    stageNumber: 3,
    title,
    subtitle,
    description: `Stage 3 Lesson ${offset}: ${title}. Master downward angles.`,
    instructions: [
      `Curl your finger inward to strike bottom row key '${primaryKey}'.`,
      "Do not push your whole hand down; let the finger curl naturally.",
      "Keep all other fingers resting lightly in home row position.",
    ],
    newKeys,
    allKeys: ["a", "s", "d", "f", "j", "k", "l", ";", "e", "i", "r", "u", "t", "y", "w", "o", "q", "p", "v", "b", "m", "n", "c", "x", "z", ",", ".", "/", " "],
    drillText,
    targetWpm,
    minAccuracy,
    tutorialTip: "Curl your finger down cleanly. Full alphabet is now unlocked!",
    handGuide: {
      leftHandRest: "A S D F",
      rightHandRest: "J K L ;",
      activeFinger: fingerInfo.finger,
      fingerDescription: `${fingerInfo.name} curls to '${primaryKey}'`,
    },
    hasVideoTutorial: chId === 91,
  };
}

function generateStage4Lesson(chId: number): TypingChapter {
  const offset = chId - 145; // 1 to 50
  const properNouns = VOCAB_STAGE_4;
  const word1 = properNouns[offset % properNouns.length];
  const word2 = properNouns[(offset + 3) % properNouns.length];
  const word3 = properNouns[(offset + 7) % properNouns.length];

  const targetWpm = 30 + Math.floor((offset / 50) * 5);
  const minAccuracy = 96;

  const title = `Capitalization & Shift Sync ${offset}`;
  const subtitle = "Opposite-hand Shift coordination";
  const drillText = `${word1} is an integral institution. ${word2} and ${word3} lead national development. India stands united with proud civic heritage.`;

  return {
    id: chId,
    stageId: 4,
    stageTitle: "Capitalization & Shift Key Sync",
    stageNumber: 4,
    title,
    subtitle,
    description: `Stage 4 Lesson ${offset}: Opposite-hand Shift rule for ${word1}.`,
    instructions: [
      "Rule: If the letter is on your RIGHT hand, hold LEFT SHIFT with your left pinky.",
      "Rule: If the letter is on your LEFT hand, hold RIGHT SHIFT with your right pinky.",
      "Never use CapsLock for single capital letters.",
    ],
    newKeys: ["Shift", word1[0]],
    allKeys: ["Shift", "A-Z", "a-z", ".", ",", " "],
    drillText,
    targetWpm,
    minAccuracy,
    tutorialTip: "Use the opposite pinky to hold Shift while striking the capital letter.",
    handGuide: {
      leftHandRest: "A S D F",
      rightHandRest: "J K L ;",
      activeFinger: "left-pinky",
      fingerDescription: "Opposite-hand pinky holds Shift",
    },
    hasVideoTutorial: chId === 146,
  };
}

function generateStage5Lesson(chId: number): TypingChapter {
  const offset = chId - 195; // 1 to 55
  const numIndex = (offset % 10);
  const numChar = `${numIndex}`;
  const targetWpm = 32 + Math.floor((offset / 55) * 4);
  const minAccuracy = 96;

  const symbols = ["%", "&", "-", "(", ")", "=", "+", "@", "#", "$"];
  const symbol = symbols[numIndex];

  const title = `Numbers & Administrative Symbols ${offset}`;
  const subtitle = `Drilling numbers 0-9 and symbol '${symbol}'`;
  const drillText = `In 2024, the commission reported 1850 vacancies across 34 categories. Under Section 14(2), 75% quota applies to 1290 posts.`;

  return {
    id: chId,
    stageId: 5,
    stageTitle: "Number Row & Common Symbols",
    stageNumber: 5,
    title,
    subtitle,
    description: `Stage 5 Lesson ${offset}: Numeric reach and official symbol typing.`,
    instructions: [
      "Reach upwards from top row to the number row with precision.",
      "Keep your palm steady so you don't lose home row orientation.",
      "Administrative files require accurate numbers without hesitation.",
    ],
    newKeys: [numChar, symbol],
    allKeys: ["0-9", "%", "&", "-", "(", ")", "=", "+", "@"],
    drillText,
    targetWpm,
    minAccuracy,
    tutorialTip: "Maintain home row awareness while stretching to the number row.",
    handGuide: {
      leftHandRest: "A S D F",
      rightHandRest: "J K L ;",
      activeFinger: getKeyFingerInfo(numChar).finger,
      fingerDescription: `Finger strikes number '${numChar}'`,
    },
    hasVideoTutorial: chId === 196,
  };
}

function generateStage6Lesson(chId: number): TypingChapter {
  const offset = chId - 250; // 1 to 55
  const vocab = VOCAB_STAGE_6;
  const v1 = vocab[offset % vocab.length];
  const v2 = vocab[(offset + 4) % vocab.length];
  const v3 = vocab[(offset + 8) % vocab.length];
  const targetWpm = 35 + Math.floor((offset / 55) * 5);
  const minAccuracy = 97;

  const title = `SSC High-Frequency Vocabulary ${offset}`;
  const subtitle = `Polity, Administrative & English Roots: ${v1}, ${v2}`;
  const drillText = `The constitution establishes ${v1} governance with ${v2} oversight. Every citizen possesses fundamental rights safeguarded by a ${v3} judicial framework.`;

  return {
    id: chId,
    stageId: 6,
    stageTitle: "High-Frequency SSC Vocabulary",
    stageNumber: 6,
    title,
    subtitle,
    description: `Stage 6 Lesson ${offset}: SSC CGL/CHSL exam vocabulary fluency.`,
    instructions: [
      "Read full words in chunks rather than letter-by-letter.",
      "Anticipate bigrams like 'th', 'ing', 'tion', and 'ment'.",
      "Develop steady rhythm and continuous typing momentum.",
    ],
    newKeys: [],
    allKeys: ["All Standard Keys"],
    drillText,
    targetWpm,
    minAccuracy,
    tutorialTip: "Think in words and syllables, not individual keystrokes.",
    handGuide: {
      leftHandRest: "A S D F",
      rightHandRest: "J K L ;",
      activeFinger: "thumb",
      fingerDescription: "Full hand coordination on exam vocabulary",
    },
    hasVideoTutorial: chId === 251,
  };
}

function generateStage7Lesson(chId: number): TypingChapter {
  const offset = chId - 305; // 1 to 40
  const passageIdx = offset % EXAM_PASSAGES.length;
  const passage = EXAM_PASSAGES[passageIdx];
  const targetWpm = 38 + Math.floor((offset / 40) * 7);
  const minAccuracy = 97;

  const title = `Paragraph Fluency & Cadence ${offset}`;
  const subtitle = "Endurance and Backspace Discipline";

  return {
    id: chId,
    stageId: 7,
    stageTitle: "Paragraph Fluency & Cadence",
    stageNumber: 7,
    title,
    subtitle,
    description: `Stage 7 Lesson ${offset}: Multi-sentence fluid exam typing.`,
    instructions: [
      "Minimize backspace usage — in SSC exams, backspacing consumes precious seconds.",
      "Keep your breathing calm and rhythmic.",
      "Maintain a uniform keystroke cadence across punctuation and capital letters.",
    ],
    newKeys: [],
    allKeys: ["All Standard Keys"],
    drillText: passage,
    targetWpm,
    minAccuracy,
    tutorialTip: "Speed comes from smooth cadence, not nervous hammering.",
    handGuide: {
      leftHandRest: "A S D F",
      rightHandRest: "J K L ;",
      activeFinger: "thumb",
      fingerDescription: "Continuous flowing typing posture",
    },
  };
}

function generateStage8Lesson(chId: number): TypingChapter {
  const offset = chId - 345; // 1 to 20+
  const isCGL = chId % 2 === 0;
  const examType = isCGL ? "CGL_DEST" : "CHSL_DEST";
  const examName = isCGL ? "SSC CGL DEST Simulator" : "SSC CHSL DEST Simulator";
  const passage = EXAM_PASSAGES[offset % EXAM_PASSAGES.length];
  const targetWpm = isCGL ? 35 : 30; // CGL DEST ~27-35 WPM, CHSL DEST 35 WPM English

  return {
    id: chId,
    stageId: 8,
    stageTitle: "SSC CGL & CHSL DEST Exam Simulator",
    stageNumber: 8,
    title: `${examName} (Set ${offset})`,
    subtitle: isCGL ? "15 Minutes / 2000 Keystrokes Commission Standard" : "10 Minutes / 1750 Keystrokes Commission Standard",
    description: `Stage 8 Official Simulator ${offset}: Exact commission grading, penalty evaluation, and pass/fail status.`,
    instructions: [
      isCGL
        ? "Official SSC CGL Tier-II DEST: Type the passage within 15 minutes."
        : "Official SSC CHSL Tier-II DEST: Type the passage within 10 minutes.",
      "Full mistakes (word omissions/substitutions) count as 1 penalty.",
      "Half mistakes (spelling/punctuation/caps) count as 0.5 penalty.",
      "Qualifying threshold: Error % must be <= 5% (UR) or <= 7% (Reserved).",
    ],
    newKeys: [],
    allKeys: ["All Standard Keys"],
    drillText: `${passage} ${EXAM_PASSAGES[(offset + 1) % EXAM_PASSAGES.length]}`,
    targetWpm,
    minAccuracy: 95,
    tutorialTip: "Authentic exam pressure simulation. Aim for zero uncorrected mistakes.",
    handGuide: {
      leftHandRest: "A S D F",
      rightHandRest: "J K L ;",
      activeFinger: "thumb",
      fingerDescription: "Official Exam Simulation Mode",
    },
    hasVideoTutorial: chId === 346,
    examType,
  };
}

export function getTypingChapter(id: number): TypingChapter | null {
  if (id < 1 || id > 365) return null;
  if (id <= 40) return generateStage1Lesson(id);
  if (id <= 90) return generateStage2Lesson(id);
  if (id <= 145) return generateStage3Lesson(id);
  if (id <= 195) return generateStage4Lesson(id);
  if (id <= 250) return generateStage5Lesson(id);
  if (id <= 305) return generateStage6Lesson(id);
  if (id <= 345) return generateStage7Lesson(id);
  return generateStage8Lesson(id);
}

export function getAllTypingStages(): TypingStage[] {
  return TYPING_STAGES;
}

export function getChaptersForStage(stageId: number): TypingChapter[] {
  const stage = TYPING_STAGES.find((s) => s.id === stageId);
  if (!stage) return [];
  const chapters: TypingChapter[] = [];
  for (let i = stage.startChapter; i <= stage.endChapter; i++) {
    const ch = getTypingChapter(i);
    if (ch) chapters.push(ch);
  }
  return chapters;
}
