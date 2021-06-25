import { DataTable, Step, TableCell, TableRow } from "gherkin-ast";
import { DataTableProcessor } from "../src/DataTableProcessor";
import { SingleControlType } from "../src/PreCompiler";

describe("DataTableProcessor", () => {
    let rows: TableRow[];
    let dataTable: DataTable;
    let step: Step;

    beforeEach(() => {
        rows = [
            new TableRow(),
            new TableRow(),
        ];
        dataTable = new DataTable(rows);
        step = new Step("Given", "step");
        step.dataTable = dataTable;
    });

    test("should work if no pre/post-filter or event handler is set", () => {
        const dataTableProcessor = new DataTableProcessor();
        const result = dataTableProcessor.execute(dataTable, step);

        expect(result).toEqual(dataTable);
    });

    test("should filter by pre-filter", () => {
        const onDataTable = jest.fn();
        const dataTableProcessor = new DataTableProcessor({
            preDataTable(_e: DataTable): boolean {
                return false;
            },
            onDataTable,
        });
        const result = dataTableProcessor.execute(dataTable, step);

        expect(result).toBeNull();
        expect(onDataTable).not.toHaveBeenCalled();
    });

    test("should filter by post-filter", () => {
        const onDataTable = jest.fn();
        const dataTableProcessor = new DataTableProcessor({
            postDataTable(_e: DataTable): boolean {
                return false;
            },
            onDataTable,
        });
        const result = dataTableProcessor.execute(dataTable, step);

        expect(result).toBeNull();
        expect(onDataTable).toHaveBeenCalledWith(dataTable, step);
    });

    test("should process with event handler", () => {
        const onTableRow = jest.fn();
        const dataTableProcessor = new DataTableProcessor({
            onDataTable(_e: DataTable): SingleControlType<DataTable> {
                return null;
            },
            onTableRow,
        });
        const result = dataTableProcessor.execute(dataTable, step);

        expect(result).toBeNull();
        expect(onTableRow).not.toHaveBeenCalled();
    });

    test("should process rows", () => {
        const dataTableProcessor = new DataTableProcessor({
            onDataTable(e: DataTable): void {
                e.rows.push(new TableRow([]));
            },
            onTableRow(e: TableRow): void {
                e.cells.push(new TableCell("new"));
            },
        });
        const result = dataTableProcessor.execute(dataTable, step);

        expect(result.rows).toHaveLength(3);
        for (const row of result.rows) {
            expect(row.cells).toHaveLength(1);
            expect(row.cells[0].value).toBe("new");
        }
    });
});