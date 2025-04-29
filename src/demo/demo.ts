import { TransitionRulesBuilder } from "../features/transition-rules-builder";
import { StateManagerFSM } from "../fsm-state-manager";
import FSMConfigI from "../interfaces/fsm-config.i";
import TransitionRulesType from "../types/transition-rules-type";

type HttpRequestStateType = 'init' | 'loading' | 'loaded' | 'error';

type HttpRequestEventType = 'fetch' | 'success' | 'failure' | 'retry';

type TransitionHttpRequestStateFn<Config extends HttpRequestFSMConfigI> = (
    data: Config['data'],
    payload?: { appliedData?: Config['data'] } 
  ) => Config['data'];

interface HttpRequestFSMConfigI extends FSMConfigI{
    state: HttpRequestStateType,
    event: HttpRequestEventType,
    rule: TransitionHttpRequestStateFn<HttpRequestFSMConfigI>, 
    data: any
}

const HttpRequestTransitionRules: TransitionRulesType<HttpRequestFSMConfigI> = {
    init: {
      fetch: {
        transitionAction: () => ({
            state: 'loading',
            appliedData: [],
        })
      },
    },
    loading: {
      success: {
        transitionAction: (data: any, payload: any) =>
            payload?.appliedData
              ? { state: 'loaded', appliedData: payload.appliedData }
              : data,
        transitionGuard: () => 1 + 1 === 2,
      },
      failure: {
        transitionAction: (data: any, payload: any) =>
            payload?.appliedData
              ? { state: 'error', appliedData: payload.appliedData }
              : data,
      }
    },
    loaded: {
      fetch: {
        transitionAction: () => ({
            state: 'loading',
            appliedData: [],
          }),
      }
    },
    error: {
      retry: {
        transitionAction: () => ({
            state: 'loading',
            appliedData: [],
          }),
      }
    },
  };

const stateManager = new StateManagerFSM(HttpRequestTransitionRules, { subscriptionMode: true });

stateManager.setStateData({ state: 'init', appliedData: [] })

function logTransitionTime(event: string, time: number) {
  const barLength = Math.round(time * 100);
  let bar = '🟩'.repeat(barLength);
  if(barLength > 4){
    bar = '🟨'.repeat(barLength);
  }

  if(barLength > 7){
    bar = '🟥'.repeat(barLength)
  }
  const paddedEvent = event.padEnd(10, ' ');
  console.log(`[FSM 👀] ${paddedEvent} ${time.toFixed(10)}ms ${bar}`);
}

function benchmarkTransition(event: HttpRequestFSMConfigI['event'], payload?: any[]) {
  const start = performance.now();
  stateManager.transition(event, payload);
  const end = performance.now();
  const duration = end - start;
  logTransitionTime(event, duration);
}

const subscribtion = stateManager.subscribe('loaded', () => {})

benchmarkTransition('fetch');
benchmarkTransition('success', ['data1', 'data2']);

subscribtion.unsubscribe();

benchmarkTransition('fetch');
benchmarkTransition('success', ['data1', 'data2']);

const builder = new TransitionRulesBuilder<HttpRequestFSMConfigI>();

const rules = builder
  .addTransitions('init', {
    fetch: {
      to: 'loading',
    }
  })
  .addTransitions('loaded', {
    fetch: {
      to: 'loading',
    }
  })
  .addTransitions('loading', {
    success: {
      to: 'loaded',
    },
    failure: {
      to: 'error',
    }
  })
  .addTransitions('error', {
    retry: {
      to: 'loading',
    }
  })
  .build();

const stateManager2 = new StateManagerFSM(rules, { subscriptionMode: true });

stateManager2.setStateData({ state: 'init', appliedData: [] })

console.log(stateManager2.getStateData());

stateManager2.transition('fetch');
stateManager2.transition('success', ['data1', 'data2']);

console.log(stateManager2.getStateData());

