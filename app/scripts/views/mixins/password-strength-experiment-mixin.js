/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { debounce } from 'underscore';
import ExperimentMixin from './experiment-mixin';
import PasswordStrengthBalloonModel from '../../models/password_strength/password_strength_balloon';
import PasswordWithStrengthBalloonView from '../password_strength/password_with_strength_balloon';

const EXPERIMENT_NAME = 'passwordStrength';

const DELAY_BEFORE_LOG_REASON_MS = 1500;

export default function (config = {}) {
  return {
    dependsOn: [
      ExperimentMixin
    ],

    beforeRender: gateOnExperiment(function () {
      const experimentGroup = this.getPasswordStrengthExperimentGroup();
      this.createExperiment(EXPERIMENT_NAME, experimentGroup);
    }),

    afterRender: gateOnExperiment(function () {
      if (this.getPasswordStrengthExperimentGroup() === 'designF') {
        this.passwordModel = new PasswordStrengthBalloonModel(this.getAccount().pick('email'));

        // wait a short time after the last change to log the invalid reason. The delay
        // avoids writing too many updates to the logger.
        this.listenTo(this.passwordModel, 'change', debounce(() => this.logInvalidReason(), DELAY_BEFORE_LOG_REASON_MS));


        const passwordView = new PasswordWithStrengthBalloonView({
          balloonEl: this.$(config.balloonEl),
          el: this.$(config.passwordEl),
          model: this.passwordModel
        });

        this.trackChildView(passwordView);

        // the password element is already rendered,
        // call it's afterRender function to
        // create the balloon.
        return passwordView.afterRender();
      }
    }),

    setInitialContext: gateOnExperiment(function (context) {
      context.set({
        showCustomHelperBalloon: true
      });
    }),

    isValidStart: gateOnExperiment(function () {
      if (this.passwordModel.validate()) {
        return false;
      }
    }),

    showValidationErrorsStart: gateOnExperiment(function () {
      if (this.passwordModel.validate()) {
        return true;
      }
    }),

    getPasswordStrengthExperimentSubject: function () {
      return {
        account: this.getAccount()
      };
    },

    getPasswordStrengthExperimentGroup () {
      return this.getExperimentGroup(EXPERIMENT_NAME, this.getPasswordStrengthExperimentSubject());
    },

    logInvalidReason () {
      const invalidReason = this.passwordModel.validate();
      if (invalidReason) {
        this.logError(invalidReason);
      }
    }
  };

  function gateOnExperiment(callback) {
    return function (...args) {
      if (this.isInExperiment(EXPERIMENT_NAME, this.getPasswordStrengthExperimentSubject())) {
        return callback.apply(this, args);
      }
    };
  }
}
