import FSMConfig from "../interfaces/fsm-config.i";
type TransitionRulesType<Config extends FSMConfig> = {
    [State in Config['state']]: Partial<Record<Config['event'], Config['rule']>>;
};
export default TransitionRulesType;
