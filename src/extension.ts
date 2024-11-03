import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    handleMainFile(context);

    let c1 = vscode.commands.registerCommand('translate-json-clipboard.html-path', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor && editor.document.fileName.endsWith('.json')) {
            const document = editor.document;
            const selection = editor.selection;
            const text = document.getText(selection);
            const line = document.lineAt(selection.active.line);
            const lineText = line.text;
            let items = getJsonPath(document.getText(),text,lineText);
            if(items.length===0){
                vscode.window.showErrorMessage("Unable to find key path!");
                return;
            }
            const clipboardText = `{{'${items[0].path}' | translate}}`;
            vscode.env.clipboard.writeText(clipboardText);
            if(items.length>1){
                vscode.window.showInformationMessage("Found multible key paths! Copied the first.")
            }else{
                vscode.window.showInformationMessage(`Copied key path: ${items[0].path}`);
            }
        }
    });

    let c2 = vscode.commands.registerCommand('translate-json-clipboard.ts-path', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor && editor.document.fileName.endsWith('.json')) {
            const document = editor.document;
            const selection = editor.selection;
            const text = document.getText(selection);
            const line = document.lineAt(selection.active.line);
            const lineText = line.text;
            let items = getJsonPath(document.getText(),text,lineText);
            if(items.length===0){
                vscode.window.showErrorMessage("Unable to find key path!");
                return;
            }
            const clipboardText = `this.translate.instant('${items[0].path}')`;
            vscode.env.clipboard.writeText(clipboardText);
            if(items.length>1){
                vscode.window.showInformationMessage("Found multible key paths! Copied the first.")
            }else{
                vscode.window.showInformationMessage(`Copied key path: ${items[0].path}`);
            }
        }
    });

    let c3 = vscode.commands.registerCommand('translate-json-clipboard.key-path', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor && editor.document.fileName.endsWith('.json')) {
            const document = editor.document;
            const selection = editor.selection;
            const text = document.getText(selection);
            const line = document.lineAt(selection.active.line);
            const lineText = line.text;
            let items = getJsonPath(document.getText(),text,lineText);
            if(items.length===0){
                vscode.window.showErrorMessage("Unable to find key path!");
                return;
            }
            const clipboardText = `${items[0].path}`;
            vscode.env.clipboard.writeText(clipboardText);
            if(items.length>1){
                vscode.window.showInformationMessage("Found multible key paths! Copied the first.");
            }else{
                vscode.window.showInformationMessage(`Copied key path: ${items[0].path}`);
            }
        }
    });

    context.subscriptions.push(c1);
	context.subscriptions.push(c2);
    context.subscriptions.push(c3);
}

function handleMainFile(context: vscode.ExtensionContext){
    const config = vscode.workspace.getConfiguration('translatejsonclipboard');
    const mainFile = config.get('mainTranslateFile');
    const fileName = config.get('mainTranslateFileName');

    let filepath : string | undefined = undefined;
    if(typeof mainFile === "string" && mainFile.trim().length>0 && fs.existsSync(mainFile)){
        filepath = mainFile;
    }else if(typeof mainFile === "string" && mainFile.trim().length>0 && !fs.existsSync(mainFile)){
        vscode.window.showErrorMessage("Invalid path to translation file!");
        config.update('mainTranslateFile','');
    }
    if(!filepath && typeof fileName === "string" && fileName.trim().length>0){
        filepath = searchMainFile(fileName);
        if(filepath && fs.existsSync(filepath)){
            config.update('mainTranslateFile',filepath);
            vscode.window.showInformationMessage("Translation file path was updated\n"+filepath);
        }
    }

    let c4 = vscode.commands.registerCommand('translate-json-clipboard.file-replace', () => {
        const editor = vscode.window.activeTextEditor;

        if(!filepath || !fs.existsSync(filepath)){
            vscode.window.showErrorMessage("Invalid path to translation file!");
            return;
        }

        let file = JSON.parse(fs.readFileSync(filepath).toString());

        if (file && editor && (editor.document.fileName.endsWith('.html') || editor.document.fileName.endsWith('.ts'))) {
            const document = editor.document;
            const selection = editor.selection;
            const text = document.getText(selection);
            let items = iterateJsonFindeValue(file,[],text);
            if(items.length===0){
                vscode.window.showErrorMessage("No matching value was found!");
                return;
            }
            let replace = items[0].path;
            if(editor.document.fileName.endsWith('.html')){replace = `{{'${items[0].path}' | translate}}`;}
            if(editor.document.fileName.endsWith('.ts')){replace = `this.translate.instant('${items[0].path}')`;}
            const start = selection.start;
            const end = selection.end;
            const before = start.character > 0 ? document.getText(new vscode.Range(start.translate(0, -1), start)) : '';
            const after = end.character < document.lineAt(end.line).text.length ? document.getText(new vscode.Range(end, end.translate(0, 1))) : '';
            const isQuoteBefore = before === '"' || before === "'";
            const isQuoteAfter = after === '"' || after === "'";
            const newStart = isQuoteBefore ? start.translate(0, -1) : start;
            const newEnd = isQuoteAfter ? end.translate(0, 1) : end;
            const newRange = new vscode.Range(newStart, newEnd);
            editor.edit(editBuilder => {
                editBuilder.replace(newRange, replace);
            });
        }
    });

    context.subscriptions.push(c4);


}

function searchMainFile(filename:string):undefined | string{
    vscode.window.showInformationMessage("Started auto search for en.json file...");
    const projectPath = getCurrentWorkspacePath();
    if(!projectPath){return undefined;}
    return findFileSync(projectPath,filename);
}

function getCurrentWorkspacePath(): string | undefined {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length > 0) {
        return workspaceFolders[0].uri.fsPath;
    }
    return undefined;
}

function getJsonPath(jsonBody:string,key:string,line:string):any[]{
    let jsonObj = JSON.parse(jsonBody);
    let serachValue = "";
    let msp = line.split(":");
    msp.shift();
    let value : string = msp.join(":");
    serachValue =value.substring(value.indexOf("\"")+1,value.lastIndexOf("\""));
    let items = iterateJson(jsonObj,[],key,serachValue);
    return items;
}

function iterateJson(obj: any, path: string[] = [],searchKey:string,serachValue:string):any[] {
    let items : any[] = [];
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const newPath = path.concat(key);
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                let de = iterateJson(obj[key], newPath,searchKey,serachValue);
                items.push(... de);
            } else{
                let normalizedKey = obj[key].toString().replace(/\r\n/g, '\n');
                let normalizedSearchValue = serachValue.replace(/\r\n/g, '\n');
                normalizedKey = normalizedKey.replace(/\"/g, "\\\"");
                normalizedKey = normalizedKey.replace(/\n/g, "\\n");
                if(key===searchKey && normalizedKey === normalizedSearchValue) {
                    let item = {
                        value:obj[key],
                        path:newPath.join('.'),
                        key:key
                    };
                    items.push(item);
                }
            }
        }
    }
    return items;
}

function iterateJsonFindeValue(obj: any, path: string[] = [],serachValue:string):any[] {
    let items : any[] = [];
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const newPath = path.concat(key);
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                let de = iterateJsonFindeValue(obj[key], newPath,serachValue);
                items.push(... de);
            } else{
                let normalizedKey = obj[key].toString().replace(/\r\n/g, '\n');
                let normalizedSearchValue = serachValue.replace(/\r\n/g, '\n');
                normalizedKey = normalizedKey.replace(/\"/g, "\\\"");
                normalizedKey = normalizedKey.replace(/\n/g, "\\n");
                if(normalizedKey === normalizedSearchValue) {
                    let item = {
                        value:obj[key],
                        path:newPath.join('.'),
                        key:key
                    };
                    items.push(item);
                }
            }
        }
    }
    return items;
}

function findFileSync(directory: string, fileName: string): string | undefined {
    const files = fs.readdirSync(directory, { withFileTypes: true });
    for (const file of files) {
        const fullPath = path.join(directory, file.name);

        if (file.isDirectory()) {
            const result = findFileSync(fullPath, fileName);
            if (result) {
                return result;
            }
        } else if (file.name === fileName) {
            return fullPath;
        }
    }
    return undefined;
}

export function deactivate() {}
