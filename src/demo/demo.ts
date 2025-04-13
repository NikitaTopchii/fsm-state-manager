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
    data: any // тип даних які ловимо з бекенду 
}

const HttpRequestTransitionRules: TransitionRulesType<HttpRequestFSMConfigI> = {
    init: {
      fetch: {
        action: () => ({
            state: 'loading',
            appliedData: [],
        })
      },
    },
    loading: {
      success: {
        action: (data: any, payload: any) =>
            payload?.appliedData
              ? { state: 'loaded', appliedData: payload.appliedData }
              : data,
        guard: () => doSomething(),
      },
      failure: {
        action: (data: any, payload: any) =>
            payload?.appliedData
              ? { state: 'error', appliedData: payload.appliedData }
              : data,
      }
    },
    loaded: {
      fetch: {
        action: () => ({
            state: 'loading',
            appliedData: [],
          }),
      }
    },
    error: {
      retry: {
        action: () => ({
            state: 'loading',
            appliedData: [],
          }),
      }
    },
  };

const doSomething = () => { return true }

const fsm = new StateManagerFSM(HttpRequestTransitionRules, { devMode: true, logTransitions: true });

fsm.setStateData({ state: 'init', appliedData: [] });

fsm.transition('fetch');

fsm.transition('success', ['data1', 'data2']);

console.log(fsm.canTransition('failure')); // true

console.log(fsm.getStateData().appliedData); // { state: 'loading', appliedData: [] }
