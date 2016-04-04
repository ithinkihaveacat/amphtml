<!---
Copyright 2015 The AMP HTML Authors. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS-IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

# <a name="amp-typekit"></a> `amp-typekit`

<table>
  <tr>
    <td width="40%"><strong>Description</strong></td>
    <td>Load fonts from <a href="https://typekit.com/fonts">Typekit</a>.</td>
  </tr>
  <tr>
    <td width="40%"><strong>Availability</strong></td>
    <td>Experimental (not hosted on <tt>cdn.ampproject.org</tt>, and not compliant with the spec)</td>
  </tr>
  <tr>
    <td width="40%"><strong>Required Script</strong></td>
    <td><code>&lt;script async custom-element="amp-typekit" src="amp-typekit-0.1.js">&lt;/script></code> (see "Deployment", below)</td>
  </tr>
  <tr>
    <td width="40%"><strong>Examples</strong></td>
    <td><a href="../../../examples/typekit.amp.html">typekit.amp.html</a> (source) / <a href="http://localhost:8000/examples.build/typekit.amp.max.html">typekit.amp.max.html</a> (dev server) </td>
  </tr>
</table>

## Examples

````html
<amp-typekit data-kitid="pdu1ohm" layout="nodisplay"></amp-typekit>
````

`data-kitid` is the "Typekit Kit ID". (If fonts are loaded via a script such as
`https://use.typekit.net/pdu1ohm.js`, then the `data-kitid` is `pdu1ohm`.)

## Overview

This extension makes it possible to load fonts from Adobe's Typekit service.
Because it (unavoidably) loads Typekit's JS in the body of the AMP page (and not
an `<iframe>`), it is not compliant with the spec, which requires all
third-party JavaScript to be [isolated to sandboxed
`<iframes>`](https://www.ampproject.org/docs/get_started/technical_overview.html#keep-all-third-party-javascript-out-of-the-critical-path)
(for both security and performance reasons).

Hence, this extension does not make it possible to use Typekit fonts on AMP
pages hosted on [Google's AMP
Cache](https://www.ampproject.org/docs/get_started/about-amp.html#google-amp-cache).
However, it does attempt to follow the spirit of AMP (for example, all network
requests are asynchronous), and so it may be useful if you are using the AMP JS
library on other domains.

## Deployment

````sh
$ git clone git@github.com:ithinkihaveacat/amphtml.git --branch amp-typekit
$ cd amphtml
$ npm install
$ gulp dist
$ gulp dist # yes again, it doesn't complete the first time
# upload the contents of dist/ somewhere
````

Then, change all the links that were previously pointing to `cdn.ampproject.org` to point to the new host.

## Implementation

Unlike most font services, Typekit does not have a pure CSS approach to
delivering fonts. Instead, [for various
reasons](http://blog.typekit.com/2011/08/11/better-web-font-loading-with-javascript/),
JavaScript is used to bootstrap the font-loading process.

This extension has two functions:

  * it re-implements Typekit's ["advanced embed code"](https://helpx.adobe.com/typekit/using/embed-codes.html#Advancedembedcode)
    in an AMP-compatible way. (Both the JS and the CSS are loaded
    asynchronously.)
  * it connects the font events emitted by the Typekit loader to AMP's
    mechanisms for hiding and revealing content to try to eliminate
    [FOUT/FOUC](https://en.wikipedia.org/wiki/Flash_of_unstyled_content).

So I don't have to work this out again later, here's the key files involved in
AMP's mechanism for loading a page and dealing with FOUT:

  * the [AMP boilerplate](../../spec/amp-boilerplate.md) – this includes CSS that
  (a) initially hides all content; and (b) reveals it after 8 seconds. The
  content is revealed after 8 seconds so that users are guaranteed to have
  something to read even if the JS fails to load or errors out. (Under normal
  circumstances, the AMP JS library should be revealing the content before 8
  seconds have elapsed.)
  * [`amp.js`](../../src/amp.js) – the main entry point of the AMP JS library
  * `makeBodyVisible()` in [`styles.js`](../../src/styles.js) – sets opacity and visibility to reveal the content
  * `waitForExtensions()` in [`render-delaying-extensions.js`](../../src/render-delaying-extensions.js) – determines which extensions the library will wait for before revealing content. `amp-typekit` is whitelisted here, so that the content isn't revealed before the fonts are loaded. `waitForExtensions()` will wait for a maximum of 3 seconds; if the Typekit fonts arrive after this, there will be FOUT.
  * `getService()` and `getServicePromise()` in [`service.js`](../../src/service.js) – these two are kinda strange. Contrary to what you might expect from their names, they don't really return "services"; instead, they set and return promises that are passed to the body-revealing code waits: when they resolve, the content is revealed. (The actual values they return don't seem to be used, and are thrown away.)

Other useful files:

  * [`base-element.js`](../../src/base-element.js) – contains a useful comment explaining the lifecycle of an AMP DOM element.

## Validation

Although the validation rules in
[`validator.protoascii`](../../validator/validator.protoascii) have been updated
to support `<amp-typekit>`, this turns out to be not especially helpful because
the validator is expecting to see links to `cdn.ampproject.org`, which we can't
use because it doesn't know that the `<amp-typekit>` extension needs to be
whitelisted as render delaying.

However, because the work has already been done, the details on how to validate
AMP pages are listed below.

### Via the command-line

Prerequisites (OS X):

  * [`Homebrew`](http://brew.sh/)
  * [`Node.js`](https://nodejs.org/en/)

Install dependencies:

````sh
$ brew install protobuf --c++11 --with-python
$ npm install # in "validator" directory
````

Build and run the validator:

````sh
$ python build.py # creates dist/validate
$ node dist/validate ../examples.build/typekit.amp.html
````

(Run `gulp` or `gulp build` from the root directory to create/update the
`examples.build` directory.)

### Via the browser

**Currently broken**: [`validator-integration.js`](../../src/validator-integration.js) hard-codes the validator to `https://cdn.ampproject.org/v0/validator.js`. Also, I don't know which file it *should* point to; none of the JavaScript files in `validator/` seem right.
