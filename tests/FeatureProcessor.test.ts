import { Feature, Document, Rule, Tag } from "gherkin-ast"
import { FeatureProcessor } from "../src/FeatureProcessor"

describe("FeatureProcessor", () => {
     let document1: Document;
     let document2: Document;
     let feature1: Feature;
     let feature2: Feature;
     let rule: Rule;
     let tag: Tag;

     beforeEach(() => {
         feature1 = new Feature("1", "2", "3");
         feature2 = new Feature("4", "5", "6");
         document1 = new Document("1");
         document2 = new Document("2");
         rule = new Rule("r1", "r2", "r3")
         tag = new Tag("t1");
         feature1.elements.push(rule);
         feature1.tags.push(tag);
         document1.feature = feature1;
         document2.feature = feature2;
     })

     test("should handle if no pre/post-filter or event handler is set", () => {
        const featureProcessor = new FeatureProcessor();
        const result = featureProcessor.execute(feature1, document1);
        expect(result).toEqual([feature1]);
    });

    test("should filter by pre-filter", () => {
        const onFeature = jest.fn();
        const featureProcessor = new FeatureProcessor({
            preFeature(e: Feature): boolean {
                return e.name === "5"
            },
            onFeature
        });
        const result1 = featureProcessor.execute(feature1, document1);
        const result2 = featureProcessor.execute(feature2, document2);
        expect(result1).toEqual(null);
        expect(result2).toEqual([feature2]);
    });
    
    test("should filter by post-filter", () => {
        const onFeature = jest.fn();
        const featureProcessor = new FeatureProcessor({
            onFeature,
            postFeature(e: Feature): boolean {
                return e.name === "2"
            },
        });
        const result1 = featureProcessor.execute(feature1, document1);
        const result2 = featureProcessor.execute(feature2, document2);
        expect(result1).toEqual([feature1]);
        expect(result2).toEqual(null);
    });

    test("should handle when processing returns array", () => {
        const featureProcessor = new FeatureProcessor({
            onFeature(e: Feature): Feature[] {
                const f = e.clone();
                return [f,f];
            },
            postFeature(_e: Feature): boolean {
                return true
            },
        });
        const result1 = featureProcessor.execute(feature1, document1);
        expect(result1).toEqual([feature1, feature1]);
    });

    test("should handle when processing returns single feature", () => {
        const featureProcessor = new FeatureProcessor({
            onFeature(e: Feature): Feature {
                return e;
            },
            postFeature(_e: Feature): boolean {
                return true
            },
        });
        const result1 = featureProcessor.execute(feature1, document1);
        expect(result1).toEqual([feature1]);
    });

    test("should handle null", ()=> {
        const onFeature = jest.fn()
        const featureProcessor = new FeatureProcessor({
            preFeature():boolean {
                return false;
            },
            onFeature
        });
        
        const result = featureProcessor.execute(feature1, document1);
        expect(result).toBeNull()
    })
})