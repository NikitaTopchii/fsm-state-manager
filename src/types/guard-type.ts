import FSMConfigI from "../interfaces/fsm-config.i";

type GuardFn<Config extends FSMConfigI> = (
    currentState?: Config['state'],
    event?: Config['event'],
) => boolean

export default GuardFn;