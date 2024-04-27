class HexaSeeker extends HexaMasteryNode {
    static #HexaSeekerMaxLevel = 30;

    static #SeekerBaseScale = 320;
    static #HexaSeekerBaseScale = 342;
    static #HexaSeekerLevelScale = 3;

    constructor(skillInputTotal) {
        super(HexaSkillName.Seeker, skillInputTotal, HexaSeeker.#HexaSeekerMaxLevel);
    }

    #getSeekerScalingAtLevel(level) {
        if (level == 0) {
            return HexaSeeker.#SeekerBaseScale;
        }
        return HexaSeeker.#HexaSeekerBaseScale + HexaSeeker.#HexaSeekerLevelScale * level;
    }

    getSkillMultiplierAtLevel(level) {
        if (this.hexaSkillName == HexaSkillName.Seeker) {
            return this.#getSeekerScalingAtLevel(level) / HexaSeeker.#SeekerBaseScale;
        }
        throw new TypeError("Unknown mastery node being processed");
    }
}