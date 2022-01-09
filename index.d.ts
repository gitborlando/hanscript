interface IHanScript {
  compile(source: string): string;
  onComplete(callback: Function): void;
  run(code: string, options?: any): void
}

const HanScript: IHanScript
export default HanScript