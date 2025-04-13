import FSMConfigI from "../interfaces/fsm-config.i";
import GuardFn from "./guard-type";

type TransitionRule<Config extends FSMConfigI> = {
    action: Config['transitionFn'];
    guard?: GuardFn<Config>;
}

export default TransitionRule;