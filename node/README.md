This tool converts a JSON config file, and one or more CSV or Excel documents, into a CAPE JSON file.

Much of the config file is passed through to the final JSON file.

The top-level of the JSON config file is an object with a single parameter "datasets".

"datasets" is an array of objects. Currently, the system only understands a single dataset but this may change in a future version.

All properties are optional unless marked "Required".

Properties in the dataset object
* Properties used by the NODE mapper:
  * format - The format of the tabular data. Allowed values: 'xlsx', 'csv'. Default: 'csv'.
  * fields - Required. An array of field description objects (see below).
* Used by the PHP mapper only.
  * data_dir - String. Ignored. 
  * base_file_name - String|Array of String. Ignored.
* Used by CAPE, checked and passed through as-is by the mapper
  * title - Required. String. Title of the dataset.
  * id_field - Required. String. The ID of a field that is to be used for the record IDs
  * sort - Required. Array of Strings. A list of the IDs one or more field that will be used to sort the dataset.
  * result_mode - Allowed values 'search', 'filter'. Default: 'filter.

Properties in the field object:
* id - String. Required. Must be unique within this dataset. 
* type - String. Allowed values: 'string', 'date', 'integer', 'enum', 'ignore'. Ignore is used to indicate source headings to intentionally ignore as an unreferenced heading will generate a warning. Ignored fields are not included in the output JSON.
* multiple - Boolean. Default: false. Indicates if the values are single or a list.
* source_heading - String. Indicates the column heading(s) to take the value of this field from. This may be a list of columns if so then all values are returned if the field is multiple, or the first non-null value if it is not. Any columns with this heading plus a space and number are also added. So "Author" would include values from "Author 1", "Author 2" etc. This field may also be set to 'AUTO' in which case the values will be automatically set as a sequence of integers. This is a work around for datasets without a unique ID but is not recommended as deletions will renumber records. 
* source_split - String. A regular expression used to split values for a multiple field. If multiple headings are specified this will apply to all the values. eg. '/s*;/s*'
* source_chars - Integer. If set, this will trim the length of values. A use for this is to convert ISO dates in the form 2020-03-04 into years by setting source_chars to 4.

Additional properties ignored by the mapper, passed through to the site JSON
* label - String. Required by CAPE but may be omitted for "ignore" fields in the mapper.
* placeholder->{is} - String. used as a placeholder text in the input for the field in "is" mode.
* placeholder->{between} - Array of exactly 2 strings for the placeholder for the minimum and maximum fields.
* default - Array of one or more strings. 
** On text filters the first value only is the default
** On integer and date "is" filters then the first value in the array is the default
** On integer and date "between" filters then the first and second values in the array are the defaults
** On enum "is" filters, then the first value in the array is the default
** On enum "one-of" filters, then all the values are the default
* change_filter_mode - Boolean. Default true. If set to false then the filter mode can't be altered.
* description - String. A longer description of the field used in mouse over or whatever the template wants.                
* quick_search - Boolean. Default false. If true, this field will appear in the quick search in the UX. It is visible without selecting "advanced search".
* style->{is} - type=enum only. One of "radio" or "select". Default "select". Pick the UI for selecting a value.
* style->{one-of} - type=enum only. One of "checkbox" and "multiselect". Default "multiselect". Pick the UI for selecting multiple values.  
* min - type=integer only. Integer. Minimum value allowed in input.
* max - type=integer only. Integer. Maximum value allowed in input.
* step - type=integer only. Integer. Step value for input. Use, for example, to make allowed values multiples of 100.

Notes:
* integer fields will be forced to be integers. 
