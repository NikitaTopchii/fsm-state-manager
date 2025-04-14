import FSMConfigI from "../interfaces/fsm-config.i";
import TransitionGuardFn from "./guard-type";

type TransitionRule<Config extends FSMConfigI> = {
    transitionAction: Config['transitionFn'];
    transitionGuard?: TransitionGuardFn<Config>;
}

export default TransitionRule;