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
        transitionGuard: () => doSomething(),
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

const doSomething = () => { return true }

const stateManager = new StateManagerFSM(HttpRequestTransitionRules, { 
  devMode: true, 
  logTransitions: true, 
  cacheEnabled: true
});

stateManager.setStateData({ state: 'init', appliedData: [] });

stateManager.transition('fetch'); //[FSM] Transition: 'init' state → 'loading' state triggered by 'fetch' event

stateManager.transition('success', ['data1', 'data2']);

stateManager.transition('fetch');

stateManager.transition('success', ['data1', 'data2'])


