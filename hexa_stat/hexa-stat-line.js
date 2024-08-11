class HexaStatLine
{
    static MAX_LEVEL = 10;

    #level = 0;
    #typeFDPair;
    #isMain = false;

    constructor(typeFDPair, isMain = false)
    {
        this.#typeFDPair = typeFDPair;
        this.#isMain = isMain;
    }

    get typeFDPair()
    {
        return this.#typeFDPair;
    }

    set typeFDPair(newTypeFDPair)
    {
        this.#typeFDPair = newTypeFDPair;
    }

    get level()
    {
        return this.#level;
    }

    getTotalUnits()
    {
        if (!this.#isMain)
        {
            return this.#level;
        }

        // Else accumulate the units
        let totalUnits = 0;
        for (let i = 1; i <= this.#level; i++)
        {
            totalUnits += this.#getNumUnitsPerMainLevel(i);
        }
        return totalUnits;
    }

    getTotalFDPercent()
    {
        return this.getTotalUnits() * this.#typeFDPair.fdPerUnit;
    }

    levelUp()
    {
        this.#level += 1;
        if (this.#level > HexaStatLine.MAX_LEVEL)
        {
            throw new RangeError("Levelling hexa stat above known max.")
        }
    }

    canLevelUp()
    {
        if (this.#level == HexaStatLine.MAX_LEVEL)
        {
            return false;
        }
        return true;
    }

    #getNumUnitsPerMainLevel(level)
    {
        // Get non-linear values according to https://en.namu.wiki/w/HEXA%20%EB%A7%A4%ED%8A%B8%EB%A6%AD%EC%8A%A4#s-2.2
        switch (level)
        {
            case 1:
            case 2:
            case 3:
            case 4:
                return 1;
            case 5:
            case 6:
            case 7:
                return 2;
            case 8:
            case 9:
                return 3;
            case 10:
                return 4;
            default:
                throw new RangeError("Level of stat line is not within range.");
        }
    }

    getMainLevelUpChance()
    {
        // Get non-linear values according to https://en.namu.wiki/w/HEXA%20%EB%A7%A4%ED%8A%B8%EB%A6%AD%EC%8A%A4#s-2.3
        switch (this.#level)
        {
            case 0:
            case 1:
            case 2:
                return 35;
            case 3:
            case 4:
            case 5:
            case 6:
                return 20;
            case 7:
                return 15;
            case 8:
                return 10;
            case 9:
                return 5;
            default:
                throw new RangeError("Level of stat line is not within range.");
        }
    }

    getFragmentCost()
    {
        // Get non-linear values according to https://en.namu.wiki/w/HEXA%20%EB%A7%A4%ED%8A%B8%EB%A6%AD%EC%8A%A4#s-2.3
        switch (this.#level)
        {
            case 0:
            case 1:
            case 2:
                return 10;
            case 3:
            case 4:
            case 5:
            case 6:
                return 20;
            case 7:
            case 8:
                return 30;
            case 9:
                return 50;
            // The wiki does not list this value at all, but putting the same value as lvl 9 for now.
            // It is incredibly unlikely to reach lvl 10 main stat before the total of 20, but it is possible. Like it's possible to get 25*.
            case 10:
                return 50;
            default:
                throw new RangeError("Level of stat line is not within range.");
        }
    }

    // Not using setter function because this should be used specifically to hijack the leveling system
    setLevel(level)
    {
        if (level > HexaStatLine.MAX_LEVEL)
        {
            throw new RangeError(`Levelling hexa stat above known max of ${HexaStatLine.MAX_LEVEL}`)
        }
        this.#level = level;
    }

    printInfo()
    {
        console.log("Type:", this.#typeFDPair.type, "Level:", this.#level);
    }
}