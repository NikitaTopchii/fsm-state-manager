import FSMConfigI from "../interfaces/fsm-config.i";

type GuardFn<Config extends FSMConfigI> = (
    currentState: Config['state'],
    event: Config['event'],
    options: any
) => boolean

export default GuardFn;