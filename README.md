# stream-eval

## Evaluation of high-level JS stream libraries

### Use case
- stream values from ES6 `Iterable` source holding data in-memory
- partition values into chunks
- Sequentially execute async task with each chunk (e.g. push to server via HTTP)
- resolve `Promise` once all chunks have been processed

__Non functional requirements:__
- values should flow through stream only as fast as they can be processed by the task (back-pressure)
- no complete consumption of source upfront which causes intermediate buffering of the values
- flow control should be implemented with back pressure rather than a controller for the emitting source which needs to be passed along explicitely

### Candidates

[_Bacon.js_](https://baconjs.github.io/) has been ignored due its dependency on jQuery and poor performance (see https://github.com/Reactive-Extensions/RxJS/blob/master/doc/mapping/bacon.js/whyrx.md). Kefir is trying to make a more performance oriented version of _Bacon.js_.

| Feature                                 | Highland v2.10.1                                                                                            | Kefir v3.6.1                       | RxJS v4.1.0                                                                                  | RxJS v5.0.2                                     | Most.js 1.1.1                                                                                                                                                                                        |
|-----------------------------------------|-------------------------------------------------------------------------------------------------------------|------------------------------------|----------------------------------------------------------------------------------------------|-------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| GitHub                                  | https://github.com/caolan/highland/tree/2.x                                                                 | https://github.com/rpominov/kefir  | https://github.com/Reactive-Extensions/RxJS                                                  | https://github.com/ReactiveX/RxJS               | https://github.com/cujojs/most                                                                                                                                                                       |
| Documentation                           | http://highlandjs.org                                                                                       | https://rpominov.github.io/kefir/  | https://github.com/Reactive-Extensions/RxJS/tree/master/doc                                  | http://reactivex.io/rxjs/                       | https://github.com/cujojs/most/blob/master/docs/api.md                                                                                                                                               |
| License                                 | Apache-2.0                                                                                                  | MIT                                | Apache-2.0                                                                                   | Apache-2.0                                      | MIT                                                                                                                                                                                                  |
| Size (minified)                         | 61kB                                                                                                        | 10kB                               | 141kB (complete but also support for custom builds), e.g. 78kB (rx.min.js + rx.async.min.js) | 143kB                                           | 42kB                                                                                                                                                                                                 |
| Maturity                                | 02/2014                                                                                                     | 05/2014                            | 02/2013                                                                                      | 12/2016                                         | 11/2013                                                                                                                                                                                              |
| Repository activity                     | 7                                                                                                           | 9                                  | 10                                                                                           | 10                                              | 10                                                                                                                                                                                                   |
| Contributor count                       | 49                                                                                                          | 37                                 | 273                                                                                          | 107                                             | 36                                                                                                                                                                                                   |
| Open/Closed issue ratio                 | 29% 89/219                                                                                                  | 14% 24/143                         | 24% 185/594                                                                                  | 16% 145/768                                     | 16% 26/132                                                                                                                                                                                           |
| Test rating coverage (1-5)              | 4                                                                                                           | 5                                  | 5                                                                                            | 5                                               | 5                                                                                                                                                                                                    |
| Back-pressure support                   | y                                                                                                           | n                                  | n<sup>[[1]](#fn1)</sup>                                                                      | n<sup>[[2]](#fn2)</sup>                         | n                                                                                                                                                                                                    |
| Async processing support                | y (via [`Stream#flatMap`](https://github.com/caolan/highland/issues/290) or `Stream#map + Stream#sequence`) | y (via `observer#flatMap`)         | y (via `Observable#flatMap`)                                                                 | y (via `Observable#mergeMap`)                   | y (via `stream#concatMap`)                                                                                                                                                                           |
| Promise support                         | n (only as source, signaling on end of stream emulatable via `Stream#toCallback`)                           | y (via `observer#toPromise`)       | y (via `Observable#toPromise`)                                                               | y (via `Observable#toPromise`)                  | y                                                                                                                                                                                                    |
| Iterable support                        | y                                                                                                           | n                                  | y (via `Observable.from`)                                                                    | y (via `Observable.from`)<sup>[[3]](#fn3)</sup> | y (via `most.from`)<sup>[[3]](#fn3)</sup>                                                                                                                                                            |
| Batch support                           | y (via `Stream#batch`)                                                                                      | y (via `observer#bufferWithCount`) | y (via `Observable#bufferWithCount`)                                                         | y (via `Observable#bufferCount`)                | y (pluggable via `stream#transduce` with `transducers.partitionAll` from [transducers-js](http://cognitect-labs.github.io/transducers-js/classes/transducers.html#methods_transducers.partitionAll)) |
| Functional requirements coverage (1-10) | 9                                                                                                           | 6                                  | 9                                                                                            | 8                                               | 8                                                                                                                                                                                                    |

[Markdown table formatter](http://www.tablesgenerator.com/markdown_tables)

<a name="fn1">[1]</a>: No real back-pressure support where flow control is signaled back from consumer to producer alongside the stream itself. Only support for explicitly controlling the flow via `Observable#controlled` but this builds up an internal buffer. Furthermore it is suboptimal as it introduces a second point of contact between producer and consumer which needs to be passed along and thus increases coupling.  
<a name="fn2">[2]</a>: Back pressure and also flow control (i.e. via `Observable#controlled` in RxJS 4) are not implemented (see https://github.com/ReactiveX/rxjs/blob/master/MIGRATION.md#operators-renamed-or-removed) and possibly never will (see [discussion](https://github.com/ReactiveX/rxjs/issues/71)).  
<a name="fn3">[3]</a>: Not usable if source control needs to be added externally.  

#### Other libraries:

- zen-observable (https://github.com/zenparsing/zen-observable); only support for `forEach`, `map`, `reduce`, `filter`, `flatMap` -> hard to implement batch support
- bluebird (http://bluebirdjs.com/); Promise library -> best suited for single values
- flyd (https://github.com/paldepind/flyd)
- Neo-Async (https://github.com/suguru03/neo-async)
- xstream (https://github.com/staltz/xstream)
- EventStream (https://github.com/dominictarr/event-stream)
- Axos (https://github.com/pjeby/axos)

### Performance
```bash
$ node test/perf.test.js
Highland [back pressure] x 56.61 ops/sec ±1.83% (71 runs sampled)
RxJS 4 [flow control on stream] x 18.04 ops/sec ±2.70% (82 runs sampled)
RxJS 4 [flow control on source with Flowable] x 76.74 ops/sec ±1.22% (76 runs sampled)
RxJS 5 [no flow control] x 316 ops/sec ±0.92% (83 runs sampled)
RxJS 5 [flow control on source with Flowable] x 288 ops/sec ±1.34% (81 runs sampled)
RxJS 5 [flow control on source with NEW Flowable] x 254 ops/sec ±1.04% (81 runs sampled)
Kefir [flow control on source with Flowable] x 242 ops/sec ±1.71% (84 runs sampled)
Kefir [flow control on source with NEW Flowable] x 206 ops/sec ±2.30% (78 runs sampled)
Most.js [no flow control] x 312 ops/sec ±2.01% (83 runs sampled)
Most.js [flow control on source with most-subject] x 126 ops/sec ±1.60% (81 runs sampled)
Most.js [flow control on source with most-subject and NEW Flowable] x 118 ops/sec ±1.61% (77 runs sampled)
Most.js [flow control on source with NEW Flowable] x 192 ops/sec ±1.59% (83 runs sampled)
Most.js [flow control on source with NEW Flowable and await] x 202 ops/sec ±1.42% (82 runs sampled)
Fastest is 'RxJS 5 [no flow control]'
```
(node v4.4.7, Mac OS 10.12.2, Quadcore Intel Core i5 at 2.9 GHz)

### Notes

#### Highland.js
- best coverage of functional requirements
- real back-pressure support
- moderate size (objective of v3 is to have highland core separated from transformations)
- lesser performance
- based on EventEmitters and Streams, fits in Node.js ecosystem but may increase footprint in browser land
- active development towards v3 (tracked via https://github.com/caolan/highland/issues/179)

#### Kefir
- no back-pressure
- adequate performance
- minimal size

#### RxJS 4
- poor performance, see https://github.com/cujojs/most/tree/master/test/perf
- no back-pressure but at least flow control via `Observable#controlled`
- development discontinued as activity shifts towards RxJS 5 which should replace RxJS 4 it

#### RxJS 5
- still no real back-pressure
- flow control support as in RxJS 4 removed, but can be emulated (see [Stack Overflow: RXJS control observable invocation](http://stackoverflow.com/a/35347136/893797))
- not very mature yet (first release in 12/2016)
- completely reactive, no back-pressure
- backed by Netflix, Microsoft and Google

#### Most.js
- most mature project
- relatively small set of built-in operations
- good performance, see https://github.com/cujojs/most/tree/master/test/perf
- great promise support
- completely reactive, no back-pressure

### Links:

- [Migrating from RxJS 4 to 5](https://github.com/ReactiveX/rxjs/blob/master/MIGRATION.md)
