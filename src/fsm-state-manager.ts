import Config from "chart.js/dist/core/core.config";
import FSMConfigI from "./interfaces/fsm-config.i";
import StateDataI from "./interfaces/state-data.i";
import TransitionRule from "./types/transition-rule-type";
import TransitionRulesType from "./types/transition-rules-type";

interface FSMOptions {
    devMode?: boolean;
    logTransitions?: boolean;
    asyncMode?: boolean;
}

export class StateManagerFSM<Config extends FSMConfigI> {
    private stateData: StateDataI<Config> = { state: '' as Config['state'], appliedData: [] };
    private transitionRules: TransitionRulesType<Config>;
    private options: FSMOptions;

    constructor(transitionRules: TransitionRulesType<Config>, options: FSMOptions = {}){
        this.transitionRules = transitionRules;
        this.options = options;
    }

    public setStateData(currentStateData: StateDataI<Config>): void {
        this.stateData = currentStateData;
    }

    public getStateData(): StateDataI<Config> {
        return this.stateData;
    }
  
    public transition(event: Config['event'], appliedData?: Config['data'][]): void {        
        const stateData = this.stateData;
    
        const transition: TransitionRule<Config> | undefined = this.transitionAction(event);

        if(transition){
            if(!this.checkGuard(event)){                
                console.warn(`[FSM] Guard activated on event '${event}' for state '${stateData.state}'`);
            } else {
                if (this.options.devMode && !transition) {
                    console.warn(`[FSM] Wrong transition: event '${event}' for state '${stateData.state}'`);
                }
        
                if (typeof transition.action === 'function') {
                    const newState = transition.action(stateData, { appliedData });
                    if (this.options.logTransitions) {
                        console.log(`[FSM] Transition: '${stateData.state}' state → '${newState.state}' state triggered by '${event}' event`);
                    }
                    this.stateData = newState;
                }
            }
        } else {
            return;
        }
    }

    public canTransition(event: Config['event']): boolean {
        return typeof this.transitionAction(event) === 'function';
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
            return transition.guard 
                ? transition.guard(this.stateData.state, event, '') 
                : true;
        }
    }
}