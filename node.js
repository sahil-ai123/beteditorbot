import { initializeApp } from "firebase/app";
import { getDatabase, ref, onChildAdded, onValue, update } from "firebase/database";

// Firebase config
const firebaseConfig = {
  databaseURL: "https://luckyden-71993-default-rtdb.firebaseio.com/"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function addTeamBets(roundRef) {
  const bearCount = Math.floor(Math.random() * (1500 - 500 + 1)) + 500;
  const bullCount = Math.floor(Math.random() * (1500 - 500 + 1)) + 500;

  let bearTeamBets = [];
  let bullTeamBets = [];

  for (let i = 0; i < bearCount; i++) {
    bearTeamBets.push(i.toString());
  }
  for (let i = 0; i < bullCount; i++) {
    bullTeamBets.push(i.toString());
  }

  // Simulate natural delay
  await sleep(10000);

  await update(roundRef, {
    bearTeamBets,
    bullTeamBets
  });

  console.log(`Added ${bearCount} bearTeamBets and ${bullCount} bullTeamBets`);
  return { bearCount, bullCount };
}

async function addPoints(roundRef, bearCount, bullCount) {
  const bearPoints = Math.floor(Math.random() * (bearCount * 5));
  const bullPoints = Math.floor(Math.random() * (bullCount * 5));

  await sleep(12000);

  await update(roundRef, {
    bearPoints,
    bullPoints
  });

  console.log(`Added ${bearPoints} bearPoints and ${bullPoints} bullPoints`);
}

// Watch for new rounds
const roundsRef = ref(db, "rounds");
onChildAdded(roundsRef, (snapshot) => {
  const roundKey = snapshot.key;
  const roundRef = ref(db, `rounds/${roundKey}`);
  let bearCount = 0, bullCount = 0;

  // Listen for changes in this round
  onValue(roundRef, async (snap) => {
    const roundData = snap.val();
    if (!roundData) return;

    if (roundData.status === "betting" && !roundData.bearTeamBets) {
      ({ bearCount, bullCount } = await addTeamBets(roundRef));
    }

    if (roundData.status === "rolling" && !roundData.bearPoints) {
      await addPoints(roundRef, bearCount, bullCount);
    }
  });
});
