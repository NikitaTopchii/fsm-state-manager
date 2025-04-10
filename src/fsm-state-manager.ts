import FSMConfigI from "./interfaces/fsm-config.i";
import StateDataI from "./interfaces/state-data.i";
import TransitionRulesType from "./types/transition-rules-type";

export class StateManagerFSM<Config extends FSMConfigI> {
    private stateData: StateDataI<Config> = { state: '' as Config['state'], appliedData: [] };
    private transitionRules: TransitionRulesType<Config>;

    constructor(transitionRules: TransitionRulesType<Config>){
        this.transitionRules = transitionRules;
    }

    public setStateData(currentStateData: StateDataI<Config>): void {
        this.stateData = currentStateData;
    }
  
    public transition(event: Config['event'], appliedData?: Config['data'][]): void {        
        const stateData = this.stateData;
        if (!stateData) {
          return;
        }
    
        const transitionAction = this.transitionRules[stateData.state][event];

        if (typeof transitionAction === 'function') {
          this.stateData = transitionAction(stateData, { appliedData });
        }
    }
    
    public getState(): StateDataI<Config> {
        return this.stateData;
    }
}