/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {loadScript} from '../../../src/3p';
import {getMode} from '../../../src/mode';
import {user} from '../../../src/log';
import {getService} from '../../../src/service';

/** @private @const {string} */
const TAG = 'AmpTypekit';

class AmpTypekit extends AMP.BaseElement {
  /** @override */
  buildCallback() {
    const kitid = this.element.getAttribute('data-kitid');
    if (kitid) {
      loadScript(AMP.win, `https://use.typekit.net/${kitid}.js`, () => {
        log('JS loaded');
        Typekit.load({
          async: true,
          classes: false,
          loading: () => {
            log('fonts loading');
          },
          active: () => {
            log('fonts active');
            typekitActive();
          },
        });
      });
    } else {
      log('unable to load fonts: the data-kitid attribute is missing');
    }
  }
}

const log = function(s) {
  if (getMode().development) { // getMode().localDev for localhost
    user.info(TAG, s);
  }
};

let typekitActive;
const servicePromise = new Promise(resolve => {
  typekitActive = resolve;
});

getService(AMP.win, 'amp-typekit', () => {
  return servicePromise;
});

AMP.registerElement('amp-typekit', AmpTypekit);
