function yield() {
  return new Promise(r => setTimeout(r, 1));
}

class MySolver {
  constructor(mode) {
    this.setScoreFunction(mode)
  }

  setScoreFunction(mode) {
    if (mode === "buildRate") {
      this.ScoreFunction = function (charaScore) {
        return charaScore.Characters.reduce((sum, chara) => sum + chara.buildRate, 0);
      };
    }
    else if (mode === "playerEXP") {
      this.ScoreFunction = function (charaScore) {
        return charaScore.Characters.reduce((sum, chara) => Math.min(sum, chara.exp), Number.MAX_SAFE_INTEGER);
      };
    }
  }

  getScoreSum(score) {
    return this.ScoreFunction(score);
  }

  static _yield() {
    return new Promise(r => setTimeout(r, 1));
  }

  async solve(inventory) {
    const state = inventory.clone();
    this.optimizeRestPos(state);
    this.removeUselesMoves(inventory);
    return state;
    /*
    if (inventory.flagPose.length === 0) {
      // No flaggs placed means no use for flaggy rate
      this.weights.flaggy = 0;
    }
    console.log("Solving with goal:", this.weights);
    let lastYield = Date.now();
    let state = inventory.clone();
    const solutions = [state];
    const startTime = Date.now();
    const allSlots = inventory.availableSlotKeys;
    let counter = 0;
    let currentScore = this.getScoreSum(state.score);

    console.log("Trying to optimize");
    while (Date.now() - startTime < solveTime) {
      if (Date.now() - lastYield > 100) {
        // Prevent UI from freezing with very high solve times
        await Solver._yield();
        lastYield = Date.now();
      }
      counter++;
      if (counter % 10000 === 0) {
        state = inventory.clone();
        this.shuffle(state);
        currentScore = this.getScoreSum(state.score);
        solutions.push(state);
      }
      const slotKey = allSlots[Math.floor(Math.random() * allSlots.length)];
      // Moving a cog to an empty space changes the list of cog keys, so we need to re-fetch this
      const allKeys = state.cogKeys;
      const cogKey = allKeys[Math.floor(Math.random() * allKeys.length)];
      const slot = state.get(slotKey);
      const cog = state.get(cogKey);

      if (slot.fixed || cog.fixed || cog.position().location === "build") continue;
      state.move(slotKey, cogKey);
      const scoreSumUpdate = this.getScoreSum(state.score);
      if (scoreSumUpdate > currentScore) {
        currentScore = scoreSumUpdate;
      } else {
        state.move(slotKey, cogKey);
      }
    }
    console.log(`Tried ${counter} switches`);
    const scores = solutions.map((s) => this.getScoreSum(s.score));
    console.log(`Made ${solutions.length} different attempts with final scores: ${scores}`);
    const bestIndex = scores.indexOf(scores.reduce((a, b) => Math.max(a, b)));
    let best = solutions[bestIndex];
    if (g.best === null || this.getScoreSum(g.best.score) < scores[bestIndex]) {
      console.log("Best solution was number", bestIndex);
      g.best = best;
    } else {
      best = g.best;
    }
    this.removeUselesMoves(best);
    return best;*/
  }

  shuffle(inventory, n = 500) {
    const allSlots = inventory.availableSlotKeys;
    for (let i = 0; i < n; i++) {
      const slotKey = allSlots[Math.floor(Math.random() * allSlots.length)];
      // Moving a cog to an empty space changes the list of cog keys, so we need to re-fetch this
      const allKeys = inventory.cogKeys;
      const cogKey = allKeys[Math.floor(Math.random() * allKeys.length)];
      const slot = inventory.get(slotKey);
      const cog = inventory.get(cogKey);

      if (slot.fixed || cog.fixed || cog.position().location === "build") continue;
      inventory.move(slotKey, cogKey);
    }
  }

  optimizeRestPos(inventory) {
    for (let key of inventory.availableSlotKeys) {
      const cog = inventory.get(key);
      if (cog.fixed) continue;

      const spareCogs = Object.keys(inventory.cogs)
        .filter(key => Number(key) >= 108)
        .map(key => inventory.get(key));

      const maxExpCog = spareCogs.reduce((maxCog, currentCog) => {
        const maxCogExp = isNaN(maxCog.expBonus) ? 0 : maxCog.expBonus;
        const currentCogExp = isNaN(currentCog.expBonus) ? 0 : currentCog.expBonus;
        return (currentCogExp > maxCogExp) ? currentCog : maxCog;
      }, spareCogs[0]);

      if (isNaN(cog.expBonus) || cog.expBonus < maxExpCog.expBonus) {
        inventory.move(key, maxExpCog.key);
      }
    }
  }

  removeUselesMoves(inventory) {
    const goal = inventory.score;
    const cogsToMove = Object.values(inventory.cogs)
      .filter((c) => c.key !== c.initialKey);
    // Check if move still changes something
    for (let i = 0; i < cogsToMove.length; i++) {
      const cog1 = cogsToMove[i];
      const cog1Key = cog1.key;
      const cog2Key = cog1.initialKey;
      inventory.move(cog1Key, cog2Key);
      const changed = inventory.score;
      if (changed.buildRate === goal.buildRate
        && changed.flaggy === goal.flaggy
        && changed.expBonus === goal.expBonus
        && changed.expBoost === goal.expBoost
        && changed.flagBoost === goal.flagBoost) {
        console.log(`Removed useless move ${cog1Key} to ${cog2Key}`);

        continue;
      }
      inventory.move(cog1Key, cog2Key);
    }
  }
}