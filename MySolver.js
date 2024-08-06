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

      this.CompareCog = function (a, b) {
        if ((Number(b.buildRadiusBoost) || 0) !== (Number(a.buildRadiusBoost) || 0)) {
          return (Number(b.buildRadiusBoost) || 0) - (Number(a.buildRadiusBoost) || 0);
        }
        return (Number(b.expBonus) || 0) - (Number(a.expBonus) || 0);
      }; 
    }
    else if (mode === "playerEXP") {
      this.ScoreFunction = function (inventory) {
        const charaScores = [inventory.calcOnePlayerScore(41), inventory.calcOnePlayerScore(42)]
        return charaScores.reduce((sum, score) => Math.min(sum, score.expBoost), Number.MAX_SAFE_INTEGER);
      };

      this.CompareCog = function (a, b) {
        if ((Number(b.expRadiusBoost) || 0) !== (Number(a.expRadiusBoost) || 0)) {
          return (Number(b.expRadiusBoost) || 0) - (Number(a.expRadiusBoost) || 0);
        }
        return (Number(b.expBonus) || 0) - (Number(a.expBonus) || 0);
      };
    }
  }

  static _yield() {
    return new Promise(r => setTimeout(r, 1));
  }

  async solve(inventory) {
    const state = inventory.clone();

    this.fixCharaAndAroundCogs(state);

    const temp1_inventory = this.placeColCogs(state);
    const temp2_inventory = this.placeCornersCogs(temp1_inventory);
    const temp3_inventory = this.placeRestBoostCogs(temp2_inventory);

    this.optimizeRestPos(temp3_inventory);
    this.removeUselesMoves(temp3_inventory);
    return temp3_inventory;
  }

  greedyPlaceCogs(inventory, placeKeys, cogType) {
    const combinations = Util.generateCombinations(placeKeys.length, placeKeys.length / 2);

    let best = inventory;
    for (const combination of combinations) {
      for (let i = 0; i < placeKeys.length; i++) {
        if (!combination.includes(i)) {
          combination.push(i);
        }
      }

      const tempInventory = inventory.clone();
      const cogs = Object.values(tempInventory.cogs)
        .filter(cog => cog.boostRadius === cogType)
        .sort(this.CompareCog);

      for (let i = 0; i < Math.min(combination.length, cogs.length); i++) {
        const toKey = placeKeys[combination[i]];
        tempInventory.move(cogs[i].key, toKey);
        tempInventory.toFixed(toKey);
      }

      if (this.ScoreFunction(best) <= this.ScoreFunction(tempInventory)) {
        best = tempInventory;
      }
    }

    return best;
  }

  greedyPlaceCogs2(inventory, placeKeys, cogType) {
    placeKeys = placeKeys.filter(key => inventory.unFixedKeys.includes(key));

    const cogs = Object.values(inventory.cogs)
      .filter(cog => cog.boostRadius === cogType)
      .sort(this.CompareCog);

    for (let i = 0; i < Math.min(placeKeys.length, cogs.length); i++) {
      inventory.move(cogs[i].key, placeKeys[i]);
      inventory.toFixed(placeKeys[i]);
    }
  }

  placeRestBoostCogs(inventory) {
    const placeKeys  = [17, 18, 39, 44, 65, 66];

    let best = inventory;
    for (let i1 = 0; i1 < placeKeys.length; i1++) {
      for (let i2 = i1 + 1; i2 < placeKeys.length; i2++) {

        const tempInventory = inventory.clone();
        const yangCogs = Object.values(inventory.cogs)
          .filter(cog => cog.boostRadius === "around" && !cog.fixed)

        tempInventory.move(yangCogs[0].key, placeKeys[i1]);
        tempInventory.toFixed(placeKeys[i1]);

        tempInventory.move(yangCogs[1].key, placeKeys[i2]);
        tempInventory.toFixed(placeKeys[i2]);

        this.placeRowCogs(tempInventory);
        this.placeDownCogs(tempInventory);
        this.placeRightCogs(tempInventory);
        this.placeLeftCogs(tempInventory);
        this.placeUpCogs(tempInventory);

        if (this.ScoreFunction(best) <= this.ScoreFunction(tempInventory)) {
          best = tempInventory;
        }
      }
    }

    return best;
  }

  placeRowCogs(inventory) {
    const placeKeys = [36, 47, 37, 46, 38, 45, 39, 44];
    return this.greedyPlaceCogs2(inventory, placeKeys, "row");
  }

  placeColCogs(inventory) {
    const placeKeys = [5, 77, 89, 6, 78, 90];
    return this.greedyPlaceCogs(inventory, placeKeys, "column");
  }

  placeCornersCogs(inventory) {
    const placeKeys = [15, 63, 20, 68];
    return this.greedyPlaceCogs(inventory, placeKeys, "corners");
  }

  placeDownCogs(inventory) {
    const placeKeys = [17, 18, 16, 19];
    return this.greedyPlaceCogs2(inventory, placeKeys, "down");
  }

  placeRightCogs(inventory) {
    const placeKeys = [28, 52, 27, 51];
    return this.greedyPlaceCogs2(inventory, placeKeys, "right");
  }

  placeLeftCogs(inventory) {
    const placeKeys = [31, 55, 32, 56];
    return this.greedyPlaceCogs2(inventory, placeKeys, "left");
  }

  placeUpCogs(inventory) {
    const placeKeys = [65, 66, 64, 67];
    return this.greedyPlaceCogs2(inventory, placeKeys, "up");
  }

  // I assume that characters exist at keys 41 and 42, 
  // and that there are Yang cogs around the characters.
  fixCharaAndAroundCogs(inventory) {
    const keysToFix = [29, 30, 40, 41, 42, 43, 53, 54];
    for (const keyToFix of keysToFix) {
      inventory.toFixed(keyToFix);
    }

    const everythingCogs = Object.values(inventory.cogs)
      .filter(cog => cog.boostRadius === "everything")

    for (const everythingCog of everythingCogs) {
      inventory.toFixed(everythingCog.key);
    }
  }

  optimizeRestPos(inventory) {
    for (let key of inventory.unFixedKeys) {
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
    const goal1 = inventory.score;
    const goal2 = this.ScoreFunction(inventory);
    const cogsToMove = Object.values(inventory.cogs)
      .filter((c) => c.key !== c.initialKey);
    // Check if move still changes something
    for (let i = 0; i < cogsToMove.length; i++) {
      const cog1 = cogsToMove[i];
      const cog1Key = cog1.key;
      const cog2Key = cog1.initialKey;
      inventory.move(cog1Key, cog2Key);
      const changed1 = inventory.score;
      const changed2 = this.ScoreFunction(inventory);
      if (changed1.buildRate === goal1.buildRate
        && changed1.flaggy === goal1.flaggy
        && changed1.expBonus === goal1.expBonus
        && changed1.expBoost === goal1.expBoost
        && changed1.flagBoost === goal1.flagBoost
        && changed2 === goal2) {
        console.log(`Removed useless move ${cog1Key} to ${cog2Key}`);
        continue;
      }
      inventory.move(cog1Key, cog2Key);
    }
  }
}