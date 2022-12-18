# router-trie

## Usage

```bash
npm i router-trie
```

```js
import { createTrie, matchTrie } from "router-trie";

const routesTrie = createTrie([
  {
    id: "root",
    children: [
      {
        id: "home",
        index: true,
      },
    ],
  },
]);

const matches = matchTrie(routesTrie, "/");

console.log(matches);
// [{ id: "root" }, { id: "home", index: true }]
```

## Development

To install dependencies:

```bash
npm i
```

To run the playground:

```bash
npm start
```

To run the tests:

```bash
npm test
```

Visual of the trie structure:

Given the following routing config:

```js
[
  {
    id: "root",
    children: [
      {
        id: "home",
        index: true,
      },
      {
        id: "path-index",
        path: "path-index",
        index: true,
      },
      {
        id: "not-nested",
        path: "not-nested",
      },
      {
        id: "not-nested-sub",
        path: "not-nested/sub",
      },
      {
        id: "not-nested-dynamic",
        path: "not-nested/:id",
      },
      {
        id: "not-nested-dual-dynamic",
        path: "not-nested/:id/:id2",
      },
      {
        id: "nested",
        path: "nested",
        children: [
          {
            id: "nested-index",
            index: true,
          },
          {
            id: "nested-sub",
            path: "sub",
          },
          {
            id: "nested-dynamic",
            path: ":id",
          },
          {
            id: "nested-dual-dynamic",
            path: ":id/:id2",
          },
        ],
      },
      {
        id: "catch-all",
        path: "*",
      },
    ],
  },
];
```

We get the following trie:

```mermaid
graph TD;
  0__{_ROOT_} --> 0_0__{_ROUTE_};
  0_0__{_ROUTE_} --> 0_0_0__{_INDEX_};
  0_0_0__{_INDEX_} --> 0_0_0_0__{_ROUTE_};
  0_0__{_ROUTE_} --> 0_0_1__{path-index};
  0_0_1__{path-index} --> 0_0_1_0__{_INDEX_};
  0_0_1_0__{_INDEX_} --> 0_0_1_0_0__{_ROUTE_};
  0_0__{_ROUTE_} --> 0_0_2__{not-nested};
  0_0_2__{not-nested} --> 0_0_2_0__{_ROUTE_};
  0_0_2__{not-nested} --> 0_0_2_1__{sub};
  0_0_2_1__{sub} --> 0_0_2_1_0__{_ROUTE_};
  0_0_2__{not-nested} --> 0_0_2_2__{_DYNAMIC_};
  0_0_2_2__{_DYNAMIC_} --> 0_0_2_2_0__{_ROUTE_};
  0_0_2_2__{_DYNAMIC_} --> 0_0_2_2_1__{_DYNAMIC_};
  0_0_2_2_1__{_DYNAMIC_} --> 0_0_2_2_1_0__{_ROUTE_};
  0_0__{_ROUTE_} --> 0_0_3__{nested};
  0_0_3__{nested} --> 0_0_3_0__{_ROUTE_};
  0_0_3_0__{_ROUTE_} --> 0_0_3_0_0__{_INDEX_};
  0_0_3_0_0__{_INDEX_} --> 0_0_3_0_0_0__{_ROUTE_};
  0_0_3_0__{_ROUTE_} --> 0_0_3_0_1__{sub};
  0_0_3_0_1__{sub} --> 0_0_3_0_1_0__{_ROUTE_};
  0_0_3_0__{_ROUTE_} --> 0_0_3_0_2__{_DYNAMIC_};
  0_0_3_0_2__{_DYNAMIC_} --> 0_0_3_0_2_0__{_ROUTE_};
  0_0_3_0_2__{_DYNAMIC_} --> 0_0_3_0_2_1__{_DYNAMIC_};
  0_0_3_0_2_1__{_DYNAMIC_} --> 0_0_3_0_2_1_0__{_ROUTE_};
  0_0__{_ROUTE_} --> 0_0_4__{_CATCH_ALL_};
  0_0_4__{_CATCH_ALL_} --> 0_0_4_0__{_ROUTE_};
```
