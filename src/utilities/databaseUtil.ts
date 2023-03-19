import { Connection } from './../model/Connection';
import * as vscode from 'vscode';
import * as mysql from 'mysql2';

export async function testConnection(connection: Connection, context: vscode.ExtensionContext) {
    switch (connection.databaseDriver) {
        case 'mysql':
            mysqlTestConnection(connection, context);
            break;

        default:
            vscode.window.showErrorMessage(`sorry we do not support ${connection.databaseDriver} database driver yet!`);
            break;
    }
}

function mysqlTestConnection(connection: Connection, context: vscode.ExtensionContext) {
    const testConnection = mysql.createConnection({
        host: connection.host,
        port: connection.port,
        user: connection.username,
        password: connection.password,
        database: connection.database
    });

    testConnection.connect(err => {
        if (err) {
            vscode.window.showErrorMessage('Connection failed: ' + err.message);
            return;
        }
        vscode.window.showInformationMessage('Connected successfully!');
    })
}