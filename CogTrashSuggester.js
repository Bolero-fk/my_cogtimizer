class CogTrashSuggester {
    static suggestTrash(inventory) {
        const num = (v) => Number(v) || 0;
        const BuildBonusCompare = function (a, b) {
            if (num(b.buildRadiusBoost) !== num(a.buildRadiusBoost)) {
                return num(b.buildRadiusBoost) - num(a.buildRadiusBoost);
            }
            return num(b.expBonus) - num(a.expBonus);
        }

        const ExpBonusCompare = function (a, b) {
            if (num(b.expRadiusBoost) !== num(a.expRadiusBoost)) {
                return num(b.expRadiusBoost) - num(a.expRadiusBoost);
            }
            return num(b.expBonus) - num(a.expBonus);
        }

        const ExpCompare = function (a, b) {
            return num(b.expBonus) - num(a.expBonus);
        }

        const KEEP_COUNTS_BY_RADIUS = {
            "up": 4,
            "right": 4,
            "down": 4,
            "left": 4,
            "row": 8,
            "column": 6,
            "corners": 4,
            "around": 8,
            "everything": 8,
        };

        // BOARD_CAPACITY (8x12) - placeable directional cogs - two players
        const MAX_EXP_KEEP_COUNT = 46;

        // Initialize trash-suggested flags for all cogs.
        for (const cog of Object.values(inventory.cogs)) {
            cog.isTrashSuggested = !cog.isPlayer;
        }

        const markKeepTopN = (sortedCogs, n) => {
            for (let i = 0; i < Math.min(n, sortedCogs.length); i++) {
                inventory.cogs[sortedCogs[i].key].isTrashSuggested = false;
            }
        };

        for (const [cogType, keepN] of Object.entries(KEEP_COUNTS_BY_RADIUS)) {
            const buildRateCogs = Object.values(inventory.cogs)
                .filter(cog => cog.boostRadius === cogType)
                .sort(BuildBonusCompare);
            markKeepTopN(buildRateCogs, keepN);

            const expBonusCogs = Object.values(inventory.cogs)
                .filter(cog => cog.boostRadius === cogType)
                .sort(ExpBonusCompare);
            markKeepTopN(expBonusCogs, keepN);
        }

        const expCogs = Object.values(inventory.cogs)
            .filter(cog => !cog.isPlayer)
            .filter(cog => cog.isTrashSuggested)
            .sort(ExpCompare);
        markKeepTopN(expCogs, MAX_EXP_KEEP_COUNT);
    }
}