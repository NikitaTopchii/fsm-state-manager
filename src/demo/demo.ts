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

const stateManager = new StateManagerFSM(HttpRequestTransitionRules, { 
  devMode: false, 
  logTransitions: false, 
});

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

for(let i = 0; i < 1000; i++){
  setTimeout(() => {
    benchmarkTransition('fetch')
    benchmarkTransition('success', ['data'])
  }, i*100)
}