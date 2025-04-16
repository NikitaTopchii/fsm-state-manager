
export class CacheMemory<Key extends string, Value> {
    private store: Record<Key, Value> = {} as Record<Key, Value>;

    get(key: Key): Value | undefined {
        return this.store[key];
    }
    
    set(key: Key, value: Value): void {
        this.store[key] = value;
    }
    
    has(key: Key): boolean {
        return key in this.store;
    }
    
    delete(key: Key): void {
        delete this.store[key];
    }
    
    clear(): void {
        this.store = {} as Record<Key, Value>;
    }
}