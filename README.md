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

Given the following routing config: [routes.json](./routes.json)

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
  0_0__{_ROUTE_} --> 0_0_3__{optional};
  0_0_3__{optional} --> 0_0_3_0__{_OPTIONAL_};
  0_0_3_0__{_OPTIONAL_} --> 0_0_3_0_0__{_OPTIONAL_};
  0_0_3_0_0__{_OPTIONAL_} --> 0_0_3_0_0_0__{_ROUTE_};
  0_0_3_0__{_OPTIONAL_} --> 0_0_3_0_1__{sub};
  0_0_3_0_1__{sub} --> 0_0_3_0_1_0__{_ROUTE_};
  0_0_3__{optional} --> 0_0_3_1__{sub};
  0_0_3_1__{sub} --> 0_0_3_1_0__{_OPTIONAL_};
  0_0_3_1_0__{_OPTIONAL_} --> 0_0_3_1_0_0__{_ROUTE_};
  0_0__{_ROUTE_} --> 0_0_4__{nested};
  0_0_4__{nested} --> 0_0_4_0__{_ROUTE_};
  0_0_4_0__{_ROUTE_} --> 0_0_4_0_0__{_INDEX_};
  0_0_4_0_0__{_INDEX_} --> 0_0_4_0_0_0__{_ROUTE_};
  0_0_4_0__{_ROUTE_} --> 0_0_4_0_1__{sub};
  0_0_4_0_1__{sub} --> 0_0_4_0_1_0__{_ROUTE_};
  0_0_4_0__{_ROUTE_} --> 0_0_4_0_2__{_DYNAMIC_};
  0_0_4_0_2__{_DYNAMIC_} --> 0_0_4_0_2_0__{_ROUTE_};
  0_0_4_0_2__{_DYNAMIC_} --> 0_0_4_0_2_1__{_DYNAMIC_};
  0_0_4_0_2_1__{_DYNAMIC_} --> 0_0_4_0_2_1_0__{_ROUTE_};
  0_0__{_ROUTE_} --> 0_0_5__{nested-nested};
  0_0_5__{nested-nested} --> 0_0_5_0__{_ROUTE_};
  0_0_5_0__{_ROUTE_} --> 0_0_5_0_0__{_INDEX_};
  0_0_5_0_0__{_INDEX_} --> 0_0_5_0_0_0__{_ROUTE_};
  0_0_5_0__{_ROUTE_} --> 0_0_5_0_1__{sub};
  0_0_5_0_1__{sub} --> 0_0_5_0_1_0__{_ROUTE_};
  0_0_5_0__{_ROUTE_} --> 0_0_5_0_2__{_DYNAMIC_};
  0_0_5_0_2__{_DYNAMIC_} --> 0_0_5_0_2_0__{_ROUTE_};
  0_0_5_0_2_0__{_ROUTE_} --> 0_0_5_0_2_0_0__{_DYNAMIC_};
  0_0_5_0_2_0_0__{_DYNAMIC_} --> 0_0_5_0_2_0_0_0__{_ROUTE_};
  0_0__{_ROUTE_} --> 0_0_6__{_CATCH_ALL_};
  0_0_6__{_CATCH_ALL_} --> 0_0_6_0__{_ROUTE_};
```
