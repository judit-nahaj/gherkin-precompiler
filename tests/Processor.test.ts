import { MultiControlType } from "../src/PreCompiler";
import { ListProcessor, Processor } from "../src/Processor"

class Child {
    constructor(public property: string) { }
}

class Parent {
    constructor(public child: Child) { }
}

class List {
    constructor(public items: Child[]) { }
}

describe("Processors", () => {
    describe("Processor", () => {
        let child: Child;
        let parent: Parent;

        beforeEach(() => {
            child = new Child("child");
            parent = new Parent(child);
        });

        test("should handle missing element", () => {
            class EmptyProcessor extends Processor<Child, Parent> {
                protected preFilter(_e: Child, _p: Parent): boolean {
                    return true;
                }
                protected postFilter(_e: Child, _p: Parent): boolean {
                    return true;
                }
                protected process(_e: Child, _p: Parent): Child {
                    return new Child("new");
                }
            }

            const processor = new EmptyProcessor({});
            const result = processor.execute(null, parent);

            expect(result).toBeNull();
        })

        test("should filter out single property via pre-filter", () => {
            class PreFilterProcessor extends Processor<Child, Parent> {
                protected preFilter(_e: Child, _p: Parent): boolean {
                    return false;
                }
                protected postFilter(_e: Child, _p: Parent): boolean {
                    return true;
                }
                protected process(_e: Child, _p: Parent): Child {
                    return new Child("new");
                }
            }

            const processor = new PreFilterProcessor({});
            const result = processor.execute(child, parent);

            expect(result).toBeNull();
        });

        test("should filter out single property via post-filter", () => {
            class PostFilterProcessor extends Processor<Child, Parent> {
                protected preFilter(_e: Child, _p: Parent): boolean {
                    return true;
                }
                protected postFilter(_e: Child, _p: Parent): boolean {
                    return false;
                }
                protected process(_e: Child, _p: Parent): Child {
                    return new Child("new");
                }
            }

            const processor = new PostFilterProcessor({});
            const result = processor.execute(child, parent);

            expect(result).toBeNull();
        });

        test("should filter out single property by event handler", () => {
            class EventHandlerProcessor extends Processor<Child, Parent> {
                protected preFilter(_e: Child, _p: Parent): boolean {
                    return true;
                }
                protected postFilter(_e: Child, _p: Parent): boolean {
                    return true;
                }
                protected process(_e: Child, _p: Parent): Child {
                    return null;
                }
            }

            const processor = new EventHandlerProcessor({});
            const result = processor.execute(child, parent);

            expect(result).toBeNull();
        });

        test("should return result of processing", () => {
            class ResultProcessor extends Processor<Child, Parent> {
                protected preFilter(_e: Child, _p: Parent): boolean {
                    return true;
                }
                protected postFilter(_e: Child, _p: Parent): boolean {
                    return true;
                }
                protected process(_e: Child, _p: Parent): Child {
                    return new Child("new");
                }
            }

            const processor = new ResultProcessor({});
            const result = processor.execute(child, parent);

            expect(result.property).toBe("new");
        });

        test("should have idempotet processor", () => {
            class IdempotentProcessor extends Processor<Child, Parent> {
                protected preFilter(e: Child, p: Parent): boolean {
                    // @ts-ignore
                    expect(e, "Element should be passed to pre-filter").toBe(child);
                    // @ts-ignore
                    expect(p, "Parent should be passed to pre-filter").toBe(parent);
                    return true;
                }
                protected postFilter(e: Child, p: Parent): boolean {
                    // @ts-ignore
                    expect(e, "Element should be passed to post-filter").toBe(child);
                    // @ts-ignore
                    expect(p, "Parent should be passed to post-filter").toBe(parent);
                    return true;
                }
                protected process(e: Child, p: Parent): Child {
                    // @ts-ignore
                    expect(e, "Element should be passed to process").toBe(child);
                    // @ts-ignore
                    expect(p, "Parent should be passed to process").toBe(parent);
                    return undefined;
                }
            }

            const processor = new IdempotentProcessor();
            const result = processor.execute(child, parent);

            expect(result).toBe(child);
            expect(parent.child).toBe(child);
        });
    });

    describe("ListProcessor", () => {
        let items: Child[];
        let list: List;

        beforeEach(() => {
            items = [
                new Child("1"),
                new Child("2"),
                new Child("3"),
            ];
            list = new List(items);
        })

        test("should handle incorrect input, i.e. not an array", () => {
            class ErrorListProcessor extends ListProcessor<Child, List> {
                protected preFilter(_e: Child, _p: List, _i: number): boolean {
                    throw new Error("Method not implemented.");
                }
                protected postFilter(_e: Child, _p: List, _i: number): boolean {
                    throw new Error("Method not implemented.");
                }
                protected process(_e: Child, _p: List, _i: number): MultiControlType<Child> {
                    throw new Error("Method not implemented.");
                }
            }

            const processor = new ErrorListProcessor({});
            const result = processor.execute(null, null);

            expect(result).toEqual([]);
        });

        test("should filter items by pre-filter", () => {
            class PreFilterListProcessor extends ListProcessor<Child, List> {
                protected preFilter(e: Child, _p: List, _i: number): boolean {
                    return +e.property > 2;
                }
                protected postFilter(_e: Child, _p: List, _i: number): boolean {
                    return true;
                }
                protected process(_e: Child, _p: List, _i: number): MultiControlType<Child> {
                    return undefined;
                }
            }

            const processor = new PreFilterListProcessor({});
            const result = processor.execute(items, list);

            expect(result).toBeInstanceOf(Array);
            expect(result).toHaveLength(1);
            expect(result[0].property).toBe("3");
        });

        test("should filter items by post-filter", () => {
            class PostFilterListProcessor extends ListProcessor<Child, List> {
                protected preFilter(_e: Child, _p: List, _i: number): boolean {
                    return true;
                }
                protected postFilter(e: Child, _p: List, _i: number): boolean {
                    return +e.property > 2;
                }
                protected process(_e: Child, _p: List, _i: number): MultiControlType<Child> {
                    return undefined;
                }
            }

            const processor = new PostFilterListProcessor({});
            const result = processor.execute(items, list);

            expect(result).toBeInstanceOf(Array);
            expect(result).toHaveLength(1);
            expect(result[0].property).toBe("3");
        });

        test("should filter array of items by post-filter", () => {
            class PostFilterListProcessor extends ListProcessor<Child, List> {
                protected preFilter(_e: Child, _p: List, _i: number): boolean {
                    return true;
                }
                protected postFilter(e: Child, _p: List, _i: number): boolean {
                    return +e.property > 2;
                }
                protected process(_e: Child, _p: List, _i: number): MultiControlType<Child> {
                    return [_e, _e];
                }
            }

            const processor = new PostFilterListProcessor({});
            const result = processor.execute(items, list);

            expect(result).toBeInstanceOf(Array);
            expect(result).toHaveLength(2);
            expect(result[0].property).toBe("3");
            expect(result[1].property).toBe("3");
        });

        test("should filter out array of items by post-filter", () => {
            class PostFilterListProcessor extends Processor<Child, List, MultiControlType<Child>> {
                protected preFilter(_e: Child, _p: List): boolean {
                    return true;
                }
                protected postFilter(e: Child, _p: List): boolean {
                    return +e.property > 3;
                }
                protected process(_e: Child, _p: List): MultiControlType<Child> {
                    return [_e, _e];
                }
            }

            const processor = new PostFilterListProcessor({});
            const result = processor.execute(items[0], list);
            expect(result).toBeNull();
        });

        test("should filter items by event handler", () => {
            class EventHandlerDeleteListProcessor extends ListProcessor<Child, List> {
                protected preFilter(_e: Child, _p: List, _i: number): boolean {
                    return true;
                }
                protected postFilter(_e: Child, _p: List, _i: number): boolean {
                    return true;
                }
                protected process(e: Child, _p: List, _i: number): MultiControlType<Child> {
                    return e.property === "2" ? null : undefined;
                }
            }

            const processor = new EventHandlerDeleteListProcessor({});
            const result = processor.execute(items, list);

            expect(result).toBeInstanceOf(Array);
            expect(result).toHaveLength(2);
            expect(result[0].property).toBe("1");
            expect(result[1].property).toBe("3");
        });

        test("should overwrite an item with a sinlge item by event handler", () => {
            class SingleReplacerListProcessor extends ListProcessor<Child, List> {
                protected preFilter(_e: Child, _p: List, _i: number): boolean {
                    return true;
                }
                protected postFilter(_e: Child, _p: List, _i: number): boolean {
                    return true;
                }
                protected process(e: Child, _p: List, _i: number): MultiControlType<Child> {
                    return e.property === "2" ? new Child("4") : undefined;
                }
            }

            const processor = new SingleReplacerListProcessor({});
            const result = processor.execute(items, list);

            expect(result).toBeInstanceOf(Array);
            expect(result).toHaveLength(3);
            expect(result[0].property).toBe("1");
            expect(result[1].property).toBe("4");
            expect(result[2].property).toBe("3");
        });

        test("should overwrite an item with multiple items by event handler", () => {
            class MultiReplacerListProcessor extends ListProcessor<Child, List> {
                protected preFilter(_e: Child, _p: List, _i: number): boolean {
                    return true;
                }
                protected postFilter(_e: Child, _p: List, _i: number): boolean {
                    return true;
                }
                protected process(e: Child, _p: List, _i: number): MultiControlType<Child> {
                    return e.property === "2" ? [new Child("4"), new Child("5")] : undefined;
                }
            }

            const processor = new MultiReplacerListProcessor({});
            const result = processor.execute(items, list);

            expect(result).toBeInstanceOf(Array);
            expect(result).toHaveLength(4);
            expect(result[0].property).toBe("1");
            expect(result[1].property).toBe("4");
            expect(result[2].property).toBe("5");
            expect(result[3].property).toBe("3");
        });

        test("should have idempotet processor", () => {
            class IdempotentListProcessor extends ListProcessor<Child, List> {
                private checkParameters(e: Child, p: List, i: number): void {
                    // @ts-ignore
                    expect(items, "Child should be passed to pre-filter").toContainEqual(e);
                    // @ts-ignore
                    expect(p, "Parent should be passed to pre-filter").toBe(list);
                    // @ts-ignore
                    expect(i, "Index should be passed to pre-filter").toBeGreaterThanOrEqual(0);
                    // @ts-ignore
                    expect(i, "Index should be passed to pre-filter").toBeLessThan(items.length);
                }

                protected preFilter(e: Child, p: List, i: number): boolean {
                    this.checkParameters(e, p, i);
                    return true;
                }
                protected postFilter(e: Child, p: List, i: number): boolean {
                    this.checkParameters(e, p, i);
                    return true;
                }
                protected process(e: Child, p: List, i: number): Child {
                    this.checkParameters(e, p, i);
                    return undefined;
                }
            }

            const processor = new IdempotentListProcessor();
            const result = processor.execute(items, list);

            expect(result).toEqual(items);
            expect(list.items).toBe(items);
        });

        test("should handle when result is null", () => {
            class NullListProcessor extends ListProcessor<Child, List> {
                protected preFilter(_e: Child, _p: List, _i: number): boolean {
                    return true;
                }
                protected postFilter(_e: Child, _p: List, _i: number): boolean {
                    return true;
                }
                protected process(e: Child, _p: List, _i: number): MultiControlType<Child> {
                    return e.property === "3" ? null : e;
                }
            }

            const processor = new NullListProcessor({});
            const result = processor.execute(items, list);

            expect(result.length).toBe(2);
            expect(result[0].property).toBe("1");
            expect(result[1].property).toBe("2");
        })
    })
});