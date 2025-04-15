class CogTrashRecommender {
    static recommendTrash(inventory) {
        const BuildRateCompare = function (a, b) {
            if ((Number(b.buildRadiusBoost) || 0) !== (Number(a.buildRadiusBoost) || 0)) {
                return (Number(b.buildRadiusBoost) || 0) - (Number(a.buildRadiusBoost) || 0);
            }
            return (Number(b.expBonus) || 0) - (Number(a.expBonus) || 0);
        }

        const ExpBonusCompare = function (a, b) {
            if ((Number(b.expRadiusBoost) || 0) !== (Number(a.expRadiusBoost) || 0)) {
                return (Number(b.expRadiusBoost) || 0) - (Number(a.expRadiusBoost) || 0);
            }
            return (Number(b.expBonus) || 0) - (Number(a.expBonus) || 0);
        }

        const ExpCompare = function (a, b) {
            return (Number(b.expBonus) || 0) - (Number(a.expBonus) || 0);
        }

        const UnTrashNums = { "up": 4, "right": 4, "down": 4, "left": 4, "row": 8, "column": 6, "corners": 4, "around": 8, "everything": 8 };
        for (const cogType in UnTrashNums) {
            console.log(cogType);

            const buildRateCogs = Object.values(inventory.cogs)
                .filter(cog => cog.boostRadius === cogType)
                .sort(BuildRateCompare);

            for (let i = 0; i < Math.min(UnTrashNums[cogType], buildRateCogs.length); i++) {
                const key = buildRateCogs[i].key;
                inventory.cogs[key].isTrashRecommended = false;
            }

            const expBonusCogs = Object.values(inventory.cogs)
                .filter(cog => cog.boostRadius === cogType)
                .sort(ExpBonusCompare);

            for (let i = 0; i < Math.min(UnTrashNums[cogType], expBonusCogs.length); i++) {
                const key = expBonusCogs[i].key;
                inventory.cogs[key].isTrashRecommended = false;
            }
        }

        // 残りは47個
        const restNums = 47;
        const expCogs = Object.values(inventory.cogs)
            .filter(cog => !cog.isPlayer)
            .filter(cog => cog.isTrashRecommended)
            .sort(ExpCompare);

        for (let i = 0; i < Math.min(restNums, expCogs.length); i++) {
            const key = expCogs[i].key;
            inventory.cogs[key].isTrashRecommended = false;
        }
    }
}
