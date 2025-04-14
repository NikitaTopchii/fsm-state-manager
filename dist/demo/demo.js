"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fsm_state_manager_1 = require("../fsm-state-manager");
var HttpRequestTransitionRules = {
    init: {
        fetch: {
            transitionAction: function () { return ({
                state: 'loading',
                appliedData: [],
            }); }
        },
    },
    loading: {
        success: {
            transitionAction: function (data, payload) {
                return (payload === null || payload === void 0 ? void 0 : payload.appliedData)
                    ? { state: 'loaded', appliedData: payload.appliedData }
                    : data;
            },
            transitionGuard: function () { return doSomething(); },
        },
        failure: {
            transitionAction: function (data, payload) {
                return (payload === null || payload === void 0 ? void 0 : payload.appliedData)
                    ? { state: 'error', appliedData: payload.appliedData }
                    : data;
            },
        }
    },
    loaded: {
        fetch: {
            transitionAction: function () { return ({
                state: 'loading',
                appliedData: [],
            }); },
        }
    },
    error: {
        retry: {
            transitionAction: function () { return ({
                state: 'loading',
                appliedData: [],
            }); },
        }
    },
};
var doSomething = function () { return true; };
var stateManager = new fsm_state_manager_1.StateManagerFSM(HttpRequestTransitionRules);
stateManager.setStateData({ state: 'init', appliedData: [] });
stateManager.transition('fetch'); //[FSM] Transition: 'init' state → 'loading' state triggered by 'fetch' event
stateManager.transition('success', ['data1', 'data2']); //[FSM] Transition: 'loading' state → 'loaded' state triggered by 'success' event
console.log(stateManager.canTransition('failure')); //[FSM Warn] We can't transition to another state with event 'failure' from state 'loaded' (false in console.log)
console.log(stateManager.getStateData().appliedData); // ['data1, 'data2']
