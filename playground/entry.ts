import cytoscape from "cytoscape";
// @ts-expect-error
import dagre from "cytoscape-dagre";

import {
  createTrie,
  matchTrie,
  CATCH_ALL_SYMBOL,
  DYNAMIC_SYMBOL,
  INDEX_SYMBOL,
  ROOT_SYMBOL,
  ROUTE_SYMBOL,
  type Node,
} from "../src";

function createGraphElements(node: Node<any>) {
  return createGraphElementsRecursive(node, { edges: [], nodes: [] });
}

function createGraphElementsRecursive(
  node: Node<any>,
  result: { edges: any[]; nodes: any[] }
) {
  if (!node) return result;

  const id = toId(node);
  result.nodes.push({
    data: {
      id,
      label: id.match(/\{(.*)\}/)?.[1],
      node,
    },
    classes: "bottom-center",
  });

  if (node.parent) {
    result.edges.push({
      data: { source: toId(node.parent), target: id },
    });
  }

  for (const child of node.children) {
    createGraphElementsRecursive(child, result);
  }

  return result;
}
function toId(node: Node<any>) {
  let id = "_";
  let t: Node<any> | null = node;
  while (t) {
    let i = t.parent?.children.indexOf(t) || 0;
    id = `${i}_` + id;
    t = t.parent;
  }
  if (typeof node.key === "string" && node.key) return `${id}{${node.key}}`;
  switch (node.key) {
    case INDEX_SYMBOL:
      return `${id}{_INDEX_}`;
    case DYNAMIC_SYMBOL:
      return `${id}{_DYNAMIC_}`;
    case CATCH_ALL_SYMBOL:
      return `${id}{_CATCH_ALL_}`;
    case ROUTE_SYMBOL:
      return `${id}{_ROUTE_}`;
    case ROOT_SYMBOL:
      return `${id}{_ROOT_}`;
    default:
      return id;
  }
}

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

cytoscape.use(dagre);
const cy = cytoscape({
  container: document.getElementById("cy"),
  elements: createGraphElements(routesTrie),

  boxSelectionEnabled: false,
  autounselectify: true,

  layout: {
    name: "dagre",
  },

  style: [
    {
      selector: "node[label]",
      style: {
        label: "data(label)",
        "text-valign": "bottom",
        "text-halign": "center",
      },
    },
    {
      selector: "node.visited",
      style: {
        "background-color": "blue",
      },
    },
  ],
});

const form = document.getElementById("match-form") as HTMLFormElement;
let controller: AbortController | undefined;
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (controller) {
    controller.abort();
  }
  controller = new AbortController();
  const signal = controller.signal;

  const target = event.target as HTMLFormElement | HTMLButtonElement;
  const formData = new FormData(target.form || target);
  const path = (formData.get("path") as string) || "";
  const visitedIDs: string[] = [];

  console.log(
    matchTrie(routesTrie, path, {
      onVisit: (node) => {
        visitedIDs.push(toId(node));
      },
    })
  );

  let lastElement: cytoscape.CollectionReturnValue | undefined;
  for (const id of visitedIDs) {
    if (lastElement) {
      lastElement.removeClass("visited");
    }
    lastElement = cy.getElementById(id);
    lastElement.addClass("visited");

    await new Promise((resolve) => {
      setTimeout(resolve, 400);
    });
    if (signal.aborted) break;
  }
  if (lastElement) {
    lastElement.removeClass("visited");
  }
});
