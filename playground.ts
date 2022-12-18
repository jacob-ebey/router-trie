import { createTrie, matchTrie } from "./src";
import { nodeToMermaidMarkdown } from "./src/mermaid";

const routesTrie = createTrie([
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
]);
console.log("MATCH /not-nested", matchTrie(routesTrie, "/not-nested"));
console.log("GRAPH:");
console.log(nodeToMermaidMarkdown(routesTrie));
