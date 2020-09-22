export class RangeEmebeddable {
  constructor(data: RangeEmbeddableData, options: any) {
    this.data = data;
  }

  data: RangeEmbeddableData;
}

export interface RangeEmbeddableData {
  name: string;
  description: {
    full: string;
    chat: string;
  };
  min: number;
  max: number;
}

export function isRange(data: any): data is RangeEmbeddableData {
  return (data as RangeEmbeddableData).min !== undefined;
}
