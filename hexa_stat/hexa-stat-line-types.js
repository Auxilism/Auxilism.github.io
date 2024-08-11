class HexaStatLineType
{
  static Att = new HexaStatLineType('att');
  static FlatStat = new HexaStatLineType('flat stat');
  static CritDmg = new HexaStatLineType('crit dmg');
  static BossDmg = new HexaStatLineType('boss dmg');
  static Dmg = new HexaStatLineType('dmg');
  static IED = new HexaStatLineType('ied');

  #name;
  constructor(name)
  {
    this.#name = name;
  }

  get name()
  {
    return this.#name;
  }

  toString()
  {
    return `HexaStatLineType.${this.#name}`;
  }
}

class HexaStatTypeFDPair
{
    // HexaStatLineType
    #type;
    // float
    #fdPerUnit;

    constructor(type, fdPerUnit)
    {
        this.#type = type;
        this.#fdPerUnit = fdPerUnit;
    }

    get type()
    {
        return this.#type;
    }

    get fdPerUnit()
    {
        return this.#fdPerUnit;
    }
}