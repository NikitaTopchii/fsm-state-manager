"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateManagerFSM = void 0;
var StateManagerFSM = /** @class */ (function () {
    function StateManagerFSM(transitionRules) {
        this.stateData = { state: '', appliedData: [] };
        this.transitionRules = transitionRules;
    }
    StateManagerFSM.prototype.setStateData = function (currentStateData) {
        this.stateData = currentStateData;
    };
    StateManagerFSM.prototype.transition = function (event, appliedData) {
        var stateData = this.stateData;
        if (!stateData) {
            return;
        }
        var transitionAction = this.transitionRules[stateData.state][event];
        if (typeof transitionAction === 'function') {
            this.stateData = transitionAction(stateData, { appliedData: appliedData });
        }
    };
    StateManagerFSM.prototype.getState = function () {
        return this.stateData;
    };
    return StateManagerFSM;
}());
exports.StateManagerFSM = StateManagerFSM;
