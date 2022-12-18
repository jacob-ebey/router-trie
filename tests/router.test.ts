import { describe, it } from "node:test";
import { expect } from "expect";

import { createTrie, matchTrie } from "../src";

describe("router", () => {
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
          id: "nested-nested",
          path: "nested-nested",
          children: [
            {
              id: "nested-nested-index",
              index: true,
            },
            {
              id: "nested-nested-sub",
              path: "sub",
            },
            {
              id: "nested-nested-dynamic",
              path: ":id",
              children: [
                {
                  id: "nested-nested-dual-dynamic",
                  path: ":id2",
                },
              ],
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

  it("should match index child of root pathless route", () => {
    const matches = matchTrie(routesTrie, "/");
    expect(matches!.length).toBe(2);
    expect(matches![0].id).toBe("root");
    expect(matches![1].id).toBe("home");
  });

  it("should match index child with path of root pathless route", () => {
    const matches = matchTrie(routesTrie, "/path-index");
    expect(matches!.length).toBe(2);
    expect(matches![0].id).toBe("root");
    expect(matches![1].id).toBe("path-index");
  });

  it("should match path with single static segment", () => {
    const matches = matchTrie(routesTrie, "/not-nested");
    expect(matches!.length).toBe(2);
    expect(matches![0].id).toBe("root");
    expect(matches![1].id).toBe("not-nested");
  });

  it("should match path with two static segments", () => {
    const matches = matchTrie(routesTrie, "/not-nested/sub");
    expect(matches!.length).toBe(2);
    expect(matches![0].id).toBe("root");
    expect(matches![1].id).toBe("not-nested-sub");
  });

  it("should match path with static and dynamic segment", () => {
    const matches = matchTrie(routesTrie, "/not-nested/dynamic");
    expect(matches!.length).toBe(2);
    expect(matches![0].id).toBe("root");
    expect(matches![1].id).toBe("not-nested-dynamic");
  });

  it("should match path with dual dynamic segments", () => {
    const matches = matchTrie(routesTrie, "/not-nested/dynamic/dynamic");
    expect(matches!.length).toBe(2);
    expect(matches![0].id).toBe("root");
    expect(matches![1].id).toBe("not-nested-dual-dynamic");
  });

  it("should match nested index", () => {
    const matches = matchTrie(routesTrie, "/nested");
    expect(matches!.length).toBe(3);
    expect(matches![0].id).toBe("root");
    expect(matches![1].id).toBe("nested");
    expect(matches![2].id).toBe("nested-index");
  });

  it("should match nested path with single static segment", () => {
    const matches = matchTrie(routesTrie, "/nested/sub");
    expect(matches!.length).toBe(3);
    expect(matches![0].id).toBe("root");
    expect(matches![1].id).toBe("nested");
    expect(matches![2].id).toBe("nested-sub");
  });

  it("should match nested path with single dynamic segment", () => {
    const matches = matchTrie(routesTrie, "/nested/dynamic");
    expect(matches!.length).toBe(3);
    expect(matches![0].id).toBe("root");
    expect(matches![1].id).toBe("nested");
    expect(matches![2].id).toBe("nested-dynamic");
  });

  it("should match nested path with dual dynamic segments", () => {
    const matches = matchTrie(routesTrie, "/nested/dynamic/dynamic");
    expect(matches!.length).toBe(3);
    expect(matches![0].id).toBe("root");
    expect(matches![1].id).toBe("nested");
    expect(matches![2].id).toBe("nested-dual-dynamic");
  });

  it("should match catch-all at root", () => {
    const matches = matchTrie(routesTrie, "/catch-all");
    expect(matches!.length).toBe(2);
    expect(matches![0].id).toBe("root");
    expect(matches![1].id).toBe("catch-all");
  });

  it("should match nested nested index", () => {
    const matches = matchTrie(routesTrie, "/nested-nested");
    expect(matches!.length).toBe(3);
    expect(matches![0].id).toBe("root");
    expect(matches![1].id).toBe("nested-nested");
    expect(matches![2].id).toBe("nested-nested-index");
  });

  it("should match nested nested path with single static segment", () => {
    const matches = matchTrie(routesTrie, "/nested-nested/sub");
    expect(matches!.length).toBe(3);
    expect(matches![0].id).toBe("root");
    expect(matches![1].id).toBe("nested-nested");
    expect(matches![2].id).toBe("nested-nested-sub");
  });

  it("should match nested nested path with single dynamic segment", () => {
    const matches = matchTrie(routesTrie, "/nested-nested/dynamic");
    expect(matches!.length).toBe(3);
    expect(matches![0].id).toBe("root");
    expect(matches![1].id).toBe("nested-nested");
    expect(matches![2].id).toBe("nested-nested-dynamic");
  });

  it("should match nested nested path with dual dynamic segments", () => {
    const matches = matchTrie(routesTrie, "/nested-nested/dynamic/dynamic");
    expect(matches!.length).toBe(4);
    expect(matches![0].id).toBe("root");
    expect(matches![1].id).toBe("nested-nested");
    expect(matches![2].id).toBe("nested-nested-dynamic");
    expect(matches![3].id).toBe("nested-nested-dual-dynamic");
  });

  it("should match catch-all at root", () => {
    const matches = matchTrie(routesTrie, "/catch-all");
    expect(matches!.length).toBe(2);
    expect(matches![0].id).toBe("root");
    expect(matches![1].id).toBe("catch-all");
  });
});
