const {parse: CSVParse} = require('csv-parse/sync');
const xlsx = require('node-xlsx').default;

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
            table = CSVParse(bytestream, {
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

module.exports = BufferToTable;