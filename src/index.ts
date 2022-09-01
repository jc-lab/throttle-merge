export interface Request<REQ, RES> {
  data: REQ;
  resolve: (res: RES) => void;
  reject: (err: any) => void;
}

export interface ThrottleMergeOptions<REQ, RES> {
  throttleTime: number;
  executor: (requests: Request<REQ, RES>[]) => void;
}

export class ThrottleMerge<REQ, RES> {
  private options: ThrottleMergeOptions<REQ, RES>;

  private timeout: NodeJS.Timeout | null = null;
  private queue: Request<REQ, RES>[] = [];

  constructor(options: Partial<ThrottleMergeOptions<REQ, RES>>) {
    this.options = {
      executor: options.executor as any,
      throttleTime: options.throttleTime || 250,
    };
  }

  public request(data: REQ): Promise<RES> {
    return new Promise<RES>((resolve, reject) => {
      if (this.timeout) {
        clearTimeout(this.timeout);
      }
      this.timeout = setTimeout(() => this.execute(), this.options.throttleTime);

      this.queue.push({
        data,
        resolve,
        reject
      });
    });
  }

  private execute(): void {
    const merged = this.queue;
    this.queue = [];
    this.timeout = null;
    this.options.executor(merged);
  }
}

export default ThrottleMerge;
