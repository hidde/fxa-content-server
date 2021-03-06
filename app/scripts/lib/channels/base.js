/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// A channel interface.

define(function (require, exports, module) {
  'use strict';

  const _ = require('underscore');
  const Backbone = require('backbone');

  function BaseChannel() {
    // nothing to do.
  }

  _.extend(BaseChannel.prototype, Backbone.Events, {
    initialize () {
    },

    teardown () {
    },

    send (command, data, done) {
      if (done) {
        done();
      }
    }
  });

  module.exports = BaseChannel;
});
