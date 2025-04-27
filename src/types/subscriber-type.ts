import FSMConfigI from "../interfaces/fsm-config.i";
import StateDataI from "../interfaces/state-data.i";

type Subscriber<Config extends FSMConfigI> = (stateData: StateDataI<Config>) => void;

export default Subscriber;
