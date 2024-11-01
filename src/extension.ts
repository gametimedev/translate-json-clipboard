import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	console.log("translate-json-clipboard is active!");

    let c1 = vscode.commands.registerCommand('translate-json-clipboard.html-path', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor && editor.document.fileName.endsWith('en.json')) {
            const document = editor.document;
            const selection = editor.selection;
            const text = document.getText(selection);
            const line = document.lineAt(selection.active.line);
            const lineText = line.text;
            let items = getJsonPath(document.getText(),text,lineText);
            if(items.length==0){
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
        if (editor && editor.document.fileName.endsWith('en.json')) {
            const document = editor.document;
            const selection = editor.selection;
            const text = document.getText(selection);
            const line = document.lineAt(selection.active.line);
            const lineText = line.text;
            let items = getJsonPath(document.getText(),text,lineText);
            if(items.length==0){
                vscode.window.showErrorMessage("Unable to find key path!");
                return;
            }
            const clipboardText = `this.translate.instance('${items[0].path}')`;
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
        if (editor && editor.document.fileName.endsWith('en.json')) {
            const document = editor.document;
            const selection = editor.selection;
            const text = document.getText(selection);
            const line = document.lineAt(selection.active.line);
            const lineText = line.text;
            let items = getJsonPath(document.getText(),text,lineText);
            if(items.length==0){
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
            } else if(key==searchKey && obj[key]==serachValue) {
                let item = {
                    value:obj[key],
                    path:newPath.join('.'),
                    key:key
                }
                items.push(item);
            }
        }
    }
    return items;
}

export function deactivate() {}
