import FSMConfigI from "./interfaces/fsm-config.i";
import StateDataI from "./interfaces/state-data.i";
import Subscription from "./interfaces/subscription.i";
import { SubscriptionManager } from "./services/subscription-manager";
import TransitionRule from "./types/transition-rule-type";
import TransitionRulesType from "./types/transition-rules-type";

interface FSMOptions {
    devMode?: boolean;
    logTransitions?: boolean;
    subscriptionMode?: boolean;
}

export class StateManagerFSM<Config extends FSMConfigI> {
    private stateData: StateDataI<Config> = { state: '' as Config['state'], appliedData: [] };

    private transitionRules: TransitionRulesType<Config>;

    private options: FSMOptions = { devMode: false, logTransitions: false, subscriptionMode: false };

    private subscriptionManager: SubscriptionManager<Config>;

    constructor(transitionRules: TransitionRulesType<Config>, options: Partial<FSMOptions> = {}){
        this.transitionRules = transitionRules;
        this.options = options;
        this.subscriptionManager = new SubscriptionManager<Config>();

        if (!this.options.subscriptionMode) {
            this.subscribe = (() => {
                throw new Error(
                  'Subscription mode is disabled. ' +
                  'Turn on `subscriptionMode: true` in options, for using .subscribe().'
                );
            }) as this['subscribe'];
        }
    }

    public setStateData(currentStateData: StateDataI<Config>): void {
        this.stateData = currentStateData;

        if(this.options.subscriptionMode) {
            this.subscriptionManager.notify(currentStateData.state, currentStateData);
        }
    }

    public getStateData(): StateDataI<Config> {
        return this.stateData;
    }
  
    public transition(event: Config['event'], appliedData?: Config['data'][]): void {
        if (!this.isInitialized()) {
          throw new Error('[FSM Error] Initial state not set. Use setStateData() first.');
        }
        const rule = this.transitionRules[this.stateData.state][event];
        if (!rule) return this.warnWrongTransition(event);
        if (!this.checkGuard(event)) {
            return this.warnGuard(event);
        }
        this.applyTransition(rule, event, appliedData);
    }

    private isInitialized(): boolean {
        return this.stateData.state !== '';
    }
    
    private warnWrongTransition(event: Config['event']): void {
        if (this.options.devMode) {
          console.warn(`[FSM Warn] Invalid event '${event}' for state '${this.stateData.state}'`);
        }
    }
    
    private warnGuard(event: Config['event']): void {
        console.warn(`[FSM Warn] Guard blocked '${event}' in state '${this.stateData.state}'`);
    }

    private applyTransition(
        rule: TransitionRule<Config>,
        event: Config['event'],
        appliedData?: Config['data'][]
      ) {
        const next = rule.transitionAction!(this.stateData, { appliedData });
        if (this.options.logTransitions) {
            console.log(`[FSM] Transition: '${this.stateData.state}' state → '${next.state}' state triggered by '${event}' event`);
        }
        this.stateData = next;
    
        if (this.options.subscriptionMode) {
          this.subscriptionManager.notify(next.state, next);
        }
    }

    private transitionAction(event: Config['event']): TransitionRule<Config> | undefined {
        const stateData = this.stateData;
        if (!stateData) {
          return; 
        }
    
        return this.transitionRules[stateData.state][event];
    }

    private checkGuard(event: Config['event']): boolean{
        const transition= this.transitionAction(event);

        if(!transition){
            return true;
        } else {
            return transition.transitionGuard 
                ? transition.transitionGuard(this.stateData.state, event) 
                : true;
        }
    }

    public canTransition(event: Config['event']): boolean {
        const transition = this.transitionAction(event);

        if(!transition){
            if (this.options.devMode) {
                console.warn(`[FSM Warn] We can't transition to another state with event '${event}' from state '${this.stateData.state}'`);
            }

            return false;
        }

        return typeof transition.transitionAction === 'function';
    }


    public subscribe(state: Config['state'], callback: (newStateData: StateDataI<Config>) => void): Subscription {
        if (!this.options.subscriptionMode) {
            throw new Error(
                'Subscription mode is disabled. ' +
                'Turn on `subscriptionMode: true` in options, for using .subscribe().'
            );
        }

        return this.subscriptionManager.subscribe(state, callback);
    }
}