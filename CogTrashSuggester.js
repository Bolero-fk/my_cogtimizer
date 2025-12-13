class CogTrashRecommender {
    static recommendTrash(inventory) {
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

        // Initialize all cogs as trash-suggested; we will mark keepers as false below.
        for (const cog of Object.values(inventory.cogs)) {
            if (!cog.isPlayer) cog.isTrashSuggested = true;
        }
    }
}