import { Feature, Tag } from "gherkin-ast";
import { MultiControlType } from "../src/PreCompiler";
import { TagProcessor } from "../src/TagProcessor";

describe("TagProcessor", () => {
    let feature: Feature;
    let tags: Tag[];

    beforeEach(() => {
        tags = [
            new Tag("tag", "1"),
            new Tag("tag", "2"),
            new Tag("tag", "3"),
        ]
        feature = new Feature("Feature", "Test", "");
        feature.tags = tags;
    });

    test("should handle if no pre/post-filter or event handler is set", () => {
        const tagProcessor = new TagProcessor<Feature>();
        const results = tagProcessor.execute(tags, feature);

        expect(results).toEqual(tags);
    });

    test("should filter by pre-filter", () => {
        const tagProcessor = new TagProcessor<Feature>({
            preTag(e: Tag): boolean {
                return e.value !== "2";
            },
            onTag(e: Tag): MultiControlType<Tag> {
                e.value = String(+e.value * 2);
            }
        });
        const results = tagProcessor.execute(tags, feature);

        expect(results).toHaveLength(2);
        expect(results[0].value).toBe("2");
        expect(results[1].value).toBe("6");
    });

    test("should filter by post-filter", () => {
        const tagProcessor = new TagProcessor<Feature>({
            postTag(e: Tag): boolean {
                return e.value !== "2";
            },
            onTag(e: Tag): MultiControlType<Tag> {
                e.value = String(+e.value * 2);
            }
        });
        const results = tagProcessor.execute(tags, feature);

        expect(results).toHaveLength(2);
        expect(results[0].value).toBe("4");
        expect(results[1].value).toBe("6");
    });

    test("should process with event handler", () => {
        const tagProcessor = new TagProcessor<Feature>({
            onTag(e: Tag): MultiControlType<Tag> {
                e.value = String(+e.value * 2);
            }
        });
        const results = tagProcessor.execute(tags, feature);

        expect(results).toHaveLength(3);
        expect(results[0].value).toBe("2");
        expect(results[1].value).toBe("4");
        expect(results[2].value).toBe("6");
    });
});