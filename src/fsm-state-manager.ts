import Config from "chart.js/dist/core/core.config";
import FSMConfigI from "./interfaces/fsm-config.i";
import StateDataI from "./interfaces/state-data.i";
import { CacheMemory } from "./services/cache-memory";
import TransitionRule from "./types/transition-rule-type";
import TransitionRulesType from "./types/transition-rules-type";

interface FSMOptions {
    devMode?: boolean;
    logTransitions?: boolean;
    cacheEnabled?: boolean;
}

export class StateManagerFSM<Config extends FSMConfigI> {
    private stateData: StateDataI<Config> = { state: '' as Config['state'], appliedData: [] };
    private transitionRules: TransitionRulesType<Config>;
    private options: FSMOptions = { devMode: false, logTransitions: false, };

    private stateCache: CacheMemory<Config['event'], StateDataI<Config>> | null = null;

    constructor(transitionRules: TransitionRulesType<Config>, options: Partial<FSMOptions> = {}){
        this.transitionRules = transitionRules;
        this.options = options;

        if(this.options.cacheEnabled){
            this.stateCache = new CacheMemory<Config['event'], StateDataI<Config>>();
        }
    }

    public setStateData(currentStateData: StateDataI<Config>): void {
        this.stateData = currentStateData;
    }

    public getStateData(): StateDataI<Config> {
        return this.stateData;
    }
  
    public transition(event: Config['event'], appliedData?: Config['data'][]): void {        
        const stateData = this.stateData;

        const startTime = performance.now();

        if (this.options.cacheEnabled && this.stateCache?.has(event)) {
            const cached = this.stateCache.get(event);
            if (cached) {
                this.stateData = cached;
                if (this.options.logTransitions) {
                    console.log(`[FSM] Restored from cache for event '${event}': state '${cached.state}'`);
                }

                const endTime = performance.now();

                console.log(`[FSM Benchmark] Transition for event '${event}' took ${(endTime - startTime).toFixed(4)}ms`);
                
                return;
            }
        }
    
        const transition: TransitionRule<Config> | undefined = this.transitionAction(event);

        if(transition){
            if(!this.checkGuard(event)){                
                console.warn(`[FSM Warn] Guard activated on event '${event}' for state '${stateData.state}'`);
            } else {
                if (this.options.devMode && !transition) {
                    console.warn(`[FSM Warn] Wrong transition: event '${event}' for state '${stateData.state}'`);
                }
        
                if (typeof transition.transitionAction === 'function') {
                    const newState = transition.transitionAction(stateData, { appliedData });
                    if (this.options.logTransitions) {
                        console.log(`[FSM] Transition: '${stateData.state}' state → '${newState.state}' state triggered by '${event}' event`);
                    }
                    this.stateData = newState;

                    if (this.options.cacheEnabled) {
                        this.stateCache?.set(event, newState);
                    }
                }
            }
        } else {
            if (this.options.devMode && !transition) {
                console.warn(`[FSM Warn] Wrong transition: event '${event}' for state '${stateData.state}'`);
            }
        }

        const endTime = performance.now();

        console.log(`[FSM Benchmark] Transition for event '${event}' took ${(endTime - startTime).toFixed(4)}ms`);
    }

    public canTransition(event: Config['event']): boolean {
        const transition = this.transitionAction(event);

        if(!transition){
            if (this.options.devMode) {
                console.warn(`[FSM Warn] We can't transition to another state with event '${event}' from state '${this.stateData.state}'`);
            }

            return false;
        }

        return typeof transition.transitionAction === 'function';
    }

    private transitionAction(event: Config['event']): TransitionRule<Config> | undefined {
        const stateData = this.stateData;
        if (!stateData) {
          return; 
        }
    
        return this.transitionRules[stateData.state][event];
    }

    private checkGuard(event: Config['event']): boolean{
        const transition= this.transitionAction(event);

        if(!transition){
            return true;
        } else {
            return transition.transitionGuard 
                ? transition.transitionGuard(this.stateData.state, event) 
                : true;
        }
    }
}