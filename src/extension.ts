// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import { getWebviewContent } from "./ui/getWebviewContent";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "keyword-search-database" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('keyword-search-database.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from Keyword Search Database!');
	});

	let openTabConnectionManager = vscode.commands.registerCommand('keyword-search-database.tabConnectionManager', () => {
		const panel = vscode.window.createWebviewPanel(
			'connectionManagerWebview',
			'Connection Manager Webview',
			vscode.ViewColumn.One,
			{
				// Enable JavaScript in the webview
				enableScripts: true,
				// Restrict the webview to only load resources from the `out` directory
				localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, "out")],
			}
		);
		panel.webview.html = getWebviewContent(panel.webview, context);
		// panel.reveal();
	});

	context.subscriptions.push(disposable, openTabConnectionManager);
}

// This method is called when your extension is deactivated
export function deactivate() {}
