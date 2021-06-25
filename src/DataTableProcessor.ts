import { DataTable, Step } from "gherkin-ast";
import { PreCompiler, SingleControlType } from "./PreCompiler";
import { Processor } from "./Processor";
import { TableRowProcessor } from "./TableRowProcessor";
import { getDebugger } from "./debug";

const debug = getDebugger("DataTableProcessor");

export class DataTableProcessor extends Processor<DataTable, Step> {
    private tableRowProcessor: TableRowProcessor<DataTable>

    constructor(preCompiler?: Partial<PreCompiler>) {
        debug("constructor(%o)", preCompiler);
        super(preCompiler);
        this.tableRowProcessor = new TableRowProcessor<DataTable>(preCompiler);
    }

    protected preFilter(e: DataTable, p: Step): boolean {
        /* istanbul ignore next */
        debug(
            "preFilter(hasPreDataTable: %s, e: %s, p: %s)", 
            !!this.preCompiler.postDataTable, e?.constructor.name, p?.constructor.name
        );
        return !this.preCompiler.preDataTable || this.preCompiler.preDataTable(e, p);
    }
    protected postFilter(e: DataTable, p: Step): boolean {
        /* istanbul ignore next */
        debug(
            "postFilter(hasPostDataTable: %s, e: %s, p: %s)", 
            !!this.preCompiler.postDataTable, e?.constructor.name, p?.constructor.name
        );
        return !this.preCompiler.postDataTable || this.preCompiler.postDataTable(e, p);
    }
    protected process(e: DataTable, p: Step): SingleControlType<DataTable> {
        /* istanbul ignore next */
        debug(
            "process(hasOnDataTable: %s, e: %s, p: %s)", 
            !!this.preCompiler.onDataTable, e?.constructor.name, p?.constructor.name
        );
        let dataTable: SingleControlType<DataTable> = e;
        if (this.preCompiler.onDataTable) {
            const result = this.preCompiler.onDataTable(e, p);
            if (typeof result !== "undefined") {
                dataTable = result;
            }
        }
        if (dataTable) {
            debug("...rows %s", Array.isArray(dataTable.rows));
            dataTable.rows = this.tableRowProcessor.execute(dataTable.rows, dataTable);
        }
        return dataTable;
    }
}