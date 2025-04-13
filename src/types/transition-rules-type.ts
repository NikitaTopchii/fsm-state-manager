import FSMConfig from "../interfaces/fsm-config.i";
import TransitionRule from "./transition-rule-type";

type TransitionRulesType<Config extends FSMConfig> = {
    [State in Config['state']]: Partial<Record<Config['event'], TransitionRule<Config>>>;
};

export default TransitionRulesType;