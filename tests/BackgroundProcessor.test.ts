import { Step, Background, Feature } from "gherkin-ast";
import { BackgroundProcessor } from "../src/BackgroundProcessor";

describe("BackgroundProcessor", () => {
    let background1: Background, background2: Background;
    let feature: Feature;
    let steps: Step[];

    beforeEach(() => {
        steps = [
            new Step("Given", "1"),
            new Step("When", "2"),
            new Step("Then", "3"),
        ];

        background1 = new Background("1", "2", "3");
        background2 = new Background("4", "5", "6");
        feature = new Feature("1", "2", "3");

        background1.steps = steps;
        background2.steps = steps;
        feature.elements.push(background1, background2);

    })

    test("should handle if no pre/post-filter or event handler is set", () => {
        const backgroundProcessor = new BackgroundProcessor<Feature>();
        const results = backgroundProcessor.process(background1, feature);
        expect(results).toEqual(background1);
    });

    test("should filter by pre-filter", () => {
        const backgroundProcessor = new BackgroundProcessor<Feature>({
            preBackground(e: Background): boolean {
                return e.name === "2"
            },
        });
        const result1 = backgroundProcessor.preFilter(background1, feature);
        const result2 = backgroundProcessor.preFilter(background2, feature);
        expect(result1).toBe(true);
        expect(result2).toBe(false);        
    });
    
    test("should filter by post-filter", () => {
        const backgroundProcessor = new BackgroundProcessor<Feature>({
            postBackground(e: Background): boolean {
                return e.keyword === "4"
            },
        });
        const result1 = backgroundProcessor.postFilter(background1, feature);
        const result2 = backgroundProcessor.postFilter(background2, feature);
        expect(result1).toBe(false);
        expect(result2).toBe(true);        
    });
    
    test("should process Backgrounds", () => {
        const backgroundProcessor = new BackgroundProcessor<Feature>({
            onBackground(e: Background): Background {
                e.description += "1"
                return e;
            },
        });
        const result1 = backgroundProcessor.process(background1, feature) as Background;
        const result2 = backgroundProcessor.process(background2, feature) as Background;
        expect(result1.description).toBe("31");
        expect(result2.description).toBe("61");        
    });

    test("should handle null value", () => {
        const backgroundProcessor = new BackgroundProcessor<Feature>({
            onBackground(): Background {
                return null;
            },
        });
        const results = backgroundProcessor.process(background1, feature) as Background;

        expect(results).toBeNull();
    });

    test("should handle steps", () => {
        const backgroundProcessor = new BackgroundProcessor<Feature>({
            onBackground(e: Background) {
                e.name += "PROCESSED";
            },
            onStep(e: Step) {
                e.text += "PROCESSED";
            }
        });
        const result = backgroundProcessor.process(background1, feature) as Background;
        expect(result.name).toContain("PROCESSED");
        expect(result.steps).toHaveLength(3);

        for (const step of result.steps) {
            expect(step.text).toContain("PROCESSED");
        }
    });
});