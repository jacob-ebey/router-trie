import {
  CATCH_ALL_SYMBOL,
  DYNAMIC_SYMBOL,
  OPTIONAL_SYMBOL,
  INDEX_SYMBOL,
  ROOT_SYMBOL,
  ROUTE_SYMBOL,
  type Node,
} from "./router";

export function nodeToMermaidMarkdown(node: Node<any>): string {
  return `graph TD;\n${nodeToMermaidMarkdownRecursive(node)}`.trim();
}
function nodeToMermaidMarkdownRecursive(node: Node<any>): string {
  if (!node) return "";
  let markdown = "";

  if (node.parent) {
    markdown += `  ${toId(node.parent)} --> ${toId(node)};\n`;
  }

  for (const child of node.children) {
    markdown += nodeToMermaidMarkdownRecursive(child);
  }

  return markdown;

  function toId(node: Node<any>): string {
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
      case OPTIONAL_SYMBOL:
        return `${id}{_OPTIONAL_}`;
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
}
