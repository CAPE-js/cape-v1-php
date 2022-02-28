import {parse} from 'csv-parse/sync';
import xlsx from 'node-xlsx';
import {FormatError} from "./FormatError.js";

class BufferToTable {

    /**
     * Convert incoming data into a two dimensional tabular format. Currently will handle CSV & XLSX.
     * @param {string} format
     * @param {number} bytestream
     * @return {Array.<Array.<string|integer>>}
     * @throws {FormatError}
     */
    static convert(format, bytestream) {
        let table = null;

        switch (format) {

            case 'csv':
                table = parse(bytestream, {
                    skip_empty_lines: true
                });
                break;
            case 'xlsx':
                let workbook = xlsx.parse(bytestream);
                table = workbook[0]['data'];
                break;
            default:
                throw new FormatError("Unsupported tabular format: " + format);
        }

        return table;
    }
}

export {BufferToTable};
