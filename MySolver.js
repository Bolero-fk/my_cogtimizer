function yield() {
  return new Promise(r => setTimeout(r, 1));
}

class Util {
  static generateCombinations(a, b) {
    let result = [];

    function combine(start, chosen) {
      if (chosen.length === b) {
        result.push([...chosen]);
        return;
      }
      for (let i = start; i < a; i++) {
        chosen.push(i);
        combine(i + 1, chosen);
        chosen.pop();
      }
    }

    combine(0, []);
    return result;
  }
}

class MySolver {
  constructor(mode) {
    this.setScoreFunction(mode)
  }

  setScoreFunction(mode) {
    if (mode === "buildRate") {
      this.ScoreFunction = function (inventory) {
        const charaScores = [inventory.calcOnePlayerScore(41), inventory.calcOnePlayerScore(42)]
        return charaScores.reduce((sum, score) => sum + score.buildRate, 0);
      };

      this.CompareCog = function (a, b) { return (Number(b.buildRadiusBoost) || 0) - (Number(a.buildRadiusBoost) || 0) }; 
    }
    else if (mode === "playerEXP") {
      this.ScoreFunction = function (inventory) {
        const charaScores = [inventory.calcOnePlayerScore(41), inventory.calcOnePlayerScore(42)]
        return charaScores.reduce((sum, score) => Math.min(sum, score.expBoost), Number.MAX_SAFE_INTEGER);
      };

      this.CompareCog = function (a, b) { return (Number(b.expRadiusBoost) || 0) - (Number(a.expRadiusBoost) || 0) };
    }
  }

  static _yield() {
    return new Promise(r => setTimeout(r, 1));
  }

  async solve(inventory) {
    const state = inventory.clone();

    this.fixCharaAndAroundCogs(state);

    this.placeRowCogs(state);
    const temp1_inventory = this.placeColCogs(state);

    this.optimizeRestPos(temp1_inventory);
    this.removeUselesMoves(temp1_inventory);
    return temp1_inventory;
  }

  placeRowCogs(inventory) {
    const placeKeys = [36, 37, 38, 47, 46, 45, 39, 44];

    const rowCogs = Object.values(inventory.cogs)
      .filter(cog => cog.boostRadius === "row")
      .sort(this.CompareCog);

    for (let i = 0; i < placeKeys.length; i++) {
      const rowCog = rowCogs[i];
      for (const placeKey of placeKeys) {
        if (inventory.get(placeKey).fixed) continue;

        if (this.CompareCog(rowCog, inventory.get(placeKey)) >= 0) {
          inventory.move(placeKey, rowCog.key);
          inventory.toFixed(placeKey);
          break;
        }
      }
    }
  }

  greedyPlaceCogs(inventory, placeKeys, cogType) {
    const combinations = Util.generateCombinations(placeKeys.length, placeKeys.length / 2);

    let best = null;;
    for (const combination of combinations) {
      for (let i = 0; i < placeKeys.length; i++) {
        if (!combination.includes(i)) {
          combination.push(i);
        }
      }

      let temp_inventory = inventory.clone();
      const colCogs = Object.values(temp_inventory.cogs)
        .filter(cog => cog.boostRadius === cogType)
        .sort(this.CompareCog);

      for (let i = 0; i < combination.length; i++) {
        const colCog = colCogs[i];
        const toKey = placeKeys[combination[i]];
        temp_inventory.move(colCog.key, toKey);
        temp_inventory.toFixed(toKey);
      }

      if (best === null || this.ScoreFunction(best) < this.ScoreFunction(temp_inventory)) {
        best = temp_inventory;
      }
    }

    return best;
  }

  placeColCogs(inventory) {
    const placeKeys = [5, 77, 89, 6, 78, 90];
    return this.greedyPlaceCogs(inventory, placeKeys, "column");
  }

  // I assume that characters exist at keys 41 and 42, 
  // and that there are Yang cogs around the characters.
  fixCharaAndAroundCogs(inventory) {
    const keysToFix = [29, 30, 40, 41, 42, 43, 53, 54];
    for (const keyToFix of keysToFix) {
      inventory.toFixed(keyToFix);
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
        const maxCogExp = Number(maxCog.expBonus) || 0;
        const currentCogExp = Number(currentCog.expBonus) || 0;
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