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
    }
}