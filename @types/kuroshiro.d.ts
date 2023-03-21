declare module 'kuroshiro' {
    export default class Kuroshiro {
      constructor();
      init(analyzer: any): Promise<void>;
      convert(text: string, options?: any): Promise<string>;
      getKanji(text: string, options?: any): Promise<string[]>;
      getKana(text: string, options?: any): Promise<string[]>;
      getRomaji(text: string, options?: any): Promise<string>;
      setMode(mode: string): void;
      getMode(): string;
      setType(type: string): void;
      getType(): string;
      setOption(option: string, value: any): void;
      getOption(option: string): any;
    }
  }
  