import FSMConfigI from "../interfaces/fsm-config.i";
import StateDataI from "../interfaces/state-data.i";

export class CacheMemory<Key extends string, Value extends StateDataI<FSMConfigI>> {
    private store: Record<string, Value> = {} as Record<string, Value>;
    private payloadSensetiveFlag: boolean = false;

    constructor(payloadSensetive: boolean){
        this.payloadSensetiveFlag = payloadSensetive;
    }

    public get(event: Key, appliedData: FSMConfigI['data']): Value | undefined {
        const key = this.generateCacheKey(event, appliedData);
        return this.store[key];
    }
    
    public set(event: Key, value: Value): void {        
        const key = this.generateCacheKey(event, value.appliedData);   
        
        this.store[key] = value;
    }
    
    public has(event: Key, appliedData: FSMConfigI['data']): boolean {         
        if(appliedData){
            const key = this.generateCacheKey(event, appliedData);  
            return this.store[key] !== undefined;
        } else {
            const key = this.generateCacheKey(event, []);  
            return this.store[key] !== undefined;
        }   
    }
    
    public delete(event: Key, payload?: Value): void {
        const key = this.generateCacheKey(event, payload);
        delete this.store[key];
    }
    
    public clear(): void {
        this.store = {};
    }    

    private generateCacheKey(event: Key, payload?: FSMConfigI['data']): string {
        if (!this.payloadSensetiveFlag) return event;
        try {
          const encoded = JSON.stringify(payload ?? null);
          const hash = btoa(encodeURIComponent(encoded));
          return `${event}::${hash}`;
        } catch {
          return `${event}::unknown`;
        }
    }
}