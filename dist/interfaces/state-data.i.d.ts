import FSMConfig from "./fsm-config.i";
interface StateDataI<Config extends FSMConfig> {
    state: Config['state'];
    appliedData: Config['data'][];
}
export default StateDataI;
