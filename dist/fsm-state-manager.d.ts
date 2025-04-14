import FSMConfigI from "./interfaces/fsm-config.i";
import StateDataI from "./interfaces/state-data.i";
import TransitionRulesType from "./types/transition-rules-type";
interface FSMOptions {
    devMode?: boolean;
    logTransitions?: boolean;
}
export declare class StateManagerFSM<Config extends FSMConfigI> {
    private stateData;
    private transitionRules;
    private options;
    constructor(transitionRules: TransitionRulesType<Config>, options?: Partial<FSMOptions>);
    setStateData(currentStateData: StateDataI<Config>): void;
    getStateData(): StateDataI<Config>;
    transition(event: Config['event'], appliedData?: Config['data'][]): void;
    canTransition(event: Config['event']): boolean;
    private transitionAction;
    private checkGuard;
}
export {};
