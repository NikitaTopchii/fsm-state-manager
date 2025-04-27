import FSMConfigI from "../interfaces/fsm-config.i";
import StateDataI from "../interfaces/state-data.i";
import Subscription from "../interfaces/subscription.i";
import Subscriber from "../types/subscriber-type";

export class SubscriptionManager<Config extends FSMConfigI> {
    private subscribers: Record<string, { state: Config['state'], callback: Subscriber<Config> }> = {};
    private idCounter = 0;

    public subscribe(state: Config['state'], callback: Subscriber<Config>): Subscription {
        const id = `sub_${this.idCounter++}`;
        this.subscribers[id] = { state, callback };

        return {
            unsubscribe: () => {
                delete this.subscribers[id];
            }
        };
    }

    public notify(state: Config['state'], newStateData: StateDataI<Config>): void {
        for (const key in this.subscribers) {
            if (this.subscribers[key].state === state) {
                this.subscribers[key].callback(newStateData);
            }
        }
    }
}