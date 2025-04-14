"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateManagerFSM = void 0;
var StateManagerFSM = /** @class */ (function () {
    function StateManagerFSM(transitionRules, options) {
        if (options === void 0) { options = {}; }
        this.stateData = { state: '', appliedData: [] };
        this.options = { devMode: false, logTransitions: false, };
        this.transitionRules = transitionRules;
        this.options = options;
    }
    StateManagerFSM.prototype.setStateData = function (currentStateData) {
        this.stateData = currentStateData;
    };
    StateManagerFSM.prototype.getStateData = function () {
        return this.stateData;
    };
    StateManagerFSM.prototype.transition = function (event, appliedData) {
        var stateData = this.stateData;
        var transition = this.transitionAction(event);
        if (transition) {
            if (!this.checkGuard(event)) {
                console.warn("[FSM Warn] Guard activated on event '".concat(event, "' for state '").concat(stateData.state, "'"));
            }
            else {
                if (this.options.devMode && !transition) {
                    console.warn("[FSM Warn] Wrong transition: event '".concat(event, "' for state '").concat(stateData.state, "'"));
                }
                if (typeof transition.transitionAction === 'function') {
                    var newState = transition.transitionAction(stateData, { appliedData: appliedData });
                    if (this.options.logTransitions) {
                        console.log("[FSM] Transition: '".concat(stateData.state, "' state \u2192 '").concat(newState.state, "' state triggered by '").concat(event, "' event"));
                    }
                    this.stateData = newState;
                }
            }
        }
        else {
            if (this.options.devMode && !transition) {
                console.warn("[FSM Warn] Wrong transition: event '".concat(event, "' for state '").concat(stateData.state, "'"));
            }
        }
    };
    StateManagerFSM.prototype.canTransition = function (event) {
        var transition = this.transitionAction(event);
        if (!transition) {
            if (this.options.devMode) {
                console.warn("[FSM Warn] We can't transition to another state with event '".concat(event, "' from state '").concat(this.stateData.state, "'"));
            }
            return false;
        }
        return typeof transition.transitionAction === 'function';
    };
    StateManagerFSM.prototype.transitionAction = function (event) {
        var stateData = this.stateData;
        if (!stateData) {
            return;
        }
        return this.transitionRules[stateData.state][event];
    };
    StateManagerFSM.prototype.checkGuard = function (event) {
        var transition = this.transitionAction(event);
        if (!transition) {
            return true;
        }
        else {
            return transition.transitionGuard
                ? transition.transitionGuard(this.stateData.state, event)
                : true;
        }
    };
    return StateManagerFSM;
}());
exports.StateManagerFSM = StateManagerFSM;
