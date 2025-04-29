import FSMConfigI from "../interfaces/fsm-config.i";
import TransitionGuardFn from "../types/guard-type";
import TransitionRule from "../types/transition-rule-type";
import TransitionRulesType from "../types/transition-rules-type";

type EventToRuleMap<Config extends FSMConfigI> = Partial<{
    [E in Config['event']]: {
      to: Config['state'];
      transitionAction?: Config['transitionFn'];
      transitionGuard?: TransitionGuardFn<Config>;
    };
}>;
  
export class TransitionRulesBuilder<Config extends FSMConfigI> {
    private transitionRules: TransitionRulesType<Config> = {} as TransitionRulesType<Config>;
  
    public addTransitions(
      fromState: Config['state'],
      eventToRuleMap: EventToRuleMap<Config>
    ): this {
      if (!this.transitionRules[fromState]) {
        this.transitionRules[fromState] = {};
      }
  
      for (const [event, rule] of Object.entries(eventToRuleMap) as [Config['event'], {
        to: Config['state'],
        transitionAction?: Config['transitionFn'],
        transitionGuard?: () => boolean
      }][]) {
        const { to, transitionAction, transitionGuard } = rule;

        const emptyAction: Config['transitionFn'] = () => ({ state: to, appliedData: [] });
  
        const defaultAction: Config['transitionFn'] = (data: Config['data'], payload: Config['data']) => {            
            if (!payload.appliedData) {                
              return emptyAction(data, payload);
            }
          
            return payload?.appliedData
              ? { state: to, appliedData: payload.appliedData }
              : data;
        };
  
        (this.transitionRules[fromState] as Record<Config['event'], TransitionRule<Config>>)[event] = {
          transitionAction: transitionAction || defaultAction,
          ...(transitionGuard && { transitionGuard })
        };
      }
  
      return this;
    }
  
    public build(): TransitionRulesType<Config> {
      return this.transitionRules;
    }
}