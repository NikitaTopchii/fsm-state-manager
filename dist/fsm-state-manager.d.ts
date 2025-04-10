import FSMConfigI from "./interfaces/fsm-config.i";
import StateDataI from "./interfaces/state-data.i";
import TransitionRulesType from "./types/transition-rules-type";
export declare class StateManagerFSM<Config extends FSMConfigI> {
    private stateData;
    private transitionRules;
    constructor(transitionRules: TransitionRulesType<Config>);
    setStateData(currentStateData: StateDataI<Config>): void;
    transition(event: Config['event'], appliedData?: Config['data'][]): void;
    getState(): StateDataI<Config>;
}
