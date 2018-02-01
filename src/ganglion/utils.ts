export class seededRandom{
  seed: number;

  constructor(seed: number){
    this.seed = seed;
  }

  public next(min?: number, max?: number): number{
    max = max || 1;
    min = min || 0;

    this.seed = (this.seed * 9301 + 49297) % 233280;
    let rnd = this.seed / 233280;

    return min + rnd * (max - min);
  }
}
