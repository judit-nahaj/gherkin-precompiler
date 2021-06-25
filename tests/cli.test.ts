import { run, CLIConfig } from "../src/cli";
import { Document, read } from "gherkin-io";
import { rmdirSync, copyFileSync } from "fs";

console.error = jest.fn();
console.log = jest.fn();

describe("CLI", () => {
    let prevArgs: string[];

    beforeEach(() => {
        prevArgs = process.argv;
    });

    afterEach(() => {
        process.argv = prevArgs;
    });

    const runWithArgs = (config: CLIConfig = {}) => {
        config = {
            config: "tests/cli/data/config.json",
            source: "tests/cli/data/source/**/*",
            base: "tests/cli/data/source",
            destination: "tests/cli/data/destination",
            verbose: true,
            clean: true,
            ...config,
        }
        process.argv = Object.keys(config)
            // @ts-ignore
            .filter(name => config[name] !== null)
            // @ts-ignore
            .map(name => `--${name}=${config[name]}`);
        return run();
    }

    const getSources = () => read("tests/cli/data/source/**/*.feature");
    const getResult = (destination = "destination") => read(`tests/cli/data/${destination}/**/*.feature`);
    const deleteDirectory = (dir: string) => {
        rmdirSync(`tests/cli/data/${dir}`, { recursive: true });
    };

    beforeEach(() => {
        deleteDirectory("source/dist");
        (console.log as unknown as jest.Mock).mockClear();
    });

    test("should fail if no config found", async () => {
        await expect(() => runWithArgs({
            config: null,
        })).rejects.toThrow(/Configuration file does not exist: .*precompiler.json!/);
    });

    test("should fail if neither base nor source set", async () => {
        await expect(() => runWithArgs({
            base: null,
            source: null,
        })).rejects.toThrow("Either source of base option must be set!");
    });

    test("should fail if no base set and source is a glob", async () => {
        await expect(() => runWithArgs({
            base: null,
            source: "**/*.feature",
        })).rejects.toThrow("Base must be set in case of source is a pattern!");
    });

    test("should fail if base is set as a glob", async () => {
        await expect(() => runWithArgs({
            base: "**/*.feature",
        })).rejects.toThrow("Base must be a directory, not a glob pattern!");
    });

    test("should fail is base is not a folder", async () => {
        await expect(() => runWithArgs({
            base: "tests/cli/data/source/1.feature",
        })).rejects.toThrow("Base must be a directory!");
    });

    test("should fail if destination is not a directory", async () => {
        await expect(() => runWithArgs({
            destination: "tests/cli/data/source/1.feature",
        })).rejects.toThrow("Destination must be a directory!");
    });

    test("should fail if compilers not set", async () => {
        await expect(() => runWithArgs({
            config: "tests/cli/data/config-no-compiler.json",
        })).rejects.toThrow("Precompilers must be set in the configuration file!");
    });

    test("should fail if any compiler miss path", async () => {
        await expect(() => runWithArgs({
            config: "tests/cli/data/config-wo-path.json",
        })).rejects.toThrow("Package or path of the precompiler must be set!");
    });

    test("should fail if any compiler is neither a package, not a file", async () => {
        await expect(() => runWithArgs({
            config: "tests/cli/data/config-w-directory.json",
        })).rejects.toThrow("Path must be either a NPM package name or a JS file: test/cli/compilers!");
    });

    test("should use source if no base set and source is a directory", async () => {
        await runWithArgs({
            config: "tests/cli/data/config.json",
            base: null,
            source: "tests/cli/data/source",
        });
        const sources: Document[] = await getSources();
        const results: Document[] = await getResult();
        expect(results).toHaveLength(1);
        expect(results[0].feature.name).toMatch(/PROCESSED$/);
        expect(results[0].feature.elements).toEqual(sources[0].feature.elements);
    });

    test("should use dirname of source if no base ser and source if a file", async () => {
        await runWithArgs({
            config: "tests/cli/data/config.json",
            base: null,
            source: "tests/cli/data/source/1.feature",
        });
        const sources: Document[] = await getSources();
        const results: Document[] = await getResult();
        expect(results).toHaveLength(1);
        expect(results[0].feature.name).toMatch(/PROCESSED$/);
        expect(results[0].feature.elements).toEqual(sources[0].feature.elements);
    });

    test("should set source using base", async () => {
        await runWithArgs({
            config: "tests/cli/data/config.json",
            base: "tests/cli/data/source",
            source: null,
        });
        const sources: Document[] = await getSources();
        const results: Document[] = await getResult();
        expect(results).toHaveLength(1);
        expect(results[0].feature.name).toMatch(/PROCESSED$/);
        expect(results[0].feature.elements).toEqual(sources[0].feature.elements);
    });

    test("should set destination if not set based on the base", async () => {
        await runWithArgs({
            config: "tests/cli/data/config.json",
            base: "tests/cli/data/source",
            destination: null,
        });
        const sources: Document[] = await getSources();
        const results: Document[] = await getResult("source/dist");
        expect(results).toHaveLength(1);
        expect(results[0].feature.name).toMatch(/PROCESSED$/);
        expect(results[0].feature.elements).toEqual(sources[0].feature.elements);
    });

    test("should log configuration if verbose set", async () => {
        await runWithArgs({
            config: "tests/cli/data/config.json",
            verbose: false,
        });
        expect(console.log).not.toHaveBeenCalled();

        await runWithArgs({
            config: "tests/cli/data/config.json",
            verbose: true,
        });
        expect(console.log).toHaveBeenCalled();
    });

    test("should use package as compiler", async () => {
        await runWithArgs({
            config: "tests/cli/data/config-w-package.json",
        });
        const sources: Document[] = await getSources();
        const results: Document[] = await getResult();
        expect(results).toHaveLength(1);
        expect(results[0].feature.name).toMatch(/PACKAGE$/);
        expect(results[0].feature.elements).toEqual(sources[0].feature.elements);
    });

    test("should use compiler object", async () => {
        await runWithArgs({
            config: "tests/cli/data/config-w-object.json",
        });
        const sources: Document[] = await getSources();
        const results: Document[] = await getResult();
        expect(results).toHaveLength(1);
        expect(results[0].feature.name).toMatch(/OBJECT$/);
        expect(results[0].feature.elements).toEqual(sources[0].feature.elements);
    });

    test("should fail if compiler is neither class nor object", async () => {
        await expect(() => runWithArgs({
            config: "tests/cli/data/config-w-invalid.json"
        })).rejects.toThrow(/Precompiler \(.*gpc-test-invalid.js\) must be a class or a PreCompiler object: 1!/);
    });

    test("should clean destination directory if clean is set", async () => {
        copyFileSync("tests/cli/data/source/1.feature", "tests/cli/data/destination/1.feature");
        await runWithArgs({
            config: "tests/cli/data/config.json",
            clean: false,
        });
        let results: Document[] = await getResult();
        expect(results).toHaveLength(2);

        await runWithArgs({
            config: "tests/cli/data/config.json",
            clean: true,
        });
        results = await getResult();
        expect(results).toHaveLength(1);
    });

    test("should create destination directory if it does not exist", async () => {
        deleteDirectory("destination");
        await runWithArgs({
            config: "tests/cli/data/config.json",
        });
        const results: Document[] = await getResult();
        expect(results).toHaveLength(1);
    });
});