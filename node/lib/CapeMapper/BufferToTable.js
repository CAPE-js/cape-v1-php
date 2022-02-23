import { parse } from 'csv-parse/sync';
import xlsx from 'node-xlsx';

class BufferToTable {

    /**
     * Convert incoming data into a tabular format. Currently will handle CSV & XLSX. Will return any empty table if
     * the format is unknown.
     * @param {string} format
     * @param {number} bytestream
     * @return {Array.<Array.<string|integer>>}
     */
    static convert(format, bytestream) {
        let table = null;

        if (format === 'csv') {
            table = parse(bytestream, {
                skip_empty_lines: true
            });
        }

        if (format === 'xlsx') {
            let workbook = xlsx.parse(bytestream);
            table = workbook[0]['data'];
        }

        return table;
    }
}

export { BufferToTable };
