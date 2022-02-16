This tool converts a JSON config file, and an Excel document into a CAPE JSON file.

Much of the config file is passed through to the final JSON file.

The top-level of the JSON config file is an object with a single parameter "datasets".

"datasets" is an array of objects. Currently, the system only understands a single dataset but this may change in a future version.

Properties in the dataset object
* Required by the NODE mapper:
** format - The format of the tabular data. Allowed values: 'xlsx', 'csv'. Default: 'csv'.
** fields - Required. An array of field description objects (see below).
* Used by the PHP mapper only.
** data_dir - Optional. String. Ignored. 
** base_file_name - Optional. String|Array of String. Ignored.
* Used by CAPE, checked and passed through as-is by the mapper
** title - Required. String. Title of the dataset.
** id_field - Required. String. The ID of a field that is to be used for the record IDs
** sort - Required. Array of Strings. A list of the IDs one or more field that will be used to sort the dataset.
** result_mode - Optional. Allowed values 'search', 'filter'. Default: 'filter.
 

Properties in the field object:
* id - String. Required. Must be unique within this dataset. 
* type - String. Allowed values: 'string', 'date', 'integer', 'enum', 'ignore'. Ignore is used to indicate source headings to intentionally ignore as an unreferenced heading will generate a warning.
* multiple - Boolean. Default: false. Indicates if the values are single or a list.
* source_heading - String. Optional. Indicates the column heading(s) to take the value of this field from. This may be a list of columns if so then all values are returned if the field is multiple, or the first non-null value if it is not. Any columns with this heading plus a space and number are also added. So "Author" would include values from "Author 1", "Author 2" etc. This field may also be set to 'AUTO' in which case the values will be automatically set as a sequence of integers. This is a work around for datasets without a unique ID but is not recommended as deletions will renumber records. 
* source_split - String. Optional. A regular expression used to split values for a multiple field. If multiple headings are specified this will apply to all the values. eg. '/s*;/s*'

Notes:
* integer fields will be forced to be integers. 

