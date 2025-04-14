import FSMConfigI from "../interfaces/fsm-config.i";

type TransitionGuardFn<Config extends FSMConfigI> = (
    currentState?: Config['state'],
    event?: Config['event'],
) => boolean

export default TransitionGuardFn;