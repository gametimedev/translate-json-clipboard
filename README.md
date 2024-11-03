# A little helper for copy & past
This extension should make it easier to quickly copy the path for a STRING value of a JSON file.

## How to use | Copy & Paste
Select any key in your json (which has a STRING as value) and press one of the three keyboard shortcuts.
![alt text](https://data.gametimedev.de/other/translate-json-clipboard/example.png)

### For use in HTML
Shortcut: <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>C</kbd><br>
Format: {{'**PATH**' | translate}}<br>
Example: {{'**EXAMPLE.OTHER.TEST**' | translate}}


### For use in TS
Shortcut: <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>X</kbd><br>
Format: this.translate.instant('**PATH**')<br>
Format: this.translate.instant('**EXAMPLE.OTHER.TEST**')

### Only the path
Shortcut: <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Y</kbd><br>
Format: **PATH**<br>
Format: **EXAMPLE.OTHER.TEST**

## How to use | Replace
Mark a section in a HTML or TS file and press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>A</kbd>. The extension will search for an exact match in your main transfer file and insert the first match.

## Limitations
- Works only for STRING values
- If Key and String has multible it will always select the first (even if selected the other one)
- Some problems with special values like \n \r \"...