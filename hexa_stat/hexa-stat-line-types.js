class HexaStatLineType {
  static Att = new HexaStatLineType('Att');
  static FlatStat = new HexaStatLineType('FlatStat');
  static CritDmg = new HexaStatLineType('CritDmg');
  static BossDmg = new HexaStatLineType('BossDmg');
  static Dmg = new HexaStatLineType('Dmg');
  static IED = new HexaStatLineType('IED');

  #name;
  constructor(name) {
    this.#name = name;
  }

  get name() {
    return this.#name;
  }
  toString() {
    return `HexaStatLineType.${this.#name}`;
  }
}