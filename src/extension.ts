// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import { v4 as uuidv4 } from "uuid";
import { getConnectionDetailWebviewContent } from "./ui/getWebviewContent";
import { ConnectionDataProvider } from "./providers/ConnectionDataProvider";
import { Connection } from './model/Connection';
import {testConnection} from './utilities/databaseUtil';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	let panelConnectionDetail: vscode.WebviewPanel | undefined = undefined;

	let state = context.globalState;

	let connectionList: Connection[] = JSON.parse(state.get('connectionList') ?? '[]');

	const connectionDataProvider = new ConnectionDataProvider(connectionList);

	const treeViewConnectionList = vscode.window.createTreeView("connectionManager.connectionsList", {
		treeDataProvider: connectionDataProvider,
		showCollapseAll: false,
	})

	const openConnection = vscode.commands.registerCommand("connectionManager.showConnectionDetailView", () => {
		const selectedTreeViewItem = treeViewConnectionList.selection[0];
		const matchingConnection = connectionList.find((connection) => connection.id === selectedTreeViewItem.id);
		if (!matchingConnection) {
			vscode.window.showErrorMessage("No matching connection found!");
			return;
		}

		if (!panelConnectionDetail) {
			panelConnectionDetail = vscode.window.createWebviewPanel(
				'connectionDetailWebview',
				matchingConnection.connectionName,
				vscode.ViewColumn.One,
				{
					// Enable JavaScript in the webview
					enableScripts: true,
					// Restrict the webview to only load resources from the `out` directory
					localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, "out")],
				}
			);
		}
		panelConnectionDetail.title = matchingConnection.connectionName;
		panelConnectionDetail.webview.html = getConnectionDetailWebviewContent(panelConnectionDetail.webview, context, matchingConnection);

		// If a panel is open and receives an update message, update the notes array and the panel title/html
		panelConnectionDetail.webview.onDidReceiveMessage((message) => {
			const command = message.command;
			const connection = message.connection;
			switch (command) {
				case "updateConnection":
					const updatedNoteId = connection.id;
					const copyOfConnctionsArray = [...connectionList];
					const matchingNoteIndex = copyOfConnctionsArray.findIndex((connection) => connection.id === updatedNoteId);
					copyOfConnctionsArray[matchingNoteIndex] = connection;
					connectionList = copyOfConnctionsArray;
					state.update('connectionList', JSON.stringify(connectionList));
					connectionDataProvider.refresh(connectionList);
					vscode.window.showInformationMessage("Connection save successfully!");
					panelConnectionDetail
						? ((panelConnectionDetail.title = connection.connectionName),
							(panelConnectionDetail.webview.html = getConnectionDetailWebviewContent(panelConnectionDetail.webview, context, connection)))
						: null;
					break;
				case 'testConnection':
					testConnection(connection, context);
			}
		});
		panelConnectionDetail.onDidDispose(
			() => {
				// When the panel is closed, cancel any future updates to the webview content
				panelConnectionDetail = undefined;
			},
			null,
			context.subscriptions
		);
	});

	// Command to create a new connection
	const createConnection = vscode.commands.registerCommand("connectionManager.createConnection", () => {
		const id = uuidv4();

		const newConnection: Connection = {
			id: id,
			connectionName: 'New connection',
			databaseDriver: '',
			host: '',
			port: 0,
			username: '',
			password: '',
			database: '',
			isActive: false,
		};

		connectionList.push(newConnection);
		state.update('connectionList', JSON.stringify(connectionList));
		connectionDataProvider.refresh(connectionList);
	});

	// Command to delete a given note
	const deleteConnection = vscode.commands.registerCommand("connectionManager.deleteConnection", (node: Connection) => {
		const selectedTreeViewItem = node;
		const selectedNoteIndex = connectionList.findIndex((connection) => connection.id === selectedTreeViewItem.id);
		connectionList.splice(selectedNoteIndex, 1);
		connectionDataProvider.refresh(connectionList);

		// Close the panel if it's open
		panelConnectionDetail?.dispose();
	});

	context.subscriptions.push(openConnection);
	context.subscriptions.push(createConnection);
	context.subscriptions.push(deleteConnection);
}

// This method is called when your extension is deactivated
export function deactivate() { }
